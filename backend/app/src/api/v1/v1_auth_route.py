from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Body, Cookie, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from starlette import status

from app.src.application.services.auth_services import AuthServices
from app.src.core.constants import ConstantsData, ConstantsKeyData, EndpointTags
from app.src.core.dependencies import get_redis_services, get_uow
from app.src.core.security import AppSecurity
from app.src.exceptions.domain_exceptions import DomainOTPNotExpireError
from app.src.exceptions.http_exceptions import DataBadRequestException
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.infrastructure.email_infrastructure import EmailInfrastructure
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.auth_schema import CookieResponseSchema, LoginRequest, SignUpRequest
from app.src.utils.successful_response import SuccessfulResponse

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/auth"

v1_auth_router = APIRouter(tags=[EndpointTags.AUTHENTICATION], prefix=__base_endpoint)


@v1_auth_router.post("/signup", tags=[EndpointTags.CUSTOMER])
async def create_account(background_task: BackgroundTasks,
                         email: EmailStr | str = Body(),
                         uow: SQLUnitOfWork = Depends(get_uow),
                         redis_services: RedisInfrastructure = Depends(get_redis_services)):
    try:
        # email infrastructure.
        email_infrastructure = EmailInfrastructure()
        # auth services.
        auth_services = AuthServices(uow, email_infrastructure)
        
        # otp from redis.
        otp_code_from_redis = await redis_services.get_otp(email)
        
        # auth services response.
        services_response = await auth_services.manual_signup_initiate(email, old_otp_code=otp_code_from_redis)
        
        # generate a verification token with 24 hours expiration time.
        expiration = 24 * 3600  # 24 hours in seconds
        verification_token = AppSecurity.generate_access_token(jti=str(uuid4()),
                                                               data={"user_email": email},
                                                               exp=expiration)
        
        # check if the services response contains an otp code, if it does, send the email and set the cookie,
        # otherwise just set the cookie and return the response.
        success_response_schema = SuccessfulResponseSchema(message=services_response.message,
                                                           status_code=status.HTTP_200_OK)
        
        if services_response.otp_code:
            # set the otp code in redis.
            
            redis_expiration = 3 * 60
            await redis_services.set_otp(email, services_response.otp_code, redis_expiration)
            success_response_schema.status_code = status.HTTP_202_ACCEPTED
            success_response_schema.status_message = "accepted"
            # send email in background task.
            background_task.add_task(email_infrastructure.send_email_verification_code, recipient=email,
                                     verification_code=services_response.otp_code)
        
        response = SuccessfulResponse(success_response_schema)
        # set the cookie with the verification token.
        response.set_cookie(**CookieResponseSchema(key="verification_token", value=verification_token).model_dump())
        
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/verify-otp", tags=[EndpointTags.CUSTOMER])
async def verify_signup_otp(otp_code: str = Body(),
                            verification_token: str = Cookie(None),
                            uow: SQLUnitOfWork = Depends(get_uow),
                            redis_services: RedisInfrastructure = Depends(get_redis_services)):
    try:
        # auth services.
        auth_services = AuthServices(uow, None)
        user_email: str = ""
        try:
            # verify token
            payload = AppSecurity.decode_jwt_token(verification_token)
            # get the email
            user_email: str = payload.get("user_email")
            user_email = user_email.strip()
        except Exception as e:
            raise DataBadRequestException(message="Signup verification failed. Please re-enter your email.", )
        
        # otp from redis.
        otp_code_from_redis = await redis_services.get_otp(user_email)
        
        # auth services response.
        services_response = await auth_services.verify_signup_otp_code(otp_code=otp_code,
                                                                       otp_code_from_redis=otp_code_from_redis,
                                                                       email=user_email)
        # if successful response
        success_response_schema = SuccessfulResponseSchema(message=services_response.message)
        success_response_schema.status_code = status.HTTP_201_CREATED
        success_response_schema.status_message = "ok"
        response = SuccessfulResponse(success_response_schema)
        
        await redis_services.delete_otp(user_email)
        
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/complete-signup", tags=[EndpointTags.CUSTOMER])
async def complete_signup(signup_data: SignUpRequest = Depends(SignUpRequest.sign_up_request_depends),
                          redis_services: RedisInfrastructure = Depends(get_redis_services),
                          uow: SQLUnitOfWork = Depends(get_uow),
                          verification_token: str = Cookie(None)):
    try:
        auth_services = AuthServices(uow)
        
        # auth services response.
        services_response = await auth_services.manual_signup_final_step(signup_data, verification_token)
        # delete the otp code from redis.
        await redis_services.delete_otp(signup_data.email)
        # delete data from temp users table
        await uow.temp_users.delete_record(signup_data.email)
        
        # if successful response
        # set the data from services response to the successful response schema, and return the response.
        success_response_schema = SuccessfulResponseSchema(message=services_response.message)
        # set the status code to 201 created, and status message to "ok"
        success_response_schema.status_code = status.HTTP_201_CREATED
        success_response_schema.status_message = "ok"
        # set the access token to the successful response schema.
        success_response_schema.access_token = services_response.access_token
        # finally initialize the successful response with the successful response schema, and return the response.
        response = SuccessfulResponse(success_response_schema)
        
        # remove the cookie from the response
        response.delete_cookie(key=ConstantsKeyData.COOKIE_VERIFICATION_KEY)
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/login", tags=[EndpointTags.CUSTOMER])
async def login(background_task: BackgroundTasks,
                form_data: OAuth2PasswordRequestForm = Depends(),
                redis_services: RedisInfrastructure = Depends(get_redis_services),
                uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        email_infrastructure = EmailInfrastructure()
        auth_services = AuthServices(uow, email_infrastructure)
        
        credentials = LoginRequest(email=form_data.username, password=form_data.password)
        auth_response = await auth_services.manual_login(credentials=credentials)
        
        response_schema = SuccessfulResponseSchema(message=auth_response.message,
                                                   status_code=status.HTTP_200_OK,
                                                   status_message="ok")
        
        if auth_response.action == ConstantsKeyData.USER_ACTION_EMAIL_VERIFICATION:
            generated_otp = AppSecurity.generate_otp_code()
            
            # first get if there is an existing otp code in redis, if there is, delete it and set the new one, if there isn't just set the new one.
            existing_otp = await redis_services.get_otp(form_data.username)
            
            if existing_otp:
                raise DomainOTPNotExpireError(message="Your code has not expired yet.")
            
            # if no otp in redis, then set otp and send email. also generate a verification token with 24 hours expiration time, and set it in the cookie.
            data = {ConstantsKeyData.TOKEN_DATA_KEY_USER_EMAIL: form_data.username}
            response_schema.message = "Verification code sent to your email."
            response_schema.status_code = status.HTTP_202_ACCEPTED
            
            # then return the response with the access token in the cookie, and send the email in background task.
            response = SuccessfulResponse(response_schema)
            
            response.set_cookie(ConstantsKeyData.COOKIE_VERIFICATION_KEY,
                                AppSecurity.generate_access_token(jti=str(uuid4()), data=data, exp=24 * 3600))
            
            otp_code = await redis_services.set_otp(form_data.username, generated_otp)
            # send via background task.
            background_task.add_task(email_infrastructure.send_email_verification_code, recipient=form_data.username,
                                     verification_code=otp_code)
            return response
        
        # if no errors, then return the response with the access token if there is one.
        response_schema.access_token = auth_response.access_token
        
        response = SuccessfulResponse(response_schema)
        response.set_cookie(ConstantsKeyData.COOKIE_REFRESH_TOKEN, auth_response.refresh_token)
        
        return response
    
    
    except Exception as e:
        raise e


@v1_auth_router.post('/refresh-token', tags=[EndpointTags.CUSTOMER])
async def refresh_token(refresh_token: str = Cookie(None),
                        uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        auth_services = AuthServices(uow)
        new_access_token = await auth_services.refresh_token(refresh_token=refresh_token)
        
        response_schema = SuccessfulResponseSchema(message=new_access_token.message,
                                                   status_code=status.HTTP_200_OK,
                                                   status_message="ok",
                                                   access_token=new_access_token.access_token,
                                                   refresh_token=new_access_token.refresh_token)
        response = SuccessfulResponse(response_schema)
        response.set_cookie(ConstantsKeyData.COOKIE_REFRESH_TOKEN, new_access_token.refresh_token)
        return response
    
    except Exception as e:
        raise e
