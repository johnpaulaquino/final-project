from sqlalchemy import delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_, select

from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Orders, Products
from app.src.schema.orders_schema import CreateOrder, OrderStatus


class OrdersRepository(UserInterface):
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def insert_record(self, record: CreateOrder):
        try:
            order = Orders(**record.model_dump())
            self.db.add(order)
        except Exception as e:
            raise e
    
    async def find_record(self, record_id: str):
        try:
            stmt = (select(Orders, Products.product_name, Products.price, Products.category)
                    .outerjoin(Orders, Products.id == Orders.product_id)
                    .where(Orders.id == record_id))
            result = await self.db.execute(stmt)
            data = result.mappings().fetchall()
            return data
        
        
        except Exception as e:
            raise e
    
    async def update_record(self, record_id: str, data: dict | None = None):
        pass
    
    async def cancel_order(self, order_id: str, user_id: str):
        """
        This function is to cancel specific order of a user. This is a user function.
        :param order_id: Unique id from order.
        :param user_id: unique id from user.
        :return:
        """
        try:
            stmt = update(Orders).values(status=OrderStatus.CANCELLED).where(
                    and_(Orders.id == order_id, Orders.user_id == user_id))
            await self.db.execute(stmt)
        except Exception as e:
            raise e
    
    async def delete_record(self, user_id: str):
        pass
    
    async def delete_record_two_param(self, user_id: str, order_id: str):
        """
        This function is to delete records from orders where user_id.
        :param user_id: is unique from user.
        :param order_id: is unique from user.
        :return:
        """
        try:
            stmt = delete(Orders).where(and_(Orders.user_id == user_id, Orders.id == order_id))
            await self.db.execute(stmt)
        except Exception as e:
            raise e
