from typing import Optional

from pydantic import BaseModel

from app.src.schema.orders_schema import OrderPaymentMethod, OrderPaymentStatus


class CreateTransactionSchema(BaseModel):
    order_id: int = None
    transaction_reference: str
    payment_provider_reference: Optional[str] = None
    payment_method: OrderPaymentMethod = OrderPaymentMethod.COD
    total_amount: float = 0
    payment_status: OrderPaymentStatus = OrderPaymentStatus.Unpaid
