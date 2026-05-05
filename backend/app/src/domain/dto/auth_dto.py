from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class UserDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str | None = None
    email: str | None = None
    is_active: bool | None = None
    is_deleted: bool | None = None
    signin_type: List[str] | None = None
    login_at: datetime | None = None
    created_at: datetime | None = None
    role: str | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    sign_up_steps: int | None = None


class UserWithPasswordDTO(UserDTO):
    model_config = ConfigDict(from_attributes=True)
    password: str = None


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
    sign_up_steps: int = None
    csrf_token: str = None


class OnUpdateSecuredCredentials(SignUpModelDTO):
    email : str  | None = None

class SessionTokenDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    """
    Will use to return the object into services layer. For session Token only.
    """
    expires_at: datetime | None = None
    user_id: str | None = None
    token: str | None = None
    id: str | None = None
    is_revoke: bool | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DecodedTokenDTO(BaseModel):
    user_id: str
    role: str
    jti: str
    exp: int
