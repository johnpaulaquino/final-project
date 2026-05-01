from typing import List

from app.src.application.services import retry_on_transient
from app.src.application.services.shared_services import SharedServices
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.domain.dto.products_dto import OverviewDTO, ProductsInformationFilterWithTags
from app.src.exceptions.domain_exceptions import (DomainAlreadyExistsError, DomainNotFoundError,
                                                  DomainUnprocessableEntityError, )
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db.entity.products.carousels_entity import CreateCarousel
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema, SuccessfulResponseSchema
from app.src.schema.products_schema import (CreateCategories, InventoryRequestSchema, ProductCategories,
                                            ProductDetailsRequestSchema,
                                            ProductRequestSchema,
                                            ProductReviewsSchema, ProductsFullInformationRequestSchema,
                                            UpdateProductsInformationRequestSchema, )
from app.src.utils.utility import Utility


class ProductsServices(SharedServices):
    
    def __init__(self, __uow: SQLUnitOfWork, cloudinary_infrastructure: CloudinaryInfrastructure = None):
        self.__uow = __uow
        self.cloudinary_infrastructure = cloudinary_infrastructure
        
        super().__init__(__uow, cloudinary_infrastructure)
    
    # will inject the jwt oauth2 later
    @retry_on_transient
    async def insert_products(self, product_request: ProductsFullInformationRequestSchema,
                              filenames: List[str],
                              current_user: DecodedTokenDTO,
                              img_bytes: List[bytes]) -> SuccessfulResponseSchema:
        
        """
        To insert products information in database, including product data, details and inventory.
        :param product_request: The full information of product.
        :param filenames: The full information of product.
        :param current_user: dependency for authentication.
        :param img_bytes: The full information of product.
        :return: Successful response.
        """
        is_images_uploaded = False
        product_images = []
        try:
            
            # call the function that is from shared service where, retrieve user and validate it
            await self._check_user_if_exists(current_user.user_id)
            # then check if it's admin
            self.validate_users_role(current_user.role)
            
            # check if the category is in the database
            categories_data = await self.__uow.products.get_product_categories()
            if product_request.category not in categories_data:
                raise DomainUnprocessableEntityError(f"Category should be in {categories_data}.")
            # check if the images uploaded in the server exceed to maximum 5, then raise an error.
            if len(filenames) > 5:
                raise DomainUnprocessableEntityError(
                        f"You exceed the maximum 5 of images to upload per product.")
            
            # Upload the images on the cloudinary and retrieve the url and public key
            product_images = await self.upload_images_and_get(filenames, img_bytes)
            
            # set the image to uploaded because no error encountered in the product images
            is_images_uploaded = True
            # insert images in products
            product_request.images = product_images
            # get the product status
            
            # sanitize data
            product_request.category = Utility.capitalize_first_letters(product_request.category)
            product_request.tags = [Utility.capitalize_first_letters(tag) for tag in product_request.tags]
            # insert into products
            await self.__uow.products.insert_record(product_request)
            
            # return the output schemas
            successful_response = SuccessfulResponseSchema(message="Successfully inserted product.")
            return successful_response
        
        except Exception as e:
            # remove all the uploaded file in cloudinary if encountered error.
            if is_images_uploaded:
                for product_image in product_images:
                    public_key = product_image.public_key
                    await self.cloudinary_infrastructure.destroy_images(public_key)
            raise e
    
    @retry_on_transient
    async def insert_category(self, categories: CreateCategories, current_user: DecodedTokenDTO):
        try:
            await self._check_user_if_exists(current_user.user_id)
            
            # then check if it's admin
            self.validate_users_role(current_user.role)
            
            # then validate data before it insert
            list_of_categories = []
            # get the categories from database
            data = await self.__uow.products.get_product_categories()
            for category in categories.category:
                if category in data:
                    raise DomainAlreadyExistsError("Category is already exist.")
                category = Utility.capitalize_first_letters(category)
                list_of_categories.append(category)
            
            await self.__uow.products.insert_categories(list_of_categories)
            return SuccessfulResponseSchema(message="Successfully inserted category.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_product_categories(self):
        try:
            data = await self.__uow.products.get_product_categories()
            response = SuccessfulResponseSchema(message="Successfully retrieved data.", )
            if not data:
                response.message = "No records to retrieve."
                return response
            
            response.data = data
            return response
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_products_by_categories(self, category: str, paginated: PaginatedSchema):
        try:
            # calculate the offset
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            if category.lower() not in [categ.value.lower() for categ in ProductCategories]:
                raise DomainUnprocessableEntityError(
                        f"Category must be in {[categ.value for categ in ProductCategories]}")
            # retrieve data from database
            category = Utility.capitalize_first_letters(category)
            data = await self.__uow.products.get_paginated_record_with_category(category, offset, paginated.limit)
            response = SuccessfulResponseSchema(message="Successfully retrieved data.", )
            
            # retrieved total records from db
            total_records = await self.__uow.products.get_paginated_record_with_category_total_records(category)
            # get the paginated if there's a record.
            paginated_data = Utility.get_paginated_data(offset=offset, skip=paginated.skip,
                                                        limit=paginated.limit,
                                                        total_records=total_records)
            
            # then check if there's a data
            if not data:
                response.message = "No records to retrieve."
                return response
            # set the paginated data
            response.paginated = paginated_data
            response.data = data
            
            # return response
            return response
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_product_information(self, product_id: str) -> SuccessfulResponseSchema:
        data = await self.__uow.products.find_record(product_id)
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
        
        # calculate the offset
        offset = Utility.get_offset(paginated.skip, paginated.limit)
        # retrieve data from database
        data = await self.__uow.products.get_paginated_record(offset, paginated.limit)
        response = SuccessfulResponseSchema(message="Successfully retrieved data.", )
        
        # retrieved total records from db
        total_records = await self.__uow.products.get_total_records()
        # get the paginated if there's a record.
        paginated_data = Utility.get_paginated_data(offset=offset, skip=paginated.skip,
                                                    limit=paginated.limit,
                                                    total_records=total_records)
        
        # then check if there's a data
        if not data:
            response.message = "No records to retrieve."
            return response
        # set the paginated data
        response.paginated = paginated_data
        response.data = data
        
        # return response
        return response
    
    @retry_on_transient
    async def get_product_categories(self):
        try:
            data = await self.__uow.products.get_product_categories()
            if not data:
                return SuccessfulResponseSchema(message="Successfully but no data to retrieve.")
            
            return SuccessfulResponseSchema(data=data, message="Successfully retrieved categories.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_product_information_paginated_with_tags(self, paginated: PaginatedSchema):
        
        # calculate the offset
        offset = Utility.get_offset(paginated.skip, paginated.limit)
        # retrieve data from database
        new_products_data = await self.__uow.products.get_paginated_record_with_new_products_tag(offset,
                                                                                                 paginated.limit)
        best_seller_data = await self.__uow.products.get_paginated_record_with_best_seller_tag(offset, paginated.limit)
        response = SuccessfulResponseSchema(message="Successfully retrieved data.", )
        data = {"best_sellers": best_seller_data, "new_products": new_products_data}
        
        data = ProductsInformationFilterWithTags(**data)
        # then check if there's a data
        if not new_products_data and not best_seller_data:
            response.message = "No records to retrieve."
            return response
        response.data = data
        
        # return response
        return response
    
    @retry_on_transient
    async def get_admin_overview(self, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            
            # check user role
            self.validate_users_role(current_user.role)
            
            # get the total Revenue
            total_revenue = await self.__uow.orders.get_total_revenue()
            total_orders = await self.__uow.orders.get_total_orders()
            total_active_users = await self.__uow.users.get_all_active_users_count()
            total_unread_alerts = await self.__uow.notifications.get_total_unread_notifications()
            
            overview_data = OverviewDTO(total_revenue=total_revenue,
                                        total_orders=total_orders,
                                        total_unread_alerts=total_unread_alerts,
                                        total_active_customers=total_active_users)
            
            return SuccessfulResponseSchema(message="Successfully received data.",
                                            data=overview_data)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def insert_carousel(self, current_user: DecodedTokenDTO,
                              filenames: List[str],
                              img_bytes: List[bytes],
                              ):
        is_images_uploaded = None
        product_images = None
        try:
            # check if user exist
            await self._check_user_if_exists(current_user.user_id)
            
            # check user role
            self.validate_users_role(current_user.role)
            
            # get filenames and bytes adn upload the image on the cloudinary
            product_images = await self.upload_images_and_get(filenames, img_bytes)
            
            carousel = CreateCarousel(image=None)
            # set the uploaded to true, since I upload the file in cloudinary.
            
            carousel.image = product_images[0] if product_images is not None else product_images
            
            await self.__uow.products.create_product_carousel(carousel)
            
            return SuccessfulResponseSchema(message="Successfully inserted carousel.")
        
        except Exception as e:
            # if encountered error, delete image from cloudinary
            if is_images_uploaded:
                for product_image in product_images:
                    print(product_image.public_key)
                    public_key = product_image.public_key
                    await self.cloudinary_infrastructure.destroy_images(public_key)
            raise e
    
    @retry_on_transient
    async def get_paginated_carousel(self, paginated: PaginatedSchema, current_user: DecodedTokenDTO):
        try:
            # check user
            await self._check_user_if_exists(current_user.user_id)
            
            # retrieve data
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            data = await self.__uow.products.get_paginated_carousel(offset, paginated.limit)
            if not data:
                return SuccessfulResponseSchema(message="Successfully, but no data to retrieved.")
            total_records = await self.__uow.products.get_paginated_carousel_count()
            paginated_data = Utility.get_paginated_data(offset=offset,
                                                        skip=paginated.skip,
                                                        limit=paginated.limit,
                                                        total_records=total_records)
            return SuccessfulResponseSchema(message="Successfully retrieved data.", data=data, paginated=paginated_data)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def delete_carousel(self, carousel_id: str, current_user: DecodedTokenDTO):
        try:
            # check user
            await self._check_user_if_exists(current_user.user_id)
            # validate user role
            self.validate_users_role(current_user.role)
            
            # retrieve data if exist
            data = await self.__uow.products.get_carousel(carousel_id)
            if not data:
                raise DomainNotFoundError("can't delete carousel that is not exist.")
            
            await self.__uow.products.delete_carousel(carousel_id)
            
            # remove image in cloudinary
            await self.cloudinary_infrastructure.destroy_images(data.image.public_key)
            return SuccessfulResponseSchema(message="Successfully deleted carousel.")
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def product_reviews(self, product_id: str,
                              data: ProductReviewsSchema,
                              current_user: DecodedTokenDTO, ):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            
            # check user role
            self.validate_users_role(current_user.role, is_admin=False)
            
            # check product
            product_data = await self.__uow.products.get_product_only(product_id)
            if not product_data:
                raise DomainNotFoundError("Can't review the product that is not exists.")
            
            # otherwise update the product
            await self.__uow.products.product_reviews(product_id, data.model_dump(exclude_none=True,
                                                                                  exclude_unset=True))
            return SuccessfulResponseSchema(message='Successfully saved ratings.')
        
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def update_product_information(self, product_id: str,
                                         new_data: UpdateProductsInformationRequestSchema,
                                         filenames: List[str],
                                         current_user: DecodedTokenDTO,
                                         img_bytes: List[bytes]):
        new_product_images = None
        is_images_uploaded = False
        try:
            
            # check first if user exist
            await self.check_if_user_exists(current_user.user_id)
            # then check if it's admin
            self.validate_users_role(current_user.role)
            
            # first query the data from db
            data = await self.__uow.products.find_record(product_id)
            if not data:
                raise DomainNotFoundError("Cannot update product that didn't exist.")
            
            product = ProductRequestSchema(**data.Products.model_dump())
            inventory = InventoryRequestSchema(**data.model_dump())
            details = ProductDetailsRequestSchema(**data.model_dump())
            # then make a copy on the original data and replace the old one
            # check first if images is 5 in database then raise an error. Only update the Not None value.
            if filenames:
                available_image_to_upload = (5 - len(details.images)) - len(filenames)
                # check first if the number of filenames is greater than 5
                if len(filenames) > 5:
                    
                    raise DomainUnprocessableEntityError(
                            f"You exceed the maximum of images to upload per product.")
                if available_image_to_upload < 0:
                    raise DomainUnprocessableEntityError(
                            f"You exceed the maximum of images to upload per product.")
            
            # then copy the old data and update by the new one.
            new_product = product.model_copy(
                    update=new_data.model_dump(exclude_none=True, exclude_unset=True))
            new_inventory = inventory.model_copy(
                    update=new_data.model_dump(exclude_none=True, exclude_unset=True))
            new_details = details.model_copy(
                    update=new_data.model_dump(exclude_unset=True, exclude_none=True))
            # set the quantity if not specified or 0 then set the actual quan in db and also the threshold.
            # sanitize fields
            new_product.category = Utility.capitalize_first_letters(new_product.category)
            new_product.tags = [Utility.capitalize_first_letters(tag) for tag in new_product.tags]
            new_product.product_name = Utility.capitalize_first_letters(new_product.product_name)
            if not new_inventory.quantity:
                new_inventory.quantity = inventory.quantity
            
            if not new_inventory.low_stock_threshold:
                
                new_inventory.low_stock_threshold = inventory.low_stock_threshold
            if not new_product.price:
                new_product.price = product.price
            
            # get the new_product_images, old images, and is image uploaded
            new_product_images, old_images, is_images_uploaded = await self.upload_images_on_cloudinary(
                    filenames=filenames, public_ids=new_data.public_ids,
                    images=details.images,
                    img_bytes=img_bytes
                    )
            
            # To track if there's a changes made.
            update_counter = 0
            # then check if there's changes in the product.
            
            new_details.images = old_images
            if product != new_product:
                update_counter += 1
                
                await self.__uow.products.update_record(product_id,
                                                        new_product.model_dump(exclude_none=True,
                                                                               exclude_unset=True))
            
            if inventory != new_inventory:
                update_counter += 1
                await self.__uow.products.update_product_inventory(product_id,
                                                                   new_inventory.model_dump(exclude_none=True,
                                                                                            exclude_unset=True))
            
            if details != new_details:
                update_counter += 1
                await self.__uow.products.update_product_details(product_id,
                                                                 new_details.model_dump(exclude_none=True,
                                                                                        exclude_unset=True))
            
            # check if there's an image uploaded
            if new_product_images:
                update_counter += 1
            
            # destroy the images in cloudinary after successful update the image product in database.
            if new_data.public_ids:
                # then loop through it.
                for public_id in details.images:
                    if public_id.public_key in new_data.public_ids:
                        # then destroy the image in the cloudinary.
                        await self.cloudinary_infrastructure.destroy_images(public_id.public_key)
            
            # then return the successful message
            response = SuccessfulResponseSchema(message="Successfully updated product information.")
            
            if update_counter <= 0:
                response.message = "No Changes made."
            
            return response
        
        except Exception as e:
            if is_images_uploaded:
                for product_image in new_product_images:
                    public_key = product_image.public_key
                    await self.cloudinary_infrastructure.destroy_images(public_key)
            raise e
    
    @retry_on_transient
    async def update_product_information_no_images(self, product_id: str,
                                                   new_data: UpdateProductsInformationRequestSchema,
                                                   current_user: DecodedTokenDTO,
                                                   ):
        
        # check first if user exist
        await self.check_if_user_exists(current_user.user_id)
        # then check the role if it's admin
        self.validate_users_role(current_user.role)
        try:
            # first query the data from db
            data = await self.__uow.products.find_record(product_id)
            if not data:
                raise DomainNotFoundError("Cannot update product that didn't exist.")
            
            product = ProductRequestSchema(**data.Products.model_dump())
            inventory = InventoryRequestSchema(**data.model_dump())
            details = ProductDetailsRequestSchema(**data.model_dump())
            # then make a copy on the original data and replace the old one
            
            # then copy the old data and update by the new one.
            new_product = product.model_copy(
                    update=new_data.model_dump(exclude_none=True, exclude_unset=True))
            new_inventory = inventory.model_copy(
                    update=new_data.model_dump(exclude_none=True, exclude_unset=True))
            new_details = details.model_copy(
                    update=new_data.model_dump(exclude_unset=True, exclude_none=True))
            
            # set the quantity if not specified or 0 then set the actual quantity price, and threshold in db.
            # sanitize fields
            new_product.category = Utility.capitalize_first_letters(new_product.category)
            new_product.tags = [Utility.capitalize_first_letters(tag) for tag in new_product.tags]
            new_product.product_name = Utility.capitalize_first_letters(new_product.product_name)
            
            if not new_inventory.quantity:
                new_inventory.quantity = inventory.quantity
            
            if not new_inventory.low_stock_threshold:
                new_inventory.low_stock_threshold = inventory.low_stock_threshold
            if not new_product.price:
                new_product.price = product.price
            
            # To track if there's a changes made.
            update_counter = 0
            # then check if there's changes in the product.
            
            if product != new_product:
                update_counter += 1
                
                await self.__uow.products.update_record(product_id,
                                                        new_product.model_dump(exclude_none=True,
                                                                               exclude_unset=True))
            
            if inventory != new_inventory:
                update_counter += 1
                await self.__uow.products.update_product_inventory(product_id,
                                                                   new_inventory.model_dump(exclude_none=True,
                                                                                            exclude_unset=True))
            
            if details != new_details:
                update_counter += 1
                await self.__uow.products.update_product_details(product_id,
                                                                 new_details.model_dump(exclude_none=True,
                                                                                        exclude_unset=True))
            
            # destroy the images in cloudinary after successful update the image product in database.
            if new_data.public_ids:
                # then loop through it.
                for public_id in details.images:
                    if public_id.public_key in new_data.public_ids:
                        # then destroy the image in the cloudinary.
                        await self.cloudinary_infrastructure.destroy_images(public_id.public_key)
            
            # then return the successful message
            response = SuccessfulResponseSchema(message="Successfully updated product information.")
            
            if update_counter <= 0:
                response.message = "No Changes made."
            
            return response
        
        except Exception as e:
            raise e
    
    async def update_product_images(self, product_id: str,
                                    public_ids: list[str],
                                    filenames: List[str],
                                    current_user: DecodedTokenDTO,
                                    img_bytes: List[bytes]):
        is_images_uploaded = False
        new_product_images = None
        
        try:
            # check first if user exist
            await self.check_if_user_exists(current_user.user_id)
            # then check the role if it's admin
            self.validate_users_role(current_user.role)
            # first query the data from db
            data = await self.__uow.products.get_product_details_only(product_id)
            
            if not data:
                raise DomainNotFoundError("Cannot update product that didn't exist.")
            
            details = ProductDetailsRequestSchema(**data.model_dump())
            # check first if images is 5 in the database, then raise an error if not. Only update the Not None value.
            if filenames:
                available_image_to_upload = (5 - len(details.images)) - len(filenames)
                number_of_to_replace_image = 0
                
                for public_id in data.images:
                    if public_id.public_key in public_ids:
                        number_of_to_replace_image += 1
                # check first if the number of filenames is greater than 5
                if len(filenames) > 5:
                    raise DomainUnprocessableEntityError(
                            f"You exceed the maximum of images to upload per product.")
                # if the available image to upload is negative it means no it exceeds the maximum number of upload file in the database.
                if available_image_to_upload + number_of_to_replace_image < 0:
                    raise DomainUnprocessableEntityError(
                            f"You exceed the maximum of images to upload per product.")
                    # get the new_product_images, old images, and is image uploaded
                new_product_images, old_images, is_images_uploaded = await self.upload_images_on_cloudinary(
                        filenames=filenames, public_ids=public_ids,
                        images=details.images,
                        img_bytes=img_bytes
                        )
                new_details = details.model_copy()
                new_details.images = old_images
                
                await self.__uow.products.update_product_details(product_id,
                                                                 new_details.model_dump(exclude_none=True,
                                                                                        exclude_unset=True))
                # destroy the images in cloudinary after successful update the image product in database.
                if details.images:
                    # then loop through it.
                    for public_id in details.images:
                        if public_id:
                            if public_id.public_key in public_id:
                                # then destroy the image in the cloudinary.
                                await self.cloudinary_infrastructure.destroy_images(public_id.public_key)
            
            response = SuccessfulResponseSchema(message="Successfully update images.")
            return response
        except Exception as e:
            if is_images_uploaded:
                for product_image in new_product_images:
                    public_key = product_image.public_key
                    await self.cloudinary_infrastructure.destroy_images(public_key)
            raise e
    
    @retry_on_transient
    async def delete_product_information(self, product_id, current_user: DecodedTokenDTO):
        try:
            # check first if user exist
            await self.check_if_user_exists(current_user.user_id)
            # then check the role if it's admin
            self.validate_users_role(current_user.role)
            data = await self.__uow.products.find_record(product_id)
            if not data:
                raise DomainNotFoundError("Cannot delete product that does not exist.")
            
            # delete the product from database
            await self.__uow.products.delete_record(product_id)
            
            details = ProductDetailsRequestSchema(**data.model_dump())
            
            if details.images:
                for image in details.images:
                    await self.cloudinary_infrastructure.destroy_images(image.public_key)
            
            response = SuccessfulResponseSchema(message="Successfully deleted product.")
            
            return response
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def delete_category(self, category_id: str, current_user: DecodedTokenDTO):
        try:
            # validate user if exists
            await self.check_if_user_exists(current_user.user_id)
            
            # check the user role
            self.validate_users_role(current_user.role)
            
            data = await self.__uow.products.find_category(category_id)
            if not data:
                raise DomainNotFoundError("Cannot delete category that is not exists.")
            await self.__uow.products.delete_category(category_id)
            return SuccessfulResponseSchema(message="Successfully deleted category.")
        except Exception as e:
            raise e
