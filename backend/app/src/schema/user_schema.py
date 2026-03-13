from datetime import date
from typing import Any, Dict, Optional

from fastapi import Body
from pydantic import BaseModel


class ProfileImage(BaseModel):
    image_url: Optional[str] = None
    public_key: Optional[str] = None


class UpdateUserSchema(BaseModel):
    firstname: Optional[str] | None = Body(default=None)
    lastname: Optional[str] | None = Body(default=None)
    middle_name: Optional[str] | None = Body(default=None)
    phone_number: Optional[str] | None = Body(default=None)
    birth_date: Optional[date] | None = Body(default=None)
    profile_image: Optional[ProfileImage] | None = Body(default=None)
    
    @staticmethod
    def depends(firstname: Optional[str] | None = Body(default=None),
                lastname: Optional[str] | None = Body(default=None),
                middle_name: Optional[str] | None = Body(default=None),
                phone_number: Optional[str] | None = Body(default=None),
                birth_date: Optional[date] | None = Body(default=None)):
        return UpdateUserSchema(firstname=firstname,
                                lastname=lastname,
                                birth_date=birth_date,
                                middle_name=middle_name,
                                phone_number=phone_number)


class SubAddress(BaseModel):
    subdivision: str | None = None
    building_no: str | None = None
    house_non: str | None = None


class UpdateUserAddressSchema(BaseModel):
    region: str | None = None
    province: str | None = None
    city: str | None = None
    barangay: str | None = None
    postal_code: str | None = None
    st_bd_hno: Optional[SubAddress] | None = None
