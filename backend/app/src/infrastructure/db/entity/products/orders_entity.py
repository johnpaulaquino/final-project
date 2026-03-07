from datetime import datetime

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, func
from sqlmodel import Field, SQLModel

from app.src.schema.orders_schema import OrderPaymentMethod, OrderPaymentStatus, OrderStatus


class Orders(SQLModel, table=True):
    __tablename__ = "orders"
    """
    This is order class. Class contains attributes.
    This will have a trigger on database.
        -Trigger would handle the subtracting for quantity on product after insert,
        and revoke or back again into its original quantity when the order is cancelled.
    """
    id: int = Field(primary_key=True)
    user_id: str = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    product_id: str = Field(sa_column=Column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False))
    quantity: int = Field(default=None, nullable=False)
    payment_method: str = Field(
            sa_column=Column(SQLEnum(OrderPaymentMethod, name='order_payment_method', create_type=True),
                             nullable=False))
    
    total: float = Field(default=None, nullable=False)
    order_status: str = Field(
            sa_column=(Column(SQLEnum(OrderStatus, name="order_status_enum", create_type=True), nullable=False)))
    payment_status: str = Field(
            sa_column=(
                    Column(SQLEnum(OrderPaymentStatus, name="payment_status_enum", create_type=True), nullable=False)))
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), default=func.now(), server_default=func.now()))
    updated_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
