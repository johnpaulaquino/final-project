from datetime import date
from typing import Any, Dict, Optional

from pydantic import BaseModel
from sqlalchemy import Column, Date, ForeignKey, JSON
from sqlmodel import Field, SQLModel



class PersonalInfo(SQLModel, table=True):
    __tablename__ = "personal_info"
    id: int = Field(primary_key=True, default=None)
    user_id: str = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    firstname: str = Field(nullable=False)
    lastname: str = Field(nullable=False)
    middle_name: Optional[str] = Field(nullable=True, default=None)
    phone_number: Optional[str] = Field(nullable=True, default=None)
    birth_date: date = Field(sa_column=Column(Date, nullable=True, default=None))
    profile_image: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON, nullable=True, default=None))
    is_phone_verified: bool = Field(default=False, nullable=False)
    age: int = Field(default=0, nullable=False)
