from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, func
from sqlmodel import Field, SQLModel

from app.src.schema.orders_schema import OrderStatusSchema


class Orders(SQLModel, table=True):
    __tablename__ = "orders"
    """
    This is order class. Class contains attributes.
    This will have a trigger on database.
        -Trigger would handle the subtracting for quantity on product after insert,
        and revoke or back again into its original quantity when the order is cancelled.
    """
    id: int = Field(primary_key=True)
    string_id: str = Field(unique=True, default_factory=lambda: str(uuid4()), nullable=False)
    user_id: str = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    product_id: str = Field(sa_column=Column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False))
    quantity: int = Field(default=None, nullable=False)
    price: float = Field(default=0, nullable=True)
    order_status: str = Field(
            sa_column=(Column(SQLEnum(OrderStatusSchema, name="order_status_enum", create_type=True), nullable=False)))
    
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), default=func.now(), server_default=func.now()))
    updated_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
