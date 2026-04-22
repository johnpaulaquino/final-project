from sqlalchemy import delete, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_, select

from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity.notifications_entity import CreateNotification, Notifications


class NotificationRepository(UserInterface):
    
    def __init__(self, _db: AsyncSession):
        self.__db = _db
    
    async def insert_record(self, notification: CreateNotification):
        try:
            data = Notifications(**notification.model_dump(exclude_none=True, exclude_unset=True))
            self.__db.add(data)
            
            return data
        except Exception as e:
            raise e
    
    async def find_record(self, record_id: str):
        try:
            stmt = select(Notifications).where(Notifications.id == record_id)
            result = await self.__db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
    async def get_paginated_data(self, offset: int, limit: int, user_id):
        try:
            stmt = select(Notifications).where(Notifications.user_id == user_id).offset(offset).limit(limit)
            result = await self.__db.execute(stmt)
            data = result.scalars().fetchall()
            
            return data
        
        except Exception as e:
            raise e
    
    async def get_total_notifications(self, user_id: str):
        try:
            stmt = select(func.count(Notifications.id)).where(Notifications.user_id == user_id)
            result = await self.__db.execute(stmt)
            data = result.scalar()
            return data
        except Exception as e:
            raise e
    
    async def update_record(self, record_id: str, data: dict | None = None):
        try:
            pass
        except Exception as e:
            raise e
    
    async def update_is_read_notification(self, notification_id: str, user_id: str, data: dict):
        try:
            stmt = update(Notifications).where(and_(Notifications.id == notification_id,
                                                    Notifications.user_id == user_id)).values(**data)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def mark_all_as_read_notifications(self, user_id: str, data):
        try:
            
            stmt = update(Notifications).where(Notifications.user_id == user_id).values(**data)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def clear_user_notifications(self, user_id: str, data: dict):
        try:
            stmt = update(Notifications).where(and_(Notifications.user_id == user_id)).values(data)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    # for admin to delete notification
    async def delete_record(self, notification_id: str):
        try:
            stmt = delete(Notifications).where(Notifications.id == notification_id)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    # for admin to delete all notifications
    async def clear_notifications(self):
        try:
            stmt = delete(Notifications)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
