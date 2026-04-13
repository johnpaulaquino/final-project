from datetime import datetime
from enum import Enum
from typing import Optional

from fastapi import Body
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.src.core.constants import ConstantsData
from app.src.exceptions.domain_exceptions import DomainInvalidCredentialsError, DomainUnprocessableEntityError
from app.src.schema import EnvironmentStatus
from app.src.utils.utility import Utility


class LoginRequest(BaseModel):
    email: EmailStr | str
    password: str
    
    @field_validator("email")
    def validate_email(cls, value: str):
        if not value:
            raise DomainInvalidCredentialsError("Email is required.")
        if "@" not in value:
            raise DomainUnprocessableEntityError("Invalid email format.")
        return value.strip()
    
    @field_validator("password")
    def validate_password(cls, value: str):
        if not value:
            raise DomainInvalidCredentialsError("Password is required.")
        return value.strip()


class SessionTokenRequest(BaseModel):
    expires_at: datetime
    user_id: str
    token: str


class SignUpRequest(BaseModel):
    email: Optional[str] = None
    password: str = Body(...)
    firstname: str = Body(...)
    middle_name: Optional[str] = Body(None)
    lastname: str = Body(...)
    
    @staticmethod
    def sign_up_request_depends(password=Body(...),
                                firstname=Body(...),
                                middle_name: Optional[str] = Body(None),
                                lastname=Body(...)):
        return SignUpRequest(password=password, firstname=firstname, middle_name=middle_name, lastname=lastname)


@field_validator("email")
def validate_email(cls, value: str):
    if not value:
        raise DomainInvalidCredentialsError("Email is required")
    if "@" not in value:
        raise DomainInvalidCredentialsError("Invalid email format")
    return value


@field_validator("password")
def validate_password(cls, value: str):
    if not value:
        raise DomainInvalidCredentialsError("Password is required.")
    return value.strip()


@field_validator("firstname")
def validate_firstname(cls, value: str):
    if not value:
        raise DomainInvalidCredentialsError("Firstname is required.")
    validated_value = Utility.capitalize_first_letters(value)
    return validated_value


@field_validator("middle_name")
def validate_middlename(cls, value: str):
    if not value:
        return ""
    validated_value = Utility.capitalize_first_letters(value)
    return validated_value


@field_validator("lastname")
def validate_lastname(cls, value: str):
    if not value:
        raise DomainInvalidCredentialsError("Lastname is required.")
    validated_value = Utility.capitalize_first_letters(value)
    return validated_value


class TempUserRequest(BaseModel):
    sign_up_steps: Optional[int] = Field(default=1)
    email: EmailStr | str = Field(...)


IS_PRODUCTION = ConstantsData.ENVIRONMENT == EnvironmentStatus.Production


# Properly inherit from both str and Enum for Pydantic validation
# Use lowercase values as expected by FastAPI/Starlette
class SameSiteEnum(str, Enum):
    LAX = "lax"
    STRICT = "strict"
    NONE = "none"


class CookieResponseSchema(BaseModel):
    key: str
    value: str
    httponly: bool = True
    # Automatically False locally, True in production
    secure: bool = IS_PRODUCTION
    max_age: int = 24 * 60 * 60
    samesite: SameSiteEnum = SameSiteEnum.NONE if IS_PRODUCTION else SameSiteEnum.LAX
    path: str = "/"


class CookieResponseOnDelete(BaseModel):
    key: str
    httponly: bool = True
    # Automatically False locally, True in production
    secure: bool = IS_PRODUCTION
    samesite: SameSiteEnum = SameSiteEnum.NONE if IS_PRODUCTION else SameSiteEnum.LAX
    path: str = "/"


class OTPCodeSchema(BaseModel):
    token: str
    otp_code: str
