from datetime import datetime

from pydantic import BaseModel


class TransactionDTO(BaseModel):
    id: str | None = None
    order_id: int | None = None
    transaction_reference: str | None = None
    payment_provider_reference: str | None = None
    update_at: datetime | None = None
