from sqlalchemy import Column, ForeignKey
from sqlmodel import Field, SQLModel

from app.src.schema.products_schema import ProductStatusSchema


class Inventory(SQLModel, table=True):
    __tablename__ = "inventory"
    id: int = Field(primary_key=True)
    quantity: int = Field(default=0, nullable=False)
    low_stock_threshold: int = Field(nullable=False)
    reserved_stock: int = Field(nullable=False, default=0)
    cancelled_stock: int = Field(nullable=False, default=0)
    sold_stock: int = Field(nullable=False, default=0)
    product_id: str = Field(sa_column=Column(ForeignKey('products.id', ondelete="CASCADE"), nullable=False))
    
    @property
    def get_stock_status(self):
        if self.quantity > self.low_stock_threshold:
            return ProductStatusSchema.AVAILABLE
        elif self.quantity <= self.low_stock_threshold:
            return ProductStatusSchema.LOW_OF_STOCK
        elif self.quantity < 0:
            return ProductStatusSchema.OUT_OF_STOCK
        else:
            return "No status"  # return when no data
