from typing import List
from uuid import uuid4

from app.src.core.constants import ConstantsData
from app.src.core.security import AppSecurity
from app.src.domain.dto.auth_dto import SessionTokenDTO
from app.src.exceptions.domain_exceptions import (DomainForbiddenAccessError, DomainJWTInvalidError,
                                                  DomainLargeFileError, DomainNotFoundError, DomainDeactivatedError, )
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import RoleSchema
from app.src.schema.products_schema import Images
from app.src.utils.utility import Utility


class SharedServices:
    def __init__(self, __uow: SQLUnitOfWork,
                 cloudinary_infrastructure: CloudinaryInfrastructure = None):
        self.__uow = __uow
        self.__cloudinary_infrastructure = cloudinary_infrastructure
    
    async def upload_images_on_cloudinary(self, *,
                                          filenames: List[str],
                                          img_bytes: List[bytes],
                                          images: list[Images],
                                          public_ids=List[str]):
        """
        To upload image(s) in the cloudinary.
        :param filenames: a list of filenames of the images.
        :param img_bytes: a list of bytes of the images.
        :param images: a list of old images in database.
        :param public_ids: a list of old public ids
        :return:new_data_images that is uploaded on the server, old_images is the old images from database, and is_images_uploaded that os tpo check if the user
        """
        is_images_uploaded = False
        try:
            # get the old images from database
            old_images = []
            
            # check if there's an old images.
            if images:
                
                # then look for the value in old images using for loop.
                for index, value in enumerate(images):
                    # then check if the old public key in
                    
                    old_public_id = value.public_key
                    
                    if old_public_id not in public_ids:
                        # remove the old images from dictionary
                        
                        old_images.append(old_public_id)
                        # then remove from cloudinary
            # then get the list of new img_url and public_key
            new_data_images = await self.upload_images_and_get(filenames, img_bytes)
            # then set to true the is images uploaded, so that if error
            # encountered it will remove also in the cloudinary storage.
            if new_data_images:
                is_images_uploaded = True
                old_images.extend(new_data_images)
            
            # return the old images and is_images_uploaded
            return new_data_images, old_images, is_images_uploaded
        except Exception as e:
            raise e
    
    async def upload_images_and_get(self, filenames, img_bytes) -> List[Images] | None:
        
        """
        To upload image(s) in cloudinary and return the image url and its public key.
        :param filenames:
        :param img_bytes:
        :return:
        """
        images = []
        # check if there's an image uploaded
        if img_bytes:
            for i in range(len(filenames)):
                filename = filenames[i]
                img_byte = img_bytes[i]
                # validate the image file extension and if no error, do nothing
                Utility.validate_image_file_extension(filename)
                # then check the file size
                if len(img_byte) > ConstantsData.FILE_SIZE_LIMIT:
                    raise DomainLargeFileError("File size should be less than 11 MB.")
                
                # create the img url and public key to insert in database
                product_img = await self.__cloudinary_infrastructure.update_image_file(str(uuid4()),
                                                                                       filename,
                                                                                       image_byte=img_byte)
                # then append the dict images
                images.append(product_img)
        return images
    
    async def check_if_user_exists(self, user_id: str):
        try:
            data = await self.__uow.users.get_user_info_only(user_id)
            if not data:
                raise DomainNotFoundError("No user found.")
            return data
        except Exception as e:
            raise e
    
    async def check_session_token(self, token: str) -> SessionTokenDTO:
        
        try:
            
            # hashed token in database
            if not token:
                raise DomainJWTInvalidError(message="Refresh token is missing. Please login again.", )
            hashed_token = AppSecurity.hash_token(token)
            refresh_token_db = await self.__uow.token_session.find_record(hashed_token)
            
            if not refresh_token_db:
                raise DomainJWTInvalidError(message="Refresh token does not exist. Please login again.", )
            
            if refresh_token_db.is_revoke:
                raise DomainJWTInvalidError(message="Refresh token has been revoked. Please login again.", )
            
            return refresh_token_db
        except Exception as e:
            raise e
    
    async def _check_user_if_exists(self, user_id: str):
        # retrieved data first
        data = await self.__uow.users.get_user_info_only(user_id)
        
        if not data:
            raise DomainJWTInvalidError("Invalid user, please back to login.")
        if data.is_deleted:
            if data.Users.is_deleted:
                #to make sure that
                raise DomainJWTInvalidError("This email is deactivated.")

        return data
    
    def validate_users_role(self, role: str, is_admin=True):
        if not role:
            raise DomainForbiddenAccessError("You don't have rights to access this.")
        
        if is_admin:
            if role != RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
        
        if not is_admin:
            if role != RoleSchema.CUSTOMER:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
