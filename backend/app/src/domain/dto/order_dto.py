from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel


class OrderDTO(BaseModel):
    id: int | None = None
    user_id: str | None = None
    product_id: str | None = None
    quantity: int | None = None
    payment_method: str | None = None
    total: float | None = None
    order_status: str | None = None
    payment_status: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    
    @property
    def format_order_number(self) -> str:
        """
        This function is to format the order id.
        :return: the formatted order id that can user will see.
        """
        year_today = datetime.today().year
        return f'BKT-{uuid4().hex[:4]}{year_today}-{self.id:08d}'
