import os

import cloudinary
import cloudinary.uploader

from app.src.core.constants import ConstantsData
from app.src.schema.products_schema import Images

cloudinary.config(
        cloud_name=ConstantsData.C_NAME,
        api_key=ConstantsData.C_KEY,
        api_secret=ConstantsData.C_SECRET,
        secure=ConstantsData.C_SECURE,
        )


class CloudinaryInfrastructure:
    def __init__(self, sub_folder_name="display-photo"):
        if not sub_folder_name:
            self.sub_folder_name = "display-photo"
        else:
            self.sub_folder_name = sub_folder_name
    
    async def upload_image(self, url_img, public_id: str) -> str:
        # set the asset folder name.
        asset_folder = f"e_comm/{self.sub_folder_name}"
        # upload the image in cloudinary
        result = cloudinary.uploader.upload(url_img,
                                            public_id=public_id,
                                            overwrite=True,
                                            secure=True,
                                            asset_folder=asset_folder,
                                            resource_type="image")
        # get the url of the uploaded image
        url = result.get("secure_url")
        # then return it
        return url
    
    async def update_image_file(self, user_id: str,
                                filename,
                                old_public_id=None,
                                image_byte: bytes = None):
        """
        To upload the image(s) on cloudinary server.
        :param user_id: unique identity of a user.
        :param filename: of an image.
        :param old_public_id: of an old immage that are in db. In default, it's None.
        :param image_byte: The actual bytes of an image to upload in cloudinary.
        :return: The public key and url image in a dictionary type.
        """
        # default None
        public_id = None
        try:
            # generate public id
            public_id = self.__generate_public_id(filename, user_id)
            
            # check if the user exists in cloudinary
            if old_public_id is not None:
                cloudinary.uploader.destroy(old_public_id)
            # upload in cloudinary and return the secure url
            image_url = await self.upload_image(image_byte, public_id)
            # then update the profile picture
            new_profile_picture = Images(image_url=image_url, public_key=public_id)
            # return image
            return new_profile_picture
        
        except Exception as e:
            # delete the image if error occurred
            if public_id is not None:
                # destroy the image in cloudinary if exists.
                await self.destroy_images(public_id)
            raise e
    
    @classmethod
    async def destroy_images(cls, public_id: str):
        """
        To destroy images on cloudinary.
        :param public_id: It's either String or a list of strings.
        :return: Nothing
        """
        if public_id:
            cloudinary.uploader.destroy(public_id)
    
    @staticmethod
    def __generate_public_id(filename, user_id):
        """
        To generate public id for image.
        :param filename: of an image to upload
        :param user_id: of a user.
        :return: The generated public id.
        """
        public_id = f"{user_id}-{os.path.splitext(filename)[0]}"
        return public_id
