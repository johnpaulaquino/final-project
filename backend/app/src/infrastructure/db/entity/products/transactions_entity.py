import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, func
from sqlmodel import Field, SQLModel

from app.src.schema.orders_schema import OrderPaymentMethodSchema, OrderPaymentStatusSchema


class Transactions(SQLModel, table=True):
    __tablename__ = "transactions"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    order_id: int = Field(sa_column=Column(Integer, ForeignKey('orders.id', ondelete="Cascade")))
    transaction_reference: str = Field(sa_column=Column(String, unique=True, nullable=False, index=True))
    payment_provider_reference: str = Field(sa_column=Column(String, unique=True,
                                                             nullable=True))  # this will get the id of the payment provider. Exampl id of Stripe, Paypal or Gcash.
    total_amount: float = Field(default=None, nullable=False)
    payment_status: str = Field(
            sa_column=(
                    Column(SQLEnum(OrderPaymentStatusSchema, name="payment_status_enum", create_type=True), nullable=False)))
    payment_method: str = Field(
            sa_column=Column(SQLEnum(OrderPaymentMethodSchema, name='order_payment_method', create_type=True),
                             nullable=False))
    update_at: datetime = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now(), nullable=True))
    received_at: datetime = Field(sa_column=Column(DateTime(timezone=True), default=None, nullable=True))
    delivered_at: datetime = Field(sa_column=Column(DateTime(timezone=True), default=None, nullable=True))
    expected_to_arrive_at: datetime = Field(sa_column=Column(DateTime(timezone=True), default=None, nullable=True))
    