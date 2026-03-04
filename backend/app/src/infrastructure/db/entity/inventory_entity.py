from sqlalchemy import Column, ForeignKey
from sqlmodel import Field, SQLModel


class Inventory(SQLModel, table=True):
    __tablename__ = "inventory"
    id: int = Field(primary_key=True)
    quantity: int = Field(default=0, nullable=False)
    low_stock_threshold: int = Field(nullable=False)
    available_stock: int = Field(nullable=False)
    reserved_stock: int = Field(nullable=False)
    cancelled_stock: int = Field(nullable=False)
    sold_stock: int = Field(nullable=False)
    product_id: str = Field(sa_column=Column(ForeignKey('products.id', ondelete="CASCADE"), nullable=False))
