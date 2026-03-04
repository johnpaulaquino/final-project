from app.src.exceptions.domain_exceptions import DomainNotFoundError
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.orders_schema import CreateOrder


class OrderServices:
    def __init__(self, uof: SQLUnitOfWork):
        self.uof = uof
    
    # the user id depends on the user who are logged in.
    # will insert safe router to this
    async def insert_order(self, new_order: CreateOrder, user_id: str):
        try:
            new_order.user_id = user_id
            product_data = await self.uof.products.get_product_only(new_order.product_id)
            
            # check if there's a product
            if not product_data:
                raise DomainNotFoundError("Product not found.")
            
            # calculate the total amount
            total_amount = product_data.price * new_order.quantity
            
            # then update the total from class.
            new_order.total = total_amount
            
            # TODO Update stocks
            
            # TODO insert into transaction table
            
            # TODO insert into logs table
            
            # insert into database.
            await self.uof.orders.insert_record(new_order)
            # response
            return SuccessfulResponseSchema(message="Successfully placed order.", status_message="ok")
        except Exception as e:
            raise e
    
    async def handle_not_cod_payment(self):
        try:
            pass
        except Exception as e:
            raise e
