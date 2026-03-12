from datetime import datetime
from typing import List
from uuid import uuid4

from pydantic import BaseModel, ConfigDict


class OrderDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    string_id: str | None = None
    user_id: str | None = None
    product_id: str | None = None
    quantity: int | None = None
    price: float | None = None
    order_status: str | None = None
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


class OrderDTOFullData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    Orders: OrderDTO
    product_name: str
    price: float
    category: str
    quantity: int
    sold_stock: int
    reserved_stock: int
    low_stock_threshold: int
    transaction_reference: str
    total_amount: int
    payment_provider_reference: str | None


class OrderDTOFullDataList(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    Orders: List[OrderDTOFullData] | None = None
