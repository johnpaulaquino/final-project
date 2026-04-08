from enum import Enum
from typing import List, Optional

from fastapi import Body
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.src.exceptions.domain_exceptions import DomainUnprocessableEntityError


class Images(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    public_key: str = Field(default=None)
    image_url: str = Field(default=None)


class ProductsFullInformationRequestSchema(BaseModel):
    product_name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    quantity: Optional[int] = Field(default=0)
    low_stock_threshold: Optional[int] = Field(default=20)
    description: Optional[str] = Field(default=None)
    images: Optional[List[Images | None]] = Field(default=None)
    
    # use to create/ insert product for full information, including inventory and details.
    @staticmethod
    def depends_schema(product_name: str = Body(None),
                       price: float = Body(None),
                       category: str = Body(None),
                       tags: Optional[list[str]] = Body(None),
                       quantity: int = Body(default=0),
                       low_stock_threshold: int = Body(default=0),
                       description: str = Body(None)):
        
        return ProductsFullInformationRequestSchema(product_name=product_name,
                                                    price=price,
                                                    tags=tags,
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
            raise DomainUnprocessableEntityError("Product name should not be empty.")
        
        return value
    
    @field_validator("price")
    def validate_price_field(cls, value):
        # convert first into string, to check whether is empty or not.
        
        # then back to float
        if value <= 0:
            raise DomainUnprocessableEntityError("Price should not be less than 0.")
        
        return value
    
    @field_validator("category")
    def validate_category_field(cls, value):
        if not value:
            raise DomainUnprocessableEntityError("Category should not be empty.")
        
        return value
    
    @field_validator("quantity")
    def validate_quantity_field(cls, value):
        if value < 0:
            return 0
        return value
    
    @field_validator("category")
    def validate_category(cls, value):
        if not value:
            return value
        
        categories_check = [ProductCategories.DRINKS.value.lower(), ProductCategories.PASTRY.value.lower()]
        categories = [ProductCategories.DRINKS.value, ProductCategories.PASTRY.value]
        if value not in categories:
            raise DomainUnprocessableEntityError(
                    f"Category must be in {categories_check}.")
        return value
    
    @field_validator("tags")
    def validate_tags(cls, value):
        if value is None:
            return []
        tags_check = [tag.value.lower() for tag in ProductsTags]
        tags = [tag.value for tag in ProductsTags]
        
        for val in value:
            if val.lower() not in tags_check:
                raise DomainUnprocessableEntityError(
                        f"Tags must be in {tags}.")
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
    tags: Optional[list[str]] = None
    
    public_ids: Optional[List[str]] = Body(None)
    
    @field_validator("price")
    def validate_price_field(cls, value):
        # convert first into string, to check whether is empty or not.
        if not value:
            return 0
        # then back to float
        if value <= 0:
            raise DomainUnprocessableEntityError("Price should not be less than 0.")
        
        return value
    
    @field_validator("quantity")
    def validate_quantity_field(cls, value):
        if not value:
            return 0
        if value < 0:
            return 0
        return value
    
    @field_validator("category")
    def validate_category(cls, value):
        if not value:
            return value
        
        categories_check = [ProductCategories.DRINKS.value.lower(), ProductCategories.PASTRY.value.lower()]
        categories = [ProductCategories.DRINKS.value, ProductCategories.PASTRY.value]
        if value not in categories_check:
            raise DomainUnprocessableEntityError(
                    f"Category must be in {categories}.")
        return value
    
    @field_validator("tags")
    def validate_tags(cls, value):
        if value is None:
            return []
        tags_check = [tag.value.lower() for tag in ProductsTags]
        tags = [tag.value for tag in ProductsTags]
        
        for val in value:
            if val.lower() not in tags_check:
                raise DomainUnprocessableEntityError(
                        f"Tags must be in {tags}.")
        return value
    
    @staticmethod
    def update_depends_schema(product_name: Optional[str] = Body(None),
                              price: Optional[float] = Body(None),
                              category: Optional[str] = Body(None),
                              quantity: Optional[int] = Body(None),
                              tags: Optional[list[str]] = Body(None),
                              low_stock_threshold: Optional[int] = Body(None),
                              description: Optional[str] = Body(None),
                              public_ids: Optional[List[str]] = Body(None),
                              ):
        return UpdateProductsInformationRequestSchema(product_name=product_name,
                                                      price=price,
                                                      category=category,
                                                      tags=tags,
                                                      quantity=quantity,
                                                      low_stock_threshold=low_stock_threshold,
                                                      description=description,
                                                      public_ids=public_ids)
    
    @staticmethod
    def update_depends_schema_no_public_id(product_name: Optional[str] = Body(None),
                                           price: Optional[float] = Body(None),
                                           category: Optional[str] = Body(None),
                                           quantity: Optional[int] = Body(None),
                                           low_stock_threshold: Optional[int] = Body(None),
                                           description: Optional[str] = Body(None),
                                           ):
        return UpdateProductsInformationRequestSchema(product_name=product_name,
                                                      price=price,
                                                      category=category,
                                                      quantity=quantity,
                                                      low_stock_threshold=low_stock_threshold,
                                                      description=description,
                                                      )


class ProductRequestSchema(BaseModel):
    product_name: str = None
    price: float = None
    category: str = None
    status: str = None
    tags: List[str] = None


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


class ProductsTags(str, Enum):
    BEST_SELLER = "Best Seller"
    NEW_PRODUCT = "New Product"


class ProductCategories(str, Enum):
    ALL = 'All'
    DRINKS = 'Drinks'
    PASTRY = 'Pastry'


ProductStatusSchema = ProductStatus()
