from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.src.domain.dto.order_dto import OrderDTO, OrderDTOFullData, OrderDTOFullDataList
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Inventory, Orders, Products, Transactions
from app.src.schema.orders_schema import CreateOrderSchema, OrderStatusSchema


class OrdersRepository(UserInterface):
    
    def __init__(self, __db: AsyncSession):
        self.__db = __db
    
    async def insert_record(self, record: CreateOrderSchema):
        try:
            order = Orders(**record.model_dump())
            self.__db.add(order)
            await self.__db.flush()
            
            return OrderDTO(**order.model_dump())
        except Exception as e:
            raise e
    
    async def batch_insert_orders(self, orders: list[CreateOrderSchema]):
        try:
            list_of_orders = [Orders(**order.model_dump()) for order in orders]
            self.__db.add_all(list_of_orders)
            await self.__db.flush()
        except Exception as e:
            raise e
    
    async def find_order_only(self, order_id, user_id) -> OrderDTO:
        try:
            conditions = [Orders.user_id == user_id]
            if isinstance(order_id, str):
                conditions.append(Orders.string_id == order_id)
            elif isinstance(order_id, int):
                conditions.append(Orders.id == order_id)
            
            stmt = (select(Orders)
                    .where(and_(*conditions)))
            result = await self.__db.execute(stmt)
            data = result.scalars().first()
            
            return OrderDTO.model_validate(data) if data else data
        except Exception as e:
            raise e
    
    async def get_total_revenue(self):
        try:
            stmt = select(func.sum(Transactions.total_amount))
            result = await self.__db.execute(stmt)
            data = result.scalar()
            return data
        except Exception as e:
            raise e
    
    async def get_total_orders(self):
        try:
            stmt = select(func.count(Orders.id)).where(Orders.order_status.in_([
                    OrderStatusSchema.Delivered.value,
                    OrderStatusSchema.Received.value]))
            result = await self.__db.execute(stmt)
            data = result.scalar()
            return data
        except Exception as e:
            raise e
    
    async def get_total_records(self, user_id: str,
                                order_status: str):
        try:
            conditions = [Orders.user_id == user_id]
            if order_status in OrderStatusSchema:
                conditions.append(Orders.order_status == order_status)
            stmt = select(func.count(Orders.id)).where(and_(*conditions))
            result = await self.__db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
    async def get_order_status_count(self, user_id: str = None):
        try:
            conditions = [Orders.order_status.in_([order_status for order_status in OrderStatusSchema])]
            
            if user_id:
                conditions.append(Orders.user_id == user_id)
            stmt = (
                select(Orders.order_status, func.count(Orders.id))
                .where(and_(*conditions))
                .group_by(Orders.order_status)
            )
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            return data
        except Exception as e:
            raise e
    
    async def find_order(self, order_id, user_id) -> OrderDTOFullData:
        try:
            conditions = [Orders.user_id == user_id, Orders.string_id == order_id]
            stmt = (select(Orders,
                           Products.product_name,
                           Products.id,
                           Products.price,
                           Products.category,
                           Inventory.quantity,
                           Inventory.sold_stock,
                           Inventory.reserved_stock,
                           Inventory.cancelled_stock,
                           Inventory.low_stock_threshold,
                           Transactions.transaction_reference,
                           Transactions.payment_status,
                           Transactions.total_amount,
                           Transactions.payment_provider_reference)
                    .select_from(Orders)
                    .join(Products, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(*conditions)))
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            
            return OrderDTOFullData(**data[0]) if data else None
        
        except Exception as e:
            raise e
    
    async def paginated_orders(self, user_id, offset: int, limit: int, order_status: str):
        try:
            
            conditions = [Orders.user_id == user_id]
            if order_status in OrderStatusSchema:
                
                conditions.append(Orders.order_status == order_status)
            stmt = (select(Orders,
                           Products.product_name,
                           Products.price,
                           Products.category,
                           Inventory.quantity,
                           Inventory.sold_stock,
                           Inventory.reserved_stock,
                           Inventory.cancelled_stock,
                           Inventory.low_stock_threshold,
                           Transactions.transaction_reference,
                           Transactions.payment_status,
                           Transactions.total_amount,
                           Transactions.payment_provider_reference)
                    .select_from(Orders)
                    .join(Products, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(*conditions))
                    .limit(limit)
                    .offset(offset))
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            data = {"Orders": data}
            return OrderDTOFullDataList(**data)
        except Exception as e:
            raise e
    
    async def admin_paginated_orders(self, offset: int, limit: int, order_status: str):
        try:
            
            conditions = []
            if order_status in OrderStatusSchema:
                
                conditions.append(Orders.order_status == order_status)
            stmt = (select(Orders,
                           Products.product_name,
                           Products.price,
                           Products.category,
                           Inventory.quantity,
                           Inventory.sold_stock,
                           Inventory.reserved_stock,
                           Inventory.cancelled_stock,
                           Inventory.low_stock_threshold,
                           Transactions.transaction_reference,
                           Transactions.payment_status,
                           Transactions.total_amount,
                           Transactions.payment_provider_reference)
                    .select_from(Orders)
                    .join(Products, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(*conditions))
                    .limit(limit)
                    .offset(offset))
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            data = {"Orders": data}
            return OrderDTOFullDataList(**data)
        except Exception as e:
            raise e
    
    async def find_order_with_status(self, order_id, user_id, order_status) -> OrderDTOFullData:
        try:
            stmt = (select(Orders,
                           Products.product_name,
                           Products.price,
                           Products.category,
                           Inventory.quantity,
                           Inventory.sold_stock,
                           Inventory.reserved_stock,
                           Inventory.cancelled_stock,
                           Inventory.low_stock_threshold,
                           Transactions.transaction_reference,
                           Transactions.payment_status,
                           Transactions.total_amount,
                           Transactions.payment_provider_reference)
                    .select_from(Orders)
                    .join(Products, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(Orders.string_id == order_id,
                                Orders.order_status == order_status,
                                Orders.user_id == user_id)))
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            
            return OrderDTOFullData(**data[0]) if data else None
        
        except Exception as e:
            raise e
    
    async def update_order(self, order_id: str, user_id: str, data: dict):
        """
        This function is to cancel specific order of a user. This is a user function.
        :param order_id: Unique from orders.
        :param data: to map the columns on database and insert the actual data on itS.
        :param user_id: unique id from user.
        :return:S
        """
        try:
            stmt = update(Orders).values(**data).where(
                    and_(Orders.string_id == order_id, Orders.user_id == user_id))
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def delete_record_two_param(self, user_id: str, order_id: str):
        """
        This function is to delete records from orders where user_id.
        :param user_id: is unique from user.
        :param order_id: is unique from user.
        :return:
        """
        try:
            stmt = delete(Orders).where(and_(Orders.user_id == user_id, Orders.string_id == order_id))
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
