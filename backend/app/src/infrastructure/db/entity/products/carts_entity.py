from datetime import datetime
from uuid import uuid4

from fastapi import Body
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


class BaseCarts(SQLModel):
    product_id: str = Field(foreign_key="products.id", ondelete="CASCADE", nullable=False)
    user_id: str | None = Field(default=None, foreign_key="users.id", ondelete="CASCADE", nullable=False)
    quantity: int = Field(nullable=False, )


class Carts(BaseCarts, table=True):
    __tablename__ = "carts"
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True),
                             default=func.now(),
                             server_default=func.now()))


class CreateCart(BaseCarts):
    
    @staticmethod
    def depends(product_id: str = Body(...),
                quantity: int = Body(default=1)):
        return CreateCart(product_id=product_id, quantity=quantity)


class GetCart(BaseCarts):
    cart_id: str = Body(...)
    
    @staticmethod
    def depends(
            product_id: str = Body(...),
            cart_id: str = Body(...),
            ):
        return CreateCart(product_id=product_id, cart_id=cart_id)
