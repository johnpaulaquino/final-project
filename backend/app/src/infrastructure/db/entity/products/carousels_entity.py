from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel

from app.src.schema.products_schema import Images


class BaseCarouselEntity(SQLModel):
    image: Optional[Images] = Field(sa_column=Column(JSON, nullable=True))


class CarouselEntity(BaseCarouselEntity, table=True):
    __tablename__ = 'carousel_images'
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)


class CreateCarousel(BaseCarouselEntity):
    pass


class UpdateCarousel(BaseCarouselEntity):
    pass
