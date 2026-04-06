from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.exceptions.domain_exceptions import DomainForbiddenAccessError, DomainNotFoundError
from app.src.exceptions.http_exceptions import JWTInvalidException
from app.src.infrastructure.db.entity.products.carts_entity import CreateCart
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema, RoleSchema, SuccessfulResponseSchema
from app.src.utils.utility import Utility


class CartsServices:
    def __init__(self, uof: SQLUnitOfWork):
        self.__uof = uof
    
    async def insert_cart(self, cart_data: CreateCart, current_user: DecodedTokenDTO):
        try:
            
            # check first if there's a user
            await self.check_user_exists(current_user)
            # check the role
            if current_user.role == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # check first if product exists
            product_data = await self.__uof.products.get_product_only(cart_data.product_id)
            if not product_data:
                raise DomainNotFoundError("Product not found.")
            # to check if there's a data inserted into carts
            data = await self.__uof.carts.get_cart(
                    product_id=cart_data.product_id,
                    user_id=current_user.user_id)
            if data:
                # then if there's a data then update the cart quantity only
                self.__uof.carts.update_cart(**data.model_dump())
                return SuccessfulResponseSchema(message="Successfully update quantity.")
            # set the user_id
            cart_data.user_id = current_user.user_id
            # then insert into database
            await self.__uof.carts.insert_record(cart_data)
            return SuccessfulResponseSchema(message="Successfully added product to cart.")
        except Exception as e:
            raise e
    
    async def get_product_cart(self, cart_id: str, product_id: str, current_user: DecodedTokenDTO):
        try:
            # check first if there's a user
            await self.check_user_exists(current_user)
            
            # check the role
            if current_user.role == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            data = await self.__uof.carts.get_cart_with_cart_id(cart_id=cart_id,
                                                                product_id=product_id,
                                                                user_id=current_user.user_id)
            if not data:
                raise DomainNotFoundError("No cart found.")
            
            return SuccessfulResponseSchema(message="Successfully retrieved cart.", data=data)
        except Exception as e:
            raise e
    
    async def get_paginated_user_cart(self, paginated: PaginatedSchema, current_user: DecodedTokenDTO):
        try:
            # check first if user exists
            await self.check_user_exists(current_user)
            
            # check the role
            if current_user.role == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            cart_data = await self.__uof.carts.get_paginated_carts_products(offset,
                                                                            paginated.limit,
                                                                            current_user.user_id)
            if not cart_data:
                return SuccessfulResponseSchema(message="No cart to retrieve.")
            
            total_records = await self.__uof.carts.get_total_records(current_user.user_id)
            
            paginated_result = Utility.get_paginated_data(offset=offset,
                                                          limit=paginated.limit,
                                                          skip=paginated.skip,
                                                          total_records=total_records)
            return SuccessfulResponseSchema(message="Successfully retrieved user carts.",
                                            paginated=paginated_result,
                                            data=cart_data)
        except Exception as e:
            raise e
    
    async def delete_user_cart(self, cart_id: str, current_user: DecodedTokenDTO):
        try:
            # check if there's a cart
            cart_data = await self.__uof.carts.get_cart(cart_id, current_user.user_id)
            if not cart_data:
                raise DomainNotFoundError("You can't delete cart that is not exist.")
            
            # then delete the cart
            await self.__uof.carts.delete_cart(cart_id, user_id=current_user.user_id)
            return SuccessfulResponseSchema(message="Successfully deleted cart.")
        
        except Exception as e:
            raise e
    
    async def check_user_exists(self, current_user: DecodedTokenDTO):
        try:
            # check first if there's a user
            user_data = await self.__uof.users.get_user_info_only(current_user.user_id)
            if not user_data:
                raise JWTInvalidException("No user foud. Please back to login.")
        except Exception as e:
            raise e
