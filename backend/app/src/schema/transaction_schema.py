from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.src.schema.orders_schema import OrderPaymentMethodSchema, OrderPaymentStatusSchema


class CreateTransactionSchema(BaseModel):
    order_id: int = None
    transaction_reference: str
    payment_provider_reference: Optional[str] = None
    payment_method: OrderPaymentMethodSchema = OrderPaymentMethodSchema.COD
    total_amount: float = 0
    payment_status: OrderPaymentStatusSchema = OrderPaymentStatusSchema.Unpaid


class UpdateTransactionsSchema(BaseModel):
    payment_provider_reference: str | None = None
    total_amount: float | None = None
    payment_status: str | None = None
    payment_method: str | None = None
    update_at: datetime | None = None
    received_at: datetime | None = None
    delivered_at: datetime | None = None
    expected_to_arrive_at: datetime | None = None
