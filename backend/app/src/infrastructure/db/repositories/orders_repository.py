from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.src.domain.dto.order_dto import OrderDTO, OrderDTOFullData, OrderDTOFullDataList
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Inventory, Orders, Products, Transactions
from app.src.schema.orders_schema import CreateOrder, OrderStatus


class OrdersRepository(UserInterface):
    
    def __init__(self, _db: AsyncSession):
        self._db = _db
    
    async def insert_record(self, record: CreateOrder):
        try:
            order = Orders(**record.model_dump())
            self._db.add(order)
            await self._db.flush()
            
            return OrderDTO(**order.model_dump())
        except Exception as e:
            raise e
    
    async def find_order_only(self, order_id, user_id, product_id) -> OrderDTO:
        try:
            
            stmt = (select(Orders)
                    .where(and_(Orders.id == order_id,
                                Orders.product_id == product_id,
                                Orders.user_id == user_id)))
            result = await self._db.execute(stmt)
            data = result.scalars().first()
            
            return OrderDTO.model_validate(data) if data else data
        except Exception as e:
            raise e
    
    async def get_total_records(self, user_id: str,
                                order_status: str):
        try:
            conditions = [Orders.user_id == user_id]
            if order_status in OrderStatus:
                conditions.append(Orders.order_status == order_status)
            stmt = select(func.count(Orders.id)).where(and_(*conditions))
            result = await self._db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
    async def find_order(self, order_id, user_id, product_id) -> OrderDTOFullData:
        try:
            conditions = [Orders.user_id == user_id, Orders.id == order_id, Orders.product_id == product_id]
            
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
                    .outerjoin(Orders, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(*conditions)))
            result = await self._db.execute(stmt)
            data = result.mappings().fetchall()
            
            return OrderDTOFullData(**data[0]) if data else None
        
        except Exception as e:
            raise e
    
    async def paginated_orders(self, user_id, offset: int, limit: int, order_status: str):
        try:
            
            conditions = [Orders.user_id == user_id]
            print(order_status)
            if order_status in OrderStatus:
                
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
                    .outerjoin(Orders, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(*conditions))
                    .limit(limit)
                    .offset(offset))
            result = await self._db.execute(stmt)
            data = result.mappings().fetchall()
            data = {"Orders": data}
            return OrderDTOFullDataList(**data)
        except Exception as e:
            raise e
    
    async def find_order_with_status(self, order_id, user_id, product_id, order_status) -> OrderDTOFullData:
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
                    .outerjoin(Orders, Products.id == Orders.product_id)
                    .outerjoin(Inventory, Products.id == Inventory.product_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(and_(Orders.id == order_id,
                                Orders.product_id == product_id,
                                Orders.order_status == order_status,
                                Orders.user_id == user_id)))
            result = await self._db.execute(stmt)
            data = result.mappings().fetchall()
            
            return OrderDTOFullData(**data[0]) if data else None
        
        except Exception as e:
            raise e
    
    async def update_record(self, record_id: str, data: dict | None = None):
        pass
    
    async def update_order(self, order_id: str, user_id: str, data: dict):
        """
        This function is to cancel specific order of a user. This is a user function.
        :param order_id: Unique id from order.
        :param data: to map the columns on database and insert the actual data on itS.
        :param user_id: unique id from user.
        :return:S
        """
        try:
            stmt = update(Orders).values(**data).where(
                    and_(Orders.id == order_id, Orders.user_id == user_id))
            await self._db.execute(stmt)
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
            await self._db.execute(stmt)
        except Exception as e:
            raise e
