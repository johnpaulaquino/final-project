from typing import Any, Dict, Optional

from sqlalchemy import Column, ForeignKey, JSON
from sqlmodel import Field, SQLModel


class BaseAddress(SQLModel):
    region: str = Field(nullable=True, default=None)
    province: str = Field(nullable=True, default=None)
    city: str = Field(nullable=True, default=None)
    barangay: str = Field(nullable=True, default=None)
    postal_code: str = Field(nullable=True, default=None)
    st_bd_hno: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON,nullable=True, default=None))  # street, building, and house number


class Address(BaseAddress, table=True):
    __tablename__ = "address"
    id: int = Field(primary_key=True, nullable=False)
    user_id: str = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
