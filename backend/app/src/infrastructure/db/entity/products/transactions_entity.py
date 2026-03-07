import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlmodel import Field, SQLModel


class Transactions(SQLModel, table=True):
    __tablename__ = "transactions"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    order_id: int = Field(sa_column=Column(Integer, ForeignKey('orders.id', ondelete="Cascade")))
    transaction_reference: str = Field(sa_column=Column(String, unique=True, nullable=False))
    payment_provider_reference: str = Field(sa_column=Column(String, unique=True,
                                                             nullable=True))  # this will get the id of the payment provider. Exampl id of Stripe, Paypal or Gcash.
    update_at: datetime = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now(), nullable=True))
