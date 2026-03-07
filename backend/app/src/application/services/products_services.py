from typing import List
from uuid import uuid4

from app.src.application.services import retry_on_transient
from app.src.core.constants import ConstantsData
from app.src.exceptions.domain_exceptions import DomainLargeFileError, DomainNotFoundError
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.infrastructure.email_infrastructure import EmailInfrastructure
from app.src.schema import PaginatedSchema, SuccessfulResponseSchema
from app.src.schema.products_schema import (InventoryRequestSchema, ProductDetailsRequestSchema, ProductRequestSchema,
                                            ProductsFullInformationRequestSchema,
                                            UpdateProductsInformationRequestSchema, )
from app.src.utils.utility import Utility


class ProductsServices:
    
    def __init__(self, uow: SQLUnitOfWork, email_infrastructure: EmailInfrastructure = None,
                 cloudinary_infrastructure: CloudinaryInfrastructure = None):
        self.uow = uow
        self.email_infrastructure = email_infrastructure
        self.cloudinary_infrastructure = cloudinary_infrastructure
    
    # will inject the jwt oauth2 later
    @retry_on_transient
    async def insert_products(self, product_request: ProductsFullInformationRequestSchema,
                              filenames: List[str],
                              img_bytes: List[bytes]) -> SuccessfulResponseSchema:
        
        """
        To insert products information in database, including product data, details and inventory.
        :param product_request: The full information of product.
        :param filenames: The full information of product.
        :param img_bytes: The full information of product.
        :return: Successful response.
        """
        is_images_uploaded = False
        product_images = []
        try:
            
            # Upload the images on the cloudinary and retrieve the url and public key
            product_images = await self.__upload_images_and_get(filenames, img_bytes)
            
            # set the image to uploaded because no error encountered in the product images
            is_images_uploaded = True
            # insert images in products
            product_request.images = product_images
            # get the product status
            
            await self.uow.products.insert_record(product_request)
            # insert into products details
            # return the output schemas
            successful_response = SuccessfulResponseSchema(message="Successfully inserted product.")
            return successful_response
        
        except Exception as e:
            if is_images_uploaded:
                for product_image in product_images:
                    public_key = product_image.get("public_key")
                    await self.cloudinary_infrastructure.destroy_images(public_key)
            raise e
    
    @retry_on_transient
    async def get_product_information(self, product_id: str) -> SuccessfulResponseSchema:
        data = await self.uow.products.find_record(product_id)
        response = SuccessfulResponseSchema(message="Successfully retrieved data.", )
        
        if not data:
            response.message = "No records to retrieve."
            return response
        # subtract the actual quantity by reserve stock for user side only.
        data.quantity = data.quantity - data.reserved_stock
        response.data = data
        
        return response
    
    @retry_on_transient
    async def get_product_information_paginated(self, paginated: PaginatedSchema):
        
        offset = Utility.get_offset(paginated.skip, paginated.limit)
        data = await self.uow.products.get_paginated_record(offset, paginated.limit)
        response = SuccessfulResponseSchema(message="Successfully retrieved data.", )
        
        if not data:
            response.message = "No records to retrieve."
            return response
        
        response.data = data
        
        return response
    
    @retry_on_transient
    async def update_product_information(self, product_id: str,
                                         new_data: UpdateProductsInformationRequestSchema,
                                         filenames: List[str],
                                         img_bytes: List[str]):
        new_product_images = None
        is_images_uploaded = False
        try:
            # first query the data from db
            data = await self.uow.products.find_record(product_id)
            if not data:
                raise DomainNotFoundError("Cannot update product that didn't exist.")
            
            product = ProductRequestSchema(**data.Products.model_dump())
            inventory = InventoryRequestSchema(**data.model_dump())
            details = ProductDetailsRequestSchema(**data.model_dump())
            
            # then make a copy on the original data and replace the
            new_product = product.model_copy(
                    update=new_data.model_dump(exclude_none=True, exclude_unset=True))
            new_inventory = inventory.model_copy(
                    update=new_data.model_dump(exclude_none=True, exclude_unset=True))
            new_details = details.model_copy(
                    update=new_data.model_dump(exclude_unset=True))
            
            # get the old images from database
            old_images = details.images
            
            # update the old images into new one
            if details.images:
                for index, value in enumerate(details.images):
                    if value.get("public_key") in new_data.public_ids:
                        # remove the old images from dictionary
                        old_images.pop(index)
            # then get the list of new img_url and public_key
            new_product_images = await self.__upload_images_and_get(filenames, img_bytes)
            
            # then marked the image uploaded to true
            is_images_uploaded = True
            
            # To track if there's a changes made.
            update_counter = 0
            # then check if there's changes in the product.
            
            old_images.extend(new_product_images)
            new_details.images = old_images
            
            if product != new_product:
                update_counter += 1
                await self.uow.products.update_record(product.model_dump())
            
            if inventory != new_inventory:
                update_counter += 1
                await self.uow.products.update_product_details(details)
            
            if details != new_details:
                update_counter += 1
                await self.uow.products.update_product_inventory(inventory)
            
            # check if there's an image uploaded
            if new_product_images:
                update_counter += 1
            
            # destroy the images in cloudinary after successful update the image product in database.
            if new_data.public_ids:
                # then loop through it.
                for public_id in new_data.public_ids:
                    # then destroy the image in the cloudinary.
                    await self.cloudinary_infrastructure.destroy_images(public_id)
            
            # then return the successful message
            response = SuccessfulResponseSchema(message="Successfully updated product information.")
            
            if update_counter <= 0:
                response.message = "No Changes made."
            
            return response
        
        except Exception as e:
            if is_images_uploaded:
                for product_image in new_product_images:
                    public_key = product_image.get("public_key")
                    await self.cloudinary_infrastructure.destroy_images(public_key)
            raise e
    
    @retry_on_transient
    async def delete_product_information(self, product_id):
        try:
            
            data = await self.uow.products.find_record(product_id)
            if not data:
                raise DomainNotFoundError("Cannot delete product that does not exist.")
            
            # delete the product from database
            await self.uow.products.delete_record(product_id)
            
            details = ProductDetailsRequestSchema(**data.model_dump())
            
            if details.images:
                for image in details.images:
                    await self.cloudinary_infrastructure.destroy_images(image.get("public_key"))
            
            response = SuccessfulResponseSchema(message="Successfully deleted product.")
            
            return response
        except Exception as e:
            raise e
    
    async def __upload_images_and_get(self, filenames, img_bytes) -> List[dict] | None:
        
        """
        To upload image(s) in cloudinary and return the image url and its public key.
        :param filenames:
        :param img_bytes:
        :return:
        """
        product_images = []
        # check if there's an image uploaded
        if img_bytes:
            for filename, img_byte in zip(filenames, img_bytes):
                # validate the image file extension and if no error, do nothing
                Utility.validate_image_file_extension(filename)
                # then check the file size
                if len(img_byte) > ConstantsData.FILE_SIZE_LIMIT:
                    raise DomainLargeFileError("File size should be less than 11 MB.")
                
                # create the img url and public key to insert in database
                
                product_img = await self.cloudinary_infrastructure.update_image_file(str(uuid4()),
                                                                                     filename,
                                                                                     image_byte=img_byte)
                # then append the dict images
                product_images.append(product_img)
        
        return product_images
