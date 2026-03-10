from fastapi.encoders import jsonable_encoder

from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.exceptions.domain_exceptions import DomainEntityStatusInvalidError, DomainNotFoundError
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedOutput, PaginatedSchema, SuccessfulResponseSchema
from app.src.schema.orders_schema import (CancelOrderSchema, ConfirmOrderSchema, CreateOrder, OrderStatus,
                                          ShippedOrderSchema, )
from app.src.schema.transaction_schema import CreateTransactionSchema
from app.src.utils.utility import Utility


class OrderServices:
    def __init__(self, uof: SQLUnitOfWork):
        self.uof = uof
    
    # the user id depends on the user who are logged in.
    # will insert safe router to this
    async def insert_order(self, new_order: CreateOrder, user_id: str):
        try:
            # add the user_id from current user
            new_order.user_id = user_id
            
            # find user if exists
            user = await self.uof.users.find_record_by_id(user_id)
            
            # check if user not exists
            if not user:
                raise DomainNotFoundError("User not found.")
            
            # find products
            product_data = await self.uof.products.find_record(new_order.product_id)
            # check if product not exists.
            if not product_data:
                raise DomainNotFoundError("Product not found.")
            
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
            # TODO insert into logs table
            
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
    
    async def confirm_order(self, order_update: ConfirmOrderSchema):
        try:
            
            # first get the orders
            data = await self.uof.orders.find_order(order_update.order_id,
                                                    order_update.user_id,
                                                    order_update.product_id)
            
            # if the order status is not Pending, then raise an error.
            if data.Orders.order_status != OrderStatus.Pending:
                raise DomainEntityStatusInvalidError("Can't confirm order that is not pending.")
            
            # update order status
            to_update = {"order_status": OrderStatus.Approved}
            await self.uof.orders.update_record(order_update.order_id, to_update)
            
            new_quantity = data.quantity - data.reserved_stock
            sold_stock = data.sold_stock + data.reserved_stock
            inventory_to_update = {"quantity": new_quantity, "sold_stock": sold_stock, "reserved_stock": 0}
            await self.uof.products.update_product_inventory(order_update.product_id, inventory_to_update)
            
            return SuccessfulResponseSchema(message="Successfully Confirmed order.")
        except Exception as e:
            raise e
    
    async def ship_order(self, order_update: ShippedOrderSchema):
        try:
            
            # first get the orders
            data = await self.uof.orders.find_order_only(order_update.order_id,
                                                         order_update.user_id,
                                                         order_update.product_id)
            
            # if the order status is not Pending or approved, then raise an error.
            if data.order_status not in [OrderStatus.Pending, OrderStatus.Approved]:
                
                raise DomainEntityStatusInvalidError("Can't confirm order that is not pending.")
            
            # update order status
            to_update = {"order_status": OrderStatus.Shipped}
            await self.uof.orders.update_record(order_update.order_id, to_update)
            
            return SuccessfulResponseSchema(message="Successfully Shipped order.")
        
        except Exception as e:
            raise e
    
    async def cancel_order(self, order_cancel: CancelOrderSchema):
        try:
            # first get the orders
            data = await self.uof.orders.find_order(order_cancel.order_id,
                                                    order_cancel.user_id,
                                                    order_cancel.product_id)
            if data.Orders.order_status not in [OrderStatus.Approved, OrderStatus.Pending]:
                raise DomainEntityStatusInvalidError(message="Cancellation of order is not valid at this phase.")
            
            # update order status into cancel
            to_update = {"order_status": OrderStatus.Cancelled}
            await self.uof.orders.update_record(order_cancel.order_id, to_update)
            
            # back to its original quantity
            new_quantity = data.quantity + data.sold_stock
            sold_stock = data.sold_stock - data.Orders.quantity
            
            inventory_to_update = {"quantity": new_quantity, "sold_stock": sold_stock}
            await self.uof.products.update_product_inventory(order_cancel.product_id, inventory_to_update)
            
            return SuccessfulResponseSchema(message="Successfully cancelled order.")
        
        except Exception as e:
            raise e
    
    async def get_paginated_orders(self, paginated: PaginatedSchema, order_status: str,
                                   current_user: DecodedTokenDTO,
                                   ):
        
        try:
            # get the current order of a user
            data = await self.uof.users.find_record_by_id(current_user.user_id)
            if not data:
                raise DomainNotFoundError("User not found. Please back to login.")
            
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            
            order_data = await self.uof.orders.paginated_orders(current_user.user_id,
                                                                offset,
                                                                paginated.limit,
                                                                order_status)
            
            total_records = await self.uof.orders.get_total_records()
            print(total_records)
            curr_page = offset + 1
            end_page = paginated.skip * paginated.limit
            has_next = True if (total_records - end_page) > 0 else False
            paginated_data = PaginatedOutput(start_page=curr_page, end_page=end_page,
                                             total_records=total_records,
                                             has_next=has_next)
            
            return SuccessfulResponseSchema(message="Successfully retrieved orders.", data=order_data,
                                            paginated=jsonable_encoder(paginated_data))
        except Exception as e:
            raise e
