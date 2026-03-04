from sqlalchemy import Column, ForeignKey, JSON
from sqlmodel import Field, SQLModel


class BaseProductDetails(SQLModel):
    description: str = Field(nullable=True)
    images: dict = Field(sa_column=Column(JSON, nullable=True))


class ProductDetails(BaseProductDetails, table=True):
    __tablename__ = "product_details"
    id: int = Field(primary_key=True)
    product_id: str = Field(sa_column=Column(ForeignKey("products.id", ondelete="CASCADE"),
                                             nullable=True))
