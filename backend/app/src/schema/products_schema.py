from typing import Dict, List, Optional

from fastapi import Body
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.src.exceptions.domain_exceptions import DomainInvalidFormatError


class Images(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    public_key: str = Field(default=None)
    image_url: str = Field(default=None)


class ProductsFullInformationRequestSchema(BaseModel):
    product_name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    quantity: Optional[int] = Field(default=0)
    low_stock_threshold: Optional[int] = Field(default=20)
    description: Optional[str] = Field(default=None)
    images: Optional[List[dict | None]] = Field(default=None)
    
    # use to create/ insert product for full information, including inventory and details.
    @staticmethod
    def depends_schema(product_name: str = Body(None),
                       price: float = Body(None),
                       category: str = Body(None),
                       quantity: int = Body(default=0),
                       low_stock_threshold: int = Body(default=0),
                       description: str = Body(None)):
        
        return ProductsFullInformationRequestSchema(product_name=product_name,
                                                    price=price,
                                                    category=category,
                                                    quantity=quantity,
                                                    low_stock_threshold=low_stock_threshold,
                                                    description=description)
    
    # validation
    @field_validator("low_stock_threshold")
    def validate_low_stock_threshold(cls, value):
        if value <= 0:
            return 20
        
        return value
        
        # validation
    
    @field_validator("product_name")
    def validate_product_name_field(cls, value):
        if not value:
            raise DomainInvalidFormatError("Product name should not be empty.")
        
        return value
    
    @field_validator("price")
    def validate_price_field(cls, value):
        # convert first into string, to check whether is empty or not.
        
        # then back to float
        if value < 0:
            raise DomainInvalidFormatError("Price should not be negative.")
        
        return value
    
    @field_validator("category")
    def validate_category_field(cls, value):
        if not value:
            raise DomainInvalidFormatError("Category should not be empty.")
        
        return value
    
    @field_validator("quantity")
    def validate_quantity_field(cls, value):
        if value < 0:
            return 0
        
        return value


class UpdateProductsInformationRequestSchema(BaseModel):
    product_name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[int] = Field(default=0)
    low_stock_threshold: Optional[int] = Field(default=20)
    description: Optional[str] = Field(default=None)
    images: Optional[List[Images | None]] = Field(default=None)
    
    public_ids: Optional[List[str]] = Body(None)
    
    @staticmethod
    def update_depends_schema(product_name: Optional[str] = Body(None),
                              price: Optional[float] = Body(None),
                              category: Optional[str] = Body(None),
                              quantity: Optional[int] = Body(None),
                              low_stock_threshold: Optional[int] = Body(None),
                              description: Optional[str] = Body(None),
                              public_ids: Optional[List[str]] = Body(None),
                              ):
        return UpdateProductsInformationRequestSchema(product_name=product_name,
                                                      price=price,
                                                      category=category,
                                                      quantity=quantity,
                                                      low_stock_threshold=low_stock_threshold,
                                                      description=description,
                                                      public_ids=public_ids)


class ProductRequestSchema(BaseModel):
    product_name: str = None
    price: float = None
    category: str = None
    status: str = None


class ProductDetailsRequestSchema(BaseModel):
    description: str = Field(default=None)
    images: list[Images] = Field(default=None)


# to insert data in inventory
class InventoryRequestSchema(BaseModel):
    quantity: int = Field(default=0)
    low_stock_threshold: int = Field(default=20)
    
    @staticmethod
    def schema_depends(quantity: int = Field(default=0),
                       low_stock_threshold: int = Field(default=20)):
        return InventoryRequestSchema(quantity=quantity,
                                      low_stock_threshold=low_stock_threshold)


class UpdateProductsInventorySchema(BaseModel):
    quantity: int | None = None
    low_stock_threshold: int | None = None
    reserved_stock: int | None = None
    cancelled_stock: int | None = None
    sold_stock: int | None = None
    product_id: str | None = None


class ProductStatus(BaseModel):
    AVAILABLE: str = "Available"
    OUT_OF_STOCK: str = "Out of stock"
    LOW_OF_STOCK: str = "Low of stock"


ProductStatusSchema = ProductStatus()
