from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, func, JSON
from sqlmodel import Field, SQLModel

from app.src.schema.orders_schema import OrderStatusSchema
from app.src.utils.utility import Utility


class CreateCopyOtherInfo(BaseModel):
    street: Optional[str] = Field(default=None)  # street or purok
    house_no: Optional[str] = Field(default=None)  # house no
    building_name: Optional[str] = Field(default=None)


class CreateBaseCopyAddress(SQLModel):
    address_id : str = Field(default=None)
    fullname: str = Field(default=None)
    region: str = Field(default=None)
    province: str = Field(default=None)
    city: str = Field(default=None)
    barangay: str = Field(default=None)
    postal_code: str = Field( default=None)
    st_bd_hno: CreateCopyOtherInfo = Field(default=None)


class Orders(SQLModel, table=True):
    __tablename__ = "orders"
    """
    This is order class. Class contains attributes.
    This will have a trigger on database.
        -Trigger would handle the subtracting for quantity on product after insert,
        and revoke or back again into its original quantity when the order is cancelled.
    """
    id: int = Field(primary_key=True)
    string_id: str = Field(unique=True, default_factory=lambda: Utility.generate_ref_number("ORD"), nullable=False)
    user_id: str = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    product_id: str = Field(sa_column=Column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False))
    quantity: int = Field(default=None, nullable=False)
    price: float = Field(default=0, nullable=True)
    order_status: str = Field(
            sa_column=(Column(SQLEnum(OrderStatusSchema, name="order_status_enum", create_type=True), nullable=False)))
    address_id: str = Field(nullable=True)
    address_copy : CreateBaseCopyAddress = Field(sa_column=Column(JSON,nullable=True))
    created_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), default=func.now(), server_default=func.now()))
    updated_at: datetime = Field(
            sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
