from uuid import uuid4

from sqlmodel import Field, SQLModel


class Categories(SQLModel, table=True):
    __tablename__ = "categories"
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    category: str = Field(nullable=False, )
