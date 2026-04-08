from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class BaseProductRatings(SQLModel):
    rates: int = Field(nullable=True, default=0)
    user_id: str = Field(nullable=True, foreign_key="users.id", ondelete="CASCADE")
    product_id: str = Field(nullable=True, foreign_key="products.id", ondelete="CASCADE")
    user_comments: str = Field(sa_column=Column(Text, nullable=True, ))


class ProductRatings(BaseProductRatings, table=True):
    __tablename__ = "products_ratings"
    id: int = Field(primary_key=True)


class CreateProductsRatings(BaseProductRatings):
    pass
