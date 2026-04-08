import uuid
from datetime import datetime

from sqlalchemy import ARRAY, Column, DateTime, String, func
from sqlmodel import Field, SQLModel


class BaseProduct(SQLModel):
    product_name: str = Field(nullable=False)
    price: float = Field(nullable=False)
    category: str = Field(nullable=False)
    tags: list[str] = Field(default_factory=lambda: [], sa_column=Column(ARRAY(String), nullable=True))


class Products(BaseProduct, table=True):
    __tablename__ = "products"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), nullable=False, primary_key=True)
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), default=func.now(), server_default=func.now(),
                             onupdate=func.now()))
    updated_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()))
