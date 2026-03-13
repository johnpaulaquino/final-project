from datetime import date, datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict

from app.src.schema.products_schema import Images


class UsersDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str | None = None
    email: str | None = None
    password: str | None = None
    is_active: bool | None = None
    is_deleted: bool | None = None
    signin_type: list | None = None
    login_at: datetime | None = None
    created_at: datetime | None = None
    role: str | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    sign_up_steps: int | None = None


class UserPersonalInfoDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    firstname: str | None = None
    lastname: str | None = None
    middle_name: str | None = None
    phone_number: Optional[str] | None = None
    birth_date: date | None = None
    profile_image: Optional[Images] | None = None
    is_phone_verified: bool | None = None
    age: int | None = None


class UserAddressDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    region: str | None = None
    province: str | None = None
    city: str | None = None
    barangay: str | None = None
    postal_code: str | None = None
    st_bd_hno: Optional[Dict[str, Any]] | None = None


class UserFullInformationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    Users: UsersDTO | None = None
    PersonalInfo: UserPersonalInfoDTO | None = None
    Address: UserAddressDTO | None = None
