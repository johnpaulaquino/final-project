from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_

from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Products
from app.src.infrastructure.db.entity.products.carts_entity import Carts, CreateCarts


class CartsRepository(UserInterface):
    def __init__(self, db: AsyncSession):
        self.__db = db
    
    async def insert_record(self, record: CreateCarts):
        try:
            cart = Carts(**record.model_dump())
            self.__db.add(cart)
        except Exception as e:
            raise e
    
    async def get_cart(self, cart_id: str, user_id: str) -> Carts:
        try:
            stmt = select(Carts).where(and_(Carts.id == cart_id,
                                            Carts.user_id == user_id
                                            ))
            result = await self.__db.execute(stmt)
            data = result.scalars().one_or_none()
            return data
        except Exception as e:
            raise e
    
    async def delete_cart(self, cart_id: str, user_id: str):
        try:
            stmt = delete(Carts).where(and_(Carts.id == cart_id,
                                            Carts.user_id == user_id))
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def get_cart_product(self, cart_id: str, user_id: str):
        try:
            stmt = (select(Carts.id, Carts.quantity,
                           Products.product_name,
                           Products.id,
                           Products.category,
                           Products.price, )
                    .select_from(Carts)
                    .join(Carts, Products.id == Carts.product_id)
                    .where(and_(Carts.id == cart_id, Carts.user_id == user_id)))
            result = await self.__db.execute(stmt)
            data = result.scalars().one_or_none()
            return data
        except Exception as e:
            raise e
    
    async def get_paginated_carts_products(self, offset, limit, user_id: str):
        try:
            stmt = (select(Carts, Products)
                    .select_from(Carts)
                    .join(Carts, Products.id == Carts.product_id)
                    .where(Carts.user_id == user_id)
                    .offset(offset)
                    .limit(limit))
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            return data
        except Exception as e:
            raise e
    
    async def update_cart(self, user_id: str, cart_id: str, data: dict):
        try:
            stmt = (update(Carts).where(and_(
                    Carts.user_id == user_id, Carts.id == cart_id))
                    .values(**data))
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def get_total_records(self, user_id):
        try:
            stmt = select(func.count(Carts.id)).where(Carts.user_id == user_id)
            result = await self.__db.execute(stmt)
            data = result.scalar()
            return data
        except Exception as e:
            raise e
