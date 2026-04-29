import phonenumbers
from phonenumbers import geocoder

from app.src.application.services import retry_on_transient
from app.src.application.services.shared_services import SharedServices
from app.src.core.security import AppSecurity
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.exceptions.domain_exceptions import (DomainInvalidCredentialsError, DomainJWTInvalidError,
                                                  DomainMaximumDataExceed, DomainNotFoundError,
                                                  DomainOTPInvalidError, DomainOTPNotExpireError,
                                                  DomainUnprocessableEntityError, )
from app.src.exceptions.http_exceptions import JWTInvalidException
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db.entity.users.address_entity import CreateAddress, UpdateAddress
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema, SignInTypeSchema, SuccessfulResponseSchema
from app.src.schema.user_schema import ChangePasswordSchema, UpdateUserSchema
from app.src.utils.utility import Utility


class UserServices(SharedServices):
    def __init__(self, uow: SQLUnitOfWork, cloudinary_infrastructure: CloudinaryInfrastructure):
        self.__uow = uow
        self.__cloudinary_infrastructure = cloudinary_infrastructure
        super().__init__(uow, cloudinary_infrastructure)
    
    @retry_on_transient
    async def update_profile_information(self, data: UpdateUserSchema,
                                         current_user: DecodedTokenDTO,
                                         filename: str,
                                         img_byte: bytes):
        is_uploaded = False
        to_update_personal_data = None
        try:
            old_personal_data = await self.__uow.users.get_personal_info_only(current_user.user_id)
            if not old_personal_data:
                raise DomainNotFoundError("Cannot update personal info, because it didn't exist.")
            
            # copy the old data and update if there's a new data in schema.
            to_update_personal_data = old_personal_data.copy(update=data.model_dump(
                    exclude_unset=True, exclude_none=True
                    ))
            # validate and set the age
            to_update_personal_data.age = Utility.validate_birthdate(to_update_personal_data.birth_date)
            
            # store old image
            old_image = old_personal_data.profile_image
            
            # then process the image.
            new_image = await self.upload_images_and_get(filenames=filename, img_bytes=img_byte)
            
            # if there's an images uploaded, then get the first image uploaded
            if new_image:
                # then update the image in schema to update the image in db.
                to_update_personal_data.profile_image = new_image[0]
                is_uploaded = True
                # check if there's an old image, then remove it.
            
            if old_personal_data == to_update_personal_data:
                return SuccessfulResponseSchema(message="No changes made.")
            # update the records from database.
            await self.__uow.users.update_user_personal_info(current_user.user_id,
                                                             to_update_personal_data.model_dump(exclude_unset=True,
                                                                                                exclude_none=True))
            # check if the old image, then destroy it in the cloudinary
            if old_image:
                # then destroy the old images in cloudinary and add a new one.
                await self.__cloudinary_infrastructure.destroy_images(old_image.public_key)
            return SuccessfulResponseSchema(message="Successfully update personal information.")
        except Exception as e:
            # upload again the images in cloudinary here.
            if is_uploaded and to_update_personal_data.profile_image is not None:
                
                await self.__cloudinary_infrastructure.destroy_images(to_update_personal_data.profile_image.public_key)
            
            raise e
    
    @retry_on_transient
    async def insert_address(self, address: CreateAddress, current_user: DecodedTokenDTO):
        try:
            # always check in the protected route if user exists.
            await self.check_if_user_exists(current_user.user_id)
            # check if there's an address
            data = await self.__uow.users.get_addresses_only(current_user.user_id)
            if not data:
                # then set the is_selected to true
                address.is_default = True
            # then cehck if the leeght of the address is greater than 5 then raise an error.
            # it must be maximum of 5 address only
            if len(data.addresses) >= 5:
                
                raise DomainMaximumDataExceed("Maximum address can be insert is 5 only.")
            # set user id
            address.user_id = current_user.user_id
            # sanitize fields by formating the First letter into capital letter
            
            address.fullname = Utility.capitalize_first_letters(address.fullname)
            address.postal_code = Utility.capitalize_first_letters(address.postal_code)
            address.st_bd_hno.street = Utility.capitalize_first_letters(address.st_bd_hno.street)
            address.st_bd_hno.building_name = Utility.capitalize_first_letters(address.st_bd_hno.building_name)
            address.st_bd_hno.house_no = Utility.capitalize_first_letters(address.st_bd_hno.house_no)
            
            # then insert into database
            new_data = await self.__uow.users.insert_address(address)
            response = SuccessfulResponseSchema(message="Successfully inserted address.", data=new_data)
            return response
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_user_addresses(self, current_user: DecodedTokenDTO):
        try:
            data = await self.__uow.users.get_addresses_only(current_user.user_id)
            if not data:
                return SuccessfulResponseSchema(message="Successfully but no records to retrieve.")
            
            return SuccessfulResponseSchema(message='Successfully retrieved data.', data=data)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_information(self, current_user: DecodedTokenDTO):
        try:
            data = await self.__uow.users.find_record_by_id(current_user.user_id)
            if not data:
                raise JWTInvalidException("No user found, please back to login.")
            
            return SuccessfulResponseSchema(message="Successfully retrieved information.",
                                            data=data)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def send_sms_otp(self, contact_number: str, current_user: DecodedTokenDTO, old_otp: str):
        try:
            # Implement dito yung, isang verification lang kada 1 device per hour para maiwasan ang spam verification.
            # sa ngayon ay wag muna, kapag sinuggest na lang siguro.
            
            # check if PH number
            parsed_number = phonenumbers.parse(contact_number, "PH")
            if geocoder.description_for_number(parsed_number, 'en') != "Philippines":
                raise DomainUnprocessableEntityError("Invalid format, it should be Philippines format.")
            
            data = await self.__uow.users.get_personal_info_only(current_user.user_id)
            if not data:
                raise DomainJWTInvalidError("Invalid user. Please back to login.")
            
            # then check if there's an OTP in redis.
            if old_otp:
                raise DomainOTPNotExpireError("Your OTP is not expired yet.")
            
            # send an otp to the sms
            otp_code = Utility.generate_otp_code()
            # then update contact number in database
            to_update = {"phone_number": contact_number}
            
            await self.__uow.users.update_user_personal_info(current_user.user_id, to_update)
            return SuccessfulResponseSchema(message="Successfully sent OTP to you mobile number.", otp_code=otp_code)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def verify_sms_otp(self, otp_code: str, otp_from_redis: str, current_user: DecodedTokenDTO):
        try:
            # check otp
            if not otp_code:
                raise DomainUnprocessableEntityError("OTP code should not be empty.")
            # retrieved user data
            data = await self.__uow.users.get_personal_info_only(current_user.user_id)
            
            # check if user exists
            if not data:
                raise DomainJWTInvalidError("Invalid user. Please back to login.")
            
            # verify otp code
            if not Utility.verify_otp(otp_from_redis, otp_code):
                raise DomainOTPInvalidError("Incorrect OTP.")
            
            # then update the number, and the mark as valid or verified number.
            to_update = {"is_phone_verified": True}
            
            # then update the is phone verified to true.
            await self.__uow.users.update_user_personal_info(current_user.user_id, to_update)
            return SuccessfulResponseSchema(message="Successfully verified phone number.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def update_address(self, address: UpdateAddress, address_id: str, current_user: DecodedTokenDTO):
        try:
            data = await self.__uow.users.get_user_info_only(current_user.user_id)
            # check if user exists
            if not data:
                raise DomainJWTInvalidError("Invalid user. Please back to login.")
            
            # check if the address want to update exists.
            address_data = await self.__uow.users.get_address_only(address_id=address_id,
                                                                   user_id=current_user.user_id)
            
            if not address_data:
                raise DomainNotFoundError("Can't update address that is not exists.")
            
            # copy original data and update the new address and exclude None
            to_update = address_data.model_copy(update=address.model_dump(exclude_none=True, exclude_unset=True))
            
            # check if no changes in the schema
            if data == to_update:
                return SuccessfulResponseSchema(message="No changes made.")
            
            # then update the address
            await self.__uow.users.update_user_address(user_id=current_user.user_id,
                                                       address_id=address_id,
                                                       data=to_update.model_dump(exclude_none=True,
                                                                                 exclude_unset=True))
            
            return SuccessfulResponseSchema(message="Successfully updated address.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def change_password(self, change_password: ChangePasswordSchema, refresh_token: str,
                              current_user: DecodedTokenDTO):
        
        try:
            data = await self.__uow.users.get_user_info_only_with_password(current_user.user_id)
            if not data:
                raise DomainJWTInvalidError("Invalid user. Please back to login.")
            
            # Optional but recommended: Prevent changing to the exact same password
            if data.password and AppSecurity.verify_hash_password(
                    plain_password=change_password.new_password,
                    hashed_password=data.password):
                raise DomainUnprocessableEntityError("New password cannot be the same as the current password.")
            
            to_update = data.model_copy()
            
            # Check if this is an OAuth user setting a password for the first time
            is_oauth_first_time = not data.password and any(
                    provider in data.signin_type for provider in [
                            SignInTypeSchema.GOOGLE,
                            SignInTypeSchema.APPLE,
                            SignInTypeSchema.FACEBOOK, ]
                    )
            
            if is_oauth_first_time:
                if SignInTypeSchema.PASSWORD not in to_update.signin_type:
                    to_update.signin_type.append(SignInTypeSchema.PASSWORD)
            
            else:
                # Standard flow: Verify the old password
                if not change_password.old_password:
                    raise DomainUnprocessableEntityError("Old password must not be empty.")
                
                # FIf a non-OAuth user somehow has no password, prevent crash
                if not data.password:
                    raise DomainUnprocessableEntityError("Account is not configured for password login.")
                
                if not AppSecurity.verify_hash_password(plain_password=change_password.old_password,
                                                        hashed_password=data.password):
                    raise DomainInvalidCredentialsError("Incorrect old password.")
            
            to_update.password = AppSecurity.hash_plain_password(change_password.new_password)
            
            await self.__uow.users.update_record(
                    current_user.user_id,
                    to_update.model_dump(exclude_none=True, exclude_unset=True)
                    )
            
            refresh_token_db = await self.check_session_token(refresh_token)
            # revoke the refresh token in db
            await self.__uow.token_session.revoke_token(refresh_token_db.token)
            
            return SuccessfulResponseSchema(message="Successfully updated password.")
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_all_active_users(self, paginated: PaginatedSchema, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # check user role
            self.validate_users_role(current_user.role)
            # get offset
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            data = await self.__uow.users.get_all_active_users(offset, paginated.limit)
            if not data:
                return SuccessfulResponseSchema(message="Successfully, but no data to retrieved.")
            
            # get paginated output
            total_records = await self.__uow.users.get_all_active_users_count()
            paginated_data = Utility.get_paginated_data(offset=offset, skip=paginated.skip,
                                                        limit=paginated.limit, total_records=total_records)
            return SuccessfulResponseSchema(message="Successfully retrieved data.",
                                            data=data,
                                            paginated=paginated_data)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def change_email(self, new_email: str, current_user: DecodedTokenDTO):
        # TODO Project To follow na lang muna
        try:
            data = await self.__uow.users.get_user_info_only(current_user.user_id)
            if not data:
                raise DomainJWTInvalidError("Invalid user. Please back to login.")
            
            # check if the new email is not specified
            if not new_email:
                raise DomainUnprocessableEntityError("New email should not be empty.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def delete_user_address(self, address_id: str, current_user: DecodedTokenDTO):
        try:
            data = await self.__uow.users.get_address_only(user_id=current_user.user_id, address_id=address_id)
            if not data:
                raise DomainNotFoundError("Cannot delete address that is not exists.")
            
            await self.__uow.users.delete_user_address(user_id=current_user.user_id, address_id=address_id)
            
            response = SuccessfulResponseSchema(message="Successfully deleted address.")
            return response
        except Exception as e:
            raise e
