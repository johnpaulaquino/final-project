from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict

from app.src.schema.products_schema import Images


class ProductsDataDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str | None
    product_name: str | None
    price: float | None
    category: str | None
    tags: list[str] | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ProductInformationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str | None = None
    Products: ProductsDataDTO | None = None
    quantity: int | None = None
    low_stock_threshold: int | None = None
    reserved_stock: int | None = None
    cancelled_stock: int | None = None
    sold_stock: int | None = None
    description: str | None = None
    images: List[dict] | None = None
    inventory_id: int | None = None


class ListOfProductInformationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    products: List[ProductInformationDTO] | None = []


class ProductDetailsDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    images: List[Images] | None = None
    description: str | None = None


class ProductsInformationFilterWithTags(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    best_sellers: List[ProductInformationDTO] | None = None
    new_products: List[ProductInformationDTO] | None = None
