from datetime import datetime
from typing import Optional

from fastapi import Body
from sqlalchemy import Column, DateTime, Text, func
from sqlmodel import Field, SQLModel


class BaseProductRatings(SQLModel):
    rates: Optional[int] = Field(nullable=True, default=0)
    user_id: Optional[str] = Field(default=None, nullable=True, foreign_key="users.id", ondelete="CASCADE")
    product_id: Optional[str] = Field(default=None, nullable=True, foreign_key="products.id", ondelete="CASCADE")
    user_comments: Optional[str] = Field(sa_column=Column(Text, nullable=True, ))


class ProductRatings(BaseProductRatings, table=True):
    __tablename__ = "products_ratings"
    id: int = Field(primary_key=True)
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True),
                                                  server_default=func.now(),
                                                  default=func.now()))


class CreateProductsRatings(BaseProductRatings):
    
    @staticmethod
    def depends(rates: int = Body(None), user_comments: str = Body(None)):
        return CreateProductsRatings(rates=rates,
                                     user_comments=user_comments)
