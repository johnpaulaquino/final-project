from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.exceptions.domain_exceptions import (DomainEntityStatusInvalidError, DomainForbiddenAccessError,
                                                  DomainJWTInvalidError,
                                                  DomainNotFoundError, )
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema, RoleSchema, SuccessfulResponseSchema
from app.src.schema.orders_schema import (BatchCreateOrderSchema, ConfirmOrderSchema, CreateOrderSchema,
                                          OrderStatusSchema, UpdateOrdersSchema,
                                          )
from app.src.schema.products_schema import UpdateProductsInventorySchema
from app.src.schema.transaction_schema import CreateTransactionSchema
from app.src.utils.utility import Utility


class OrderServices:
    def __init__(self, uof: SQLUnitOfWork):
        self.uof = uof
    
    # the user id depends on the user who are logged in.
    # will insert safe router to this
    async def insert_order(self, new_order: CreateOrderSchema, current_user: DecodedTokenDTO):
        
        try:
            
            # add the user_id from current user
            new_order.user_id = current_user.user_id
            
            # validate the role
            if Utility.capitalize_first_letters(current_user.role) == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # get user in db.
            user = await self.uof.users.find_record_by_id(current_user.user_id)
            
            # check if user not exists
            if not user:
                raise DomainJWTInvalidError("No user not found. Please back to login.")
            
            # find products
            product_data = await self.uof.products.find_record(new_order.product_id)
            # check if product not exists.
            if not product_data:
                raise DomainNotFoundError("You cannot place an order that the product is not exist.")
            
            # products
            product = product_data.Products
            
            # set the actual price
            new_order.price = product.price
            # insert new order in db.
            order_data = await self.uof.orders.insert_record(new_order)
            
            # total reserved stock
            reserved_stock = product_data.reserved_stock + new_order.quantity if product_data.reserved_stock else new_order.quantity
            
            # update reserve quantity that will map on inventory column.
            to_update = {"reserved_stock": reserved_stock}
            await self.uof.products.update_product_inventory(new_order.product_id, to_update)
            
            # Insert transaction into database.
            
            reference_number = order_data.format_order_number
            total_amount = product.price * new_order.quantity
            transaction_to_insert_data = CreateTransactionSchema(order_id=order_data.id,
                                                                 total_amount=total_amount,
                                                                 payment_method=new_order.payment_method,
                                                                 transaction_reference=reference_number)
            # insert into transaction
            transaction = await self.uof.transactions.insert_record(transaction_to_insert_data)
            # TODO Project insert into logs table
            
            # response
            return SuccessfulResponseSchema(message="Successfully placed order.", status_message="ok")
        except Exception as e:
            raise e
    
    async def batch_insert_order(self, new_orders: BatchCreateOrderSchema, current_user: DecodedTokenDTO):
        try:
            
            # validate the role
            if Utility.capitalize_first_letters(current_user.role) == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # get user in db.
            user = await self.uof.users.find_record_by_id(current_user.user_id)
            
            # check if user not exists
            if not user:
                raise DomainJWTInvalidError("No user not found. Please back to login.")
            
            # get the products ids
            product_ids = [order.product_id for order in new_orders.orders]
            # find products
            product_data = await self.uof.products.find_products_with_product_ids(product_ids)
            # check if product not exists.
            if not product_data:
                raise DomainNotFoundError("You cannot place an orders that the product is not exist.")
            
            if not new_orders.orders:
                raise DomainEntityStatusInvalidError(message="Product is empty, cannot checkout this.")
            for order in new_orders.orders:
                print
                # map the product id, quantity, and payment method for each product.
                create_order = CreateOrderSchema(**order.model_dump(exclude_none=True, exclude_unset=True))
                # then explicit update the user id
                create_order.user_id = current_user.user_id
                
                current_product = list(filter(lambda x: x.Products.id == order.product_id, product_data.products))[0]
                # total reserved stock
                reserved_stock = current_product.reserved_stock + order.quantity if current_product.reserved_stock else order.quantity
                to_update = {"reserved_stock": reserved_stock}
                create_order.price = current_product.Products.price
                
                # insert new order in db.
                order_data = await self.uof.orders.insert_record(create_order)
                
                # update reserve quantity that will map on inventory column.
                await self.uof.products.update_product_inventory(order.product_id, to_update)
                
                reference_number = order_data.format_order_number
                total_amount = current_product.Products.price * order.quantity
                
                # Insert transaction into database.
                transaction_to_insert_data = CreateTransactionSchema(order_id=order_data.id,
                                                                     total_amount=total_amount,
                                                                     payment_method=order.payment_method,
                                                                     transaction_reference=reference_number)
                # insert into transaction
                await self.uof.transactions.insert_record(transaction_to_insert_data)
            # TODO Project insert into logs table
            # response
            return SuccessfulResponseSchema(message="Successfully placed order.", status_message="ok")
        except Exception as e:
            raise e
    
    async def handle_gcash_payment(self):
        
        try:
            pass
        except Exception as e:
            raise e
    
    async def handle_stripe_payment(self):
        try:
            pass
        except Exception as e:
            raise e
    
    async def confirm_order(self, order_id, data: ConfirmOrderSchema, current_user: DecodedTokenDTO):
        
        try:
            # validate the role
            if Utility.capitalize_first_letters(current_user.role) == RoleSchema.CUSTOMER:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # check the product and order
            order_data, product_data = await self.__check_product_orders_user_exist(order_id, data.user_id,
                                                                                    "Cannot confirm order that is not exist.")
            
            if order_data.Orders.order_status != OrderStatusSchema.Pending:
                raise DomainEntityStatusInvalidError("Can't confirm order that is not pending.")
            
            # update order status
            order_to_update = UpdateOrdersSchema(order_status=OrderStatusSchema.Approved).model_dump(exclude_none=True,
                                                                                                     exclude_unset=True)
            await self.uof.orders.update_order(order_id, current_user.user_id, order_to_update)
            
            # update the inventory
            new_quantity = order_data.quantity - order_data.reserved_stock
            sold_stock = order_data.sold_stock + order_data.reserved_stock
            # call the class and make it dict using model dump.
            inventory_to_update = UpdateProductsInventorySchema(quantity=new_quantity,
                                                                sold_stock=sold_stock,
                                                                reserved_stock=0).model_dump(
                    exclude_unset=True, exclude_none=True)
            await self.uof.products.update_product_inventory(product_data.Products.id, inventory_to_update)
            
            return SuccessfulResponseSchema(message="Successfully Confirmed order.")
        except Exception as e:
            raise e
    
    async def ship_order(self, order_id, data: ConfirmOrderSchema, current_user: DecodedTokenDTO):
        try:
            # validate the role
            if Utility.capitalize_first_letters(current_user.role) == RoleSchema.CUSTOMER:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # check the product and order
            order_data, product_data = await self.__check_product_orders_user_exist(order_id, data.user_id,
                                                                                    "Cannot ship order that is not exist.")
            # set the validated
            validated_order_status = Utility.capitalize_first_letters(order_data.Orders.order_status)
            # if the order status is not Pending or approved, then raise an error.
            if validated_order_status != OrderStatusSchema.Approved:
                raise DomainEntityStatusInvalidError("Can't ship order that is not Approved.")
            
            # call the class and make the dict to update order status
            order_to_update = UpdateOrdersSchema(order_status=OrderStatusSchema.Shipped).model_dump(
                    exclude_none=True, exclude_unset=True
                    )
            await self.uof.orders.update_order(order_id,
                                               current_user.user_id,
                                               order_to_update)
            
            return SuccessfulResponseSchema(message="Successfully Shipped order.")
        
        except Exception as e:
            raise e
    
    async def cancel_order(self, order_id,
                           current_user: DecodedTokenDTO):
        try:
            # validate the role
            if Utility.capitalize_first_letters(current_user.role) == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # check the product and order
            order_data, product_data = await self.__check_product_orders_user_exist(order_id, current_user.user_id,
                                                                                    "Cannot cancel order that is not exist.")
            # then check if the status of order not in Approved or pending then raise an error.
            if order_data.Orders.order_status not in [OrderStatusSchema.Approved, OrderStatusSchema.Pending]:
                raise DomainEntityStatusInvalidError(message="Cancellation of order is not valid at this phase.")
            
            # update order status into cancel
            order_to_update = UpdateOrdersSchema(order_status=OrderStatusSchema.Cancelled).model_dump(
                    exclude_none=True, exclude_unset=True
                    )
            await self.uof.orders.update_order(order_id,
                                               current_user.user_id,
                                               order_to_update)
            
            # back to its original quantity
            new_quantity = order_data.quantity + order_data.sold_stock
            sold_stock = order_data.sold_stock - order_data.Orders.quantity
            
            inventory_to_update = UpdateProductsInventorySchema(quantity=new_quantity,
                                                                sold_stock=sold_stock).model_dump(
                    exclude_unset=True, exclude_none=True
                    )
            await self.uof.products.update_product_inventory(product_data.Products.id, inventory_to_update)
            
            return SuccessfulResponseSchema(message="Successfully cancelled order.")
        
        except Exception as e:
            raise e
    
    async def delivered_order(self, order_id, user_id, current_user: DecodedTokenDTO):
        
        try:
            pass
        except Exception as e:
            raise e
    
    async def received_order(self, order_id, data: ConfirmOrderSchema, current_user: DecodedTokenDTO):
        try:
            # validate the role
            if Utility.capitalize_first_letters(current_user.role) == RoleSchema.ADMIN:
                raise DomainForbiddenAccessError("You don't have rights to access this.")
            
            # check the product and order
            order_data, product_data = await self.__check_product_orders_user_exist(order_id, data.user_id,
                                                                                    "Cannot ship order that is not exist.")
            # set the validated
            validated_order_status = Utility.capitalize_first_letters(order_data.order_status)
            # if the order status is not Delivered, then raise an error.
            if validated_order_status != OrderStatusSchema.Delivered:
                raise DomainEntityStatusInvalidError("Can't set as received the order that is not Delivered.")
            
            # update order status
            
            order_to_update = UpdateOrdersSchema(order_status=OrderStatusSchema.Received).model_dump(
                    exclude_none=True, exclude_unset=True
                    )
            await self.uof.orders.update_order(order_id,
                                               current_user.user_id,
                                               order_to_update)
            
            return SuccessfulResponseSchema(message="Successfully Received order.")
        
        except Exception as e:
            raise e
    
    async def get_paginated_orders(self, paginated: PaginatedSchema,
                                   order_status: str,
                                   current_user: DecodedTokenDTO):
        
        try:
            # get the current order of a user
            data = await self.uof.users.find_record_by_id(current_user.user_id)
            if not data:
                raise DomainNotFoundError("User not found. Please back to login.")
            
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            validated_order_status = Utility.capitalize_first_letters(order_status)
            if validated_order_status not in OrderStatusSchema and validated_order_status != "All":
                raise DomainEntityStatusInvalidError(f"{order_status} is not a valid order status.")
            
            order_data = await self.uof.orders.paginated_orders(current_user.user_id,
                                                                offset,
                                                                paginated.limit,
                                                                validated_order_status)
            total_records = await self.uof.orders.get_total_records(user_id=current_user.user_id,
                                                                    order_status=validated_order_status)
            
            paginated_data = Utility.get_paginated_data(offset=offset,
                                                        total_records=total_records,
                                                        skip=paginated.skip,
                                                        limit=paginated.limit)
            return SuccessfulResponseSchema(message="Successfully retrieved orders.", data=order_data,
                                            paginated=paginated_data)
        except Exception as e:
            raise e
    
    async def __check_product_orders_user_exist(self, order_id, user_id, message):
        
        try:
            
            # find if the user exists.
            user_data = await self.uof.users.find_record_by_id(user_id)
            if not user_data:
                raise DomainNotFoundError("Cannot process this order, because no user found.")
            
            # find order first.
            order_data = await self.uof.orders.find_order(order_id,
                                                          user_id)
            # check if order s not exist, then raise an error.
            if not order_data:
                raise DomainNotFoundError(message)
            
            # fin product.
            product = await self.uof.products.find_record(order_data.Orders.product_id)
            # check if not product exists.
            if not product:
                raise DomainNotFoundError("Cannot process this order,because product not found.")
            
            # if no error then return a tuple of Order and product object.
            return order_data, product
        except Exception as e:
            raise e
