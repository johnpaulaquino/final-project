from app.src.exceptions.domain_exceptions import DomainNotFoundError
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.orders_schema import CreateOrder
from app.src.schema.transaction_schema import CreateTransactionSchema


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
            
            # calculate the total amount
            # products
            product = product_data.Products
            total_amount = product.price * new_order.quantity
            
            # total reserved stock
            reserved_stock = product_data.reserved_stock + new_order.quantity if product_data.reserved_stock else new_order.quantity
            # then update the total from class.
            new_order.total = total_amount
            
            # insert new order in db.
            order_data = await self.uof.orders.insert_record(new_order)
            
            # update reserve quantity
            to_update = {"reserved_stock": reserved_stock}
            await self.uof.products.update_product_inventory(new_order.product_id, to_update)
            
            # Insert transaction into database.
            
            reference_number = order_data.format_order_number
            
            transaction_to_insert_data = CreateTransactionSchema(order_id=order_data.id,
                                                                 transaction_reference=reference_number)
            # insert into transaction
            transaction = await self.uof.transactions.insert_record(transaction_to_insert_data)
            print(transaction)
            # TODO insert into logs table
            
            # response
            return SuccessfulResponseSchema(message="Successfully placed order.", status_message="ok")
        except Exception as e:
            raise e
    
    async def handle_not_cod_payment(self):
        try:
            pass
        except Exception as e:
            raise e
