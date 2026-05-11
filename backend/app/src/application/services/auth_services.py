import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import ExpiredSignatureError, JWTError
from pydantic import EmailStr

from app.src.application.services import retry_on_transient
from app.src.application.services.shared_services import SharedServices
from app.src.core.constants import ConstantsData, ConstantsKeyData
from app.src.core.security import AppSecurity
from app.src.domain.dto.auth_dto import SignUpModelDTO, TokenDTO
from app.src.exceptions.domain_exceptions import (DomainAlreadyExistsError, DomainDeactivatedError, DomainError,
                                                  DomainInvalidCredentialsError, DomainInvalidSignInType,
                                                  DomainJWTExpiredError,
                                                  DomainJWTInvalidError,
                                                  DomainNotFoundError,
                                                  DomainOTPNotExpireError, )
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.auth_schema import LoginRequest, SessionTokenRequest, SignUpRequest, TempUserRequest
from app.src.utils.utility import Utility


# action

class AuthServices(SharedServices):
    
    def __init__(self, uow: SQLUnitOfWork, ):
        
        self.__uow = uow
        self.__verification_token = ConstantsKeyData.COOKIE_VERIFICATION_KEY
        super().__init__(uow)
    
    @retry_on_transient
    async def manual_signup_initiate(self, email: EmailStr | str, old_otp_code: str):
        try:
            
            # get the data from db.
            data = await self.__uow.users.find_record(email)
            
            # then check if the user exists or active.
            # generate a verification token with 24 hours expiration time.
            expiration = 24 * 3600  # 24 hours in seconds
            verification_token = AppSecurity.generate_access_token(jti=str(uuid4()),
                                                                   data={"user_email": email},
                                                                   exp=expiration)
            csrf_token = secrets.token_urlsafe(32)
            if data:
                
                if data.Users.is_deleted:
                    raise DomainDeactivatedError("This email is deactivated.")
                
                raise DomainAlreadyExistsError(message="This email is already exist. Please login instead.")
            
            # check first if there's otp code in that email on redis before proceeding.
            
            if old_otp_code:
                raise DomainOTPNotExpireError(message="Your code is not expired yet.")
            
            # query from temp database
            temp_user_data = await self.__uow.temp_users.find_record(email)
            # generate an otp_code
            otp_code = Utility.generate_otp_code()
            
            # Check if the user email is already verified.
            if temp_user_data:
                if temp_user_data.sign_up_steps == 1:
                    # generate an otp
                    # return the successful response
                    return SuccessfulResponseSchema(message="Verification code sent to your email.",
                                                    otp_code=otp_code,
                                          verification_token=verification_token,
                                          csrf_token=csrf_token,
                                          sign_up_steps=2)
                
                elif temp_user_data.sign_up_steps == 2:
                    # return the successful response
                    return SuccessfulResponseSchema(message="Your email is verified, please proceed to next step.",
                                          verification_token=verification_token,
                                          csrf_token=csrf_token,
                                          sign_up_steps=3)
                else:
                    # otherwise raise an exception
                    raise DomainError
            
            # insert into db
            await self.__uow.temp_users.insert_record(TempUserRequest(email=email.strip()))

            # return the successful response
            return SuccessfulResponseSchema(message="Verification code sent to your email.",
                                  otp_code=otp_code,
                                  verification_token=verification_token,
                                  csrf_token=csrf_token,
                                  sign_up_steps=2)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def verify_signup_otp_code(self, *, otp_code: str,
                                     otp_code_from_redis: str,
                                     email: str):
        try:
            
            # check first if the email is already verified
            temp_users_data = await self.__uow.temp_users.find_record(email)
            
            if not temp_users_data:
                raise DomainNotFoundError(message="Email does not exist.")
            
            if temp_users_data.sign_up_steps == 2:
                return SuccessfulResponseSchema(message="Your email is already verified, please proceed to next step.")
            
            # verify otp
            Utility.verify_otp(otp_code_from_redis, otp_code)
            
            # update the record in db
            await self.__uow.temp_users.update_record(record_id=email)
            response = SuccessfulResponseSchema(message="Successfully verified your email. Please proceed to next step.")
            
            # return the successful response
            return response
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def manual_signup_final_step(self, new_user: SignUpRequest, verification_token: str):
        """
        This function is the final step, which the user will input the password, firstname, middle name and lastname to proceed in homepage.
        :param new_user: The data to be insert in database.
        :param verification_token: verification token that will retrieve in cookie.
        :return: Successful Response Schema
        """
        try:
            
            try:
                payload = AppSecurity.decode_jwt_token(verification_token)
                email: str = payload.get("user_email")
            
            except Exception as e:
                raise DomainInvalidCredentialsError(message="Signup verification failed. Please re-enter your email.", )
            
            # hashe password
            hashed_password = AppSecurity.hash_plain_password(new_user.password)
            # set the password to hashed password
            new_user.password = hashed_password
            # then clean the email if there's space from start and end.
            new_user.email = email.strip()
            
            # insert user into db and return the user to get the id
            user = await self.__uow.users.insert_record(new_user)
            
            user_id = user.id
            # insert data into address and personal info
            await self.__uow.users.insert_personal_info_address(user_id, new_user)
            
            # then delete data from temp user data
            await self.__uow.temp_users.delete_record(email)
            
            # insert the token into db
            access_refresh_token = await self.__insert_session_token(user_id, user.role)
            # prepare the response
            response = SuccessfulResponseSchema(message="Successfully created account.",
                                      access_token=access_refresh_token.access_token,
                                      refresh_token=access_refresh_token.refresh_token,
                                      csrf_token=self.generate_csrf_token())
            return response
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def manual_login(self, *, credentials: LoginRequest):
        try:
            # get the data from db.
            data = await self.__uow.users.find_record_with_password(credentials.email)
            
            if not data:
                raise DomainNotFoundError(message="Email does not exist.")
            
            curr_users = data.Users
            
            if curr_users.is_deleted:
                raise DomainDeactivatedError("This email is deactivated.")
            
            if not curr_users.is_active:
                # send email again
                return SignUpModelDTO(
                        action=ConstantsKeyData.USER_ACTION_EMAIL_VERIFICATION,
                        message="Your account has not been activated yet. Please check your email for the verification link.")
            # hashed password
            hashed_password = curr_users.password
            # check first if the signin_type is password
            if "password" not in curr_users.signin_type:
                raise DomainInvalidSignInType(
                        message="This email is registered with other signin type. Please login with the correct signin type.")
            
            if not AppSecurity.verify_hash_password(credentials.password, hashed_password):
                raise DomainInvalidCredentialsError(message="Incorrect password.")
            
            # insert the token into db
            access_refresh_token = await self.__insert_session_token(curr_users.id, curr_users.role)
            
            # prepare the response
            response = SuccessfulResponseSchema(message="Successfully logged in.",
                                      access_token=access_refresh_token.access_token,
                                      csrf_token=self.generate_csrf_token(),
                                      refresh_token=access_refresh_token.refresh_token)
            return response
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def refresh_token(self, *, refresh_token: str):
        try:
            # decode the token
            payload = AppSecurity.decode_jwt_token(refresh_token)
            
            user_id: str = payload.get("user_id")
            data = await self._check_user_if_exists(user_id)
            
            access_refresh_token = await self.__update_refresh_token(refresh_token, user_id, data.role)
            
            response = SuccessfulResponseSchema(message="Successfully refreshed token.",
                                                access_token=access_refresh_token.access_token,
                                                refresh_token=access_refresh_token.refresh_token,
                                                csrf_token=self.generate_csrf_token())
            return response
        
        except ExpiredSignatureError as e:
            raise DomainJWTExpiredError(message="Refresh token has expired. Please login again.", )
        except JWTError as e:
            raise DomainJWTInvalidError(message="Invalid refresh token. Please login again.", )
        except Exception as e:
            raise e
    
    @staticmethod
    def __generate_access_refresh_token(access_token_data: dict,
                                        refresh_token_data: dict,
                                        token_expiration: int = 15) -> TokenDTO:
        """
        This function is to generate access and refresh token.
        :param access_token_data: To encode and insert into signed token for access token.
        :param refresh_token_data: To encode and insert into signed token for refresh token.
        :param token_expiration: is for expiration in access token and this will be minutes based.
        Default value is 15 minutes.
        :return: Access and refresh token.
        """
        # convert time into seconds
        expires = int(timedelta(minutes=token_expiration).total_seconds())
        
        # generate new tokens
        access_token = AppSecurity.generate_access_token(jti=str(uuid4()), data=access_token_data, exp=expires)
        
        # convert jwt expiration into seconds
        refresh_expires_seconds = int(timedelta(days=ConstantsData.JWT_EXPIRATION).total_seconds())
        
        new_refresh_token = AppSecurity.generate_access_token(jti=str(uuid4()), data=refresh_token_data,
                                                              exp=refresh_expires_seconds)
        refresh_expires_datetime = datetime.now(timezone.utc) + timedelta(days=ConstantsData.JWT_EXPIRATION)
        
        return TokenDTO(access_token=access_token,
                        refresh_token=new_refresh_token,
                        refresh_token_expiration=refresh_expires_datetime)
    
    @retry_on_transient
    async def log_out_user(self, *, refresh_token: str):
        try:
            refresh_token_db = await self.check_session_token(refresh_token)
            # revoke the refresh token in db
            await self.__uow.token_session.revoke_token(refresh_token_db.token)
            
            response = SuccessfulResponseSchema(message="Successfully logout.")
            
            return response
        
        except Exception as e:
            raise e
    
    async def __update_refresh_token(self, token, user_id, user_role) -> TokenDTO:
        # check and get the refresh token session
        refresh_token_db = await self.check_session_token(token)
        
        # generate access and refresh token
        access_token_data = {ConstantsKeyData.TOKEN_DATA_KEY_USER_ID: user_id,
                             ConstantsKeyData.TOKEN_DATA_KEY_ROLE   : user_role}
        refresh_token_data = {ConstantsKeyData.TOKEN_DATA_KEY_USER_ID: user_id}
        # call the function to generate access token
        refresh_access_token = self.__generate_access_refresh_token(access_token_data, refresh_token_data)
        
        hashed_refresh_token = AppSecurity.hash_token(refresh_access_token.refresh_token)
        new_session_data = SessionTokenRequest(token=hashed_refresh_token, user_id=user_id,
                                               expires_at=refresh_access_token.refresh_token_expiration)
        
        # update the token in db
        await self.__uow.token_session.update_record(refresh_token=refresh_token_db.token,
                                                     data=new_session_data.model_dump())
        
        return refresh_access_token
    
    async def __insert_session_token(self, user_id: str, role: str) -> TokenDTO:
        # get the access and refresh token
        access_token_data = {ConstantsKeyData.TOKEN_DATA_KEY_USER_ID: user_id,
                             ConstantsKeyData.TOKEN_DATA_KEY_ROLE   : role}
        refresh_token_data = {ConstantsKeyData.TOKEN_DATA_KEY_USER_ID: user_id}
        
        # generate access and refresh token also the refresh token expiration for database.
        access_refresh_token = self.__generate_access_refresh_token(access_token_data, refresh_token_data)
        
        # hashed the refresh token
        hashed_refresh_token = AppSecurity.hash_token(access_refresh_token.refresh_token)
        
        # prepare the data for new session token
        new_session_data = SessionTokenRequest(token=hashed_refresh_token, user_id=user_id,
                                               expires_at=access_refresh_token.refresh_token_expiration)
        # insert the token into db
        await self.__uow.token_session.insert_record(new_session_data)
        # return TokenDTO
        return access_refresh_token
    
    def generate_csrf_token(self):
        return secrets.token_urlsafe(32)
