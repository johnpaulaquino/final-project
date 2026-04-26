from datetime import datetime
from uuid import uuid4

from fastapi import Body
from sqlalchemy import ARRAY, Column, DateTime, String, func
from sqlmodel import Field, SQLModel


class BaseNotifications(SQLModel):
    title: str = Field(nullable=False)
    description: str = Field(nullable=False)
    user_id: str = Field(default=None, foreign_key="users.id", )
    notification_type: str = Field(default="System", )  # System, Order, New Account, etc.
    receivers: list[str] = Field(default_factory=lambda: [], sa_column=Column(ARRAY(String), nullable=True))


class Notifications(BaseNotifications, table=True):
    __tablename__ = 'notifications'
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    is_user_read: bool = Field(default=False)
    is_admin_read: bool = Field(default=False)  # to make this
    is_clear: bool = Field(
            default=False)  # to make notification not visible to users only, but in admin it's visible to all
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True),
                                                  server_default=func.now(),
                                                  default=func.now()))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=True))
    
    deleted_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=True))


class CreateNotification(BaseNotifications):
    pass
    
    @staticmethod
    def create_depends(title: str = Body(...),
                       description: str = Body(...),
                       notification_type: str = Body(default="System")):
        return CreateNotification(title=title,
                                  description=description,
                                  notification_type=notification_type)


class UpdateNotification(BaseNotifications):
    pass
    
    @staticmethod
    def create_depends(title: str = Body(...),
                       description: str = Body(...),
                       notification_type: str = Body(default="System")):
        return UpdateNotification(title=title,
                                  description=description,
                                  notification_type=notification_type)
