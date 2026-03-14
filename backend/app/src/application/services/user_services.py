from typing import List

from app.src.application.services.shared_services import SharedServices
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.exceptions.domain_exceptions import DomainNotFoundError
from app.src.exceptions.http_exceptions import JWTInvalidException, UnAuthorizeAccessException
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.products_schema import Images
from app.src.schema.user_schema import UpdateUserSchema


class UserServices(SharedServices):
    def __init__(self, uof: SQLUnitOfWork, cloudinary_infrastructure: CloudinaryInfrastructure):
        self.__uof = uof
        self.__cloudinary_infrastructure = cloudinary_infrastructure
        super().__init__(uof, cloudinary_infrastructure)
    
    async def update_profile_information(self, data: UpdateUserSchema,
                                         current_user: DecodedTokenDTO,
                                         filename: str,
                                         img_byte: bytes):
        is_uploaded = False
        to_update_personal_data = None
        try:
            old_personal_data = await self.__uof.users.get_personal_info_only(current_user.user_id)
            if not old_personal_data:
                raise DomainNotFoundError("Cannot update personal info, because it didn't exist.")
            
            # copy the old data and update if there's a new data in schema.
            to_update_personal_data = old_personal_data.copy(update=data.model_dump(
                    exclude_unset=True, exclude_none=True
                    ))
            old_image = old_personal_data.profile_image
            
            new_image = await self.upload_images_and_get(filenames=filename, img_bytes=img_byte)
            
            # if there's an images uploaded, then remove from cloudinary
            if new_image:
                # then update the image in schema to update the image in db.
                to_update_personal_data.profile_image = new_image[0]
                is_uploaded = True
                # check if there's an old image, then remove it.
            
            # update the records from database.
            await self.__uof.users.update_user_personal_info(current_user.user_id,
                                                             to_update_personal_data)
            if old_image:
                # then destroy the old images in cloudinary and add a new one.
                await self.__cloudinary_infrastructure.destroy_images(old_image.public_key)
            return SuccessfulResponseSchema(message="Successfully update personal information.")
        except Exception as e:
            print(data.profile_image)
            # upload again the images in cloudinary here.
            if is_uploaded and to_update_personal_data.profile_image is not None:
                
                await self.__cloudinary_infrastructure.destroy_images(to_update_personal_data.profile_image.public_key)
            # then upload the old one again.
            
            raise e
    
    async def get_information(self, current_user: DecodedTokenDTO):
        try:
            data = await self.__uof.users.find_record_by_id(current_user.user_id)
            if not data:
                raise JWTInvalidException("No user found, please back to login.")
            
            return SuccessfulResponseSchema(message="Successfully retrieved information.",
                                            data=data)
        except Exception as e:
            raise e
