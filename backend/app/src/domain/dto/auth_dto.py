from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr


class UserDTO(BaseModel):
    id: str | None = None
    email: str | EmailStr = None
    is_active: bool = None
    is_deleted: bool = None
    signin_type: List[str] = None
    login_at: datetime = None
    created_at: datetime = None
    role: str = None
    updated_at: datetime = None
    deleted_at: datetime = None
    sign_up_steps: int = None


class TokenDTO(BaseModel):
    access_token: str
    refresh_token: str
    refresh_token_expiration: datetime


class SignUpModelDTO(BaseModel):
    """
    Will return this, if the request is successful in final step in services layer.
    """
    message: str
    action: str = None
    otp_code: str = None
    verification_token: str = None
    access_token: str = None
    refresh_token: str = None


class SessionTokenDTO(BaseModel):
    """
    Will use to return the object into services layer. For session Token only.
    """
    expires_at: datetime = None
    user_id: str = None
    token: str = None
    id: str = None
    is_revoke: bool = None
    created_at: datetime = None
    updated_at: datetime = None


class DecodedTokenDTO(BaseModel):
    user_id: str
    role: str
    jti: str
    exp: int
