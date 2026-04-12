from typing import Optional
from uuid import uuid4

from fastapi import Body
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey, JSON
from sqlmodel import Field, SQLModel


class OtherInfo(BaseModel):
    street: Optional[str] = Field(default=None)  # street or purok
    house_no: Optional[str] = Field(default=None)  # house no
    building_name: Optional[str] = Field(default=None)


class BaseAddress(SQLModel):
    fullname: str = Field(nullable=False)
    region: str = Field(nullable=True, default=None)
    province: str = Field(nullable=True, default=None)
    city: str = Field(nullable=True, default=None)
    barangay: str = Field(nullable=True, default=None)
    postal_code: str = Field(nullable=True, default=None)
    st_bd_hno: OtherInfo = Field(
            sa_column=Column(JSON, nullable=True, default=None))  # street, building, and house number
    user_id: str = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))


class Address(BaseAddress, table=True):
    __tablename__ = "address"
    id: str = Field(primary_key=True, nullable=False, default_factory=lambda: str(uuid4()))
    is_default: bool = Field(default=False)


class CreateAddress(BaseAddress):
    is_default: bool = Field(default=False)
    user_id: str = Field(default=None)
    
    @staticmethod
    def create_depends(fullname: str = Body(default=None),
                       region: str = Body(default=None),
                       province: str = Body(default=None),
                       city: str = Body(default=None),
                       barangay: str = Body(default=None),
                       postal_code: str = Body(default=None),
                       st_bd_hno: OtherInfo = Body(...)):
        return CreateAddress(fullname=fullname,
                             region=region,
                             province=province, city=city,
                             barangay=barangay,
                             postal_code=postal_code,
                             st_bd_hno=st_bd_hno)


class UpdateAddress(BaseModel):
    fullname: Optional[str] = Body(default=None)
    region: Optional[str] = Body(default=None)
    province: Optional[str] = Body(default=None)
    city: Optional[str] = Body(default=None)
    barangay: Optional[str] = Body(default=None)
    postal_code: Optional[str] = Body(default=None)
    st_bd_hno: OtherInfo = Body(...)
    
    @staticmethod
    def update_depends(fullname: Optional[str] = Body(default=None),
                       region: Optional[str] = Body(default=None),
                       province: Optional[str] = Body(default=None),
                       city: Optional[str] = Body(default=None),
                       barangay: Optional[str] = Body(default=None),
                       postal_code: Optional[str] = Body(default=None),
                       st_bd_hno: OtherInfo = Body(...)):
        return UpdateAddress(fullname=fullname,
                             region=region,
                             province=province,
                             city=city,
                             barangay=barangay,
                             postal_code=postal_code,
                             st_bd_hno=st_bd_hno)
