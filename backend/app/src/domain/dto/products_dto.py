from datetime import datetime
from typing import List

from pydantic import BaseModel


class ProductsDataDTO(BaseModel):
    id: str
    product_name: str
    price: float
    category: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ProductInformationDTO(BaseModel):
    status: str | None = None
    Products: ProductsDataDTO | None = None
    quantity: int | None = None
    low_stock_threshold: int | None = None
    reserved_stock: int | None = None
    cancelled_stock: int | None = None
    sold_stock: int | None = None
    description: str | None = None
    images: List[dict] | None = None


class ProductSuccessfulResponse(BaseModel):
    message: str
    data: dict = None
    access_token: str = None
    refresh_token: str = None
    action: str = None
    paginated: dict = None
