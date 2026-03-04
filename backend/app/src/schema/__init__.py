from pydantic import BaseModel, Field

"""
This schema is for global access and has a single purpose.
"""


class SuccessfulResponseSchema(BaseModel):
    message: str
    headers: dict = None
    status_code: int = None
    status_message: str = "ok"
    data: dict = None
    access_token: str = None
    refresh_token: str = None
    action: str = None
    paginated: dict = None


class RoleSchema:
    CUSTOMER: str = "Customer"
    ADMIN: str = 'Admin'


class SignInTypeSchema:
    PASSWORD: str = "password"
    GOOGLE: str = "google"
    FACEBOOK: str = "facebook"  # incase ipalagay na feature
    APPLE: str = "apple"  # incase ipalagayipalagay na feature


class PaginatedSchema(BaseModel):
    skip: int = Field(ge=1, default=1)
    limit: int = Field(ge=10, default=10)
