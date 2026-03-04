from datetime import datetime

from pydantic import EmailStr
from sqlalchemy import Column, DateTime, String, func
from sqlmodel import Field, SQLModel


class BaseTempUsers(SQLModel):
    
    sign_up_steps: int = Field(nullable=True, default=1)
    email: EmailStr | str = Field(sa_column=Column(String, default=None, nullable=False, unique=True, index=True))


class TempUsers(BaseTempUsers, table=True):
    __tablename__ = "temp_users"
    id: int = Field(primary_key=True)
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), default=func.now(), server_default=func.now()))
