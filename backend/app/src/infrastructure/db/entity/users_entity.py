from datetime import datetime
from uuid import uuid4

from pydantic import EmailStr
from sqlalchemy import ARRAY, Column, DateTime, String, func
from sqlmodel import Field, SQLModel

from app.src.schema import RoleSchema, SignInTypeSchema


class Users(SQLModel, table=True):
    __tablename__ = 'users'
    id: str = Field(primary_key=True, default_factory=lambda: str(uuid4()), index=True)
    email: EmailStr | str = Field(sa_column=Column(String, default=None, nullable=False, unique=True, index=True))
    password: str = Field(sa_column=Column(String, default=None, nullable=True))
    is_active: bool = Field(default=False, nullable=False)
    is_deleted: bool = Field(default=False, nullable=False)
    signin_type: list = Field(
            sa_column=Column(ARRAY(item_type=String), default=lambda: [SignInTypeSchema.PASSWORD], nullable=True,
                             index=True))
    login_at: datetime = Field(sa_column=Column(DateTime(timezone=True), default=None, nullable=True))
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), default=func.now(), server_default=func.now()))
    role: str = Field(default=RoleSchema.CUSTOMER, nullable=False)
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
    deleted_at: datetime = Field(sa_column=Column(DateTime(timezone=True), default=None, nullable=True))
    sign_up_steps: int = Field(nullable=True, default=1)
