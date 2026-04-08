from typing import Any

from pydantic import BaseModel, Field

"""
This schema is for global access and has a single purpose.
"""


class PaginatedOutput(BaseModel):
    start_page: int
    end_page: int
    total_records: int
    has_next: bool


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


class EnvironmentStatus(str):
    Dev = 'dev'
    Test = 'test'
    Production = 'production'


class SuccessfulResponseSchema(BaseModel):
    message: str
    headers: dict = None
    status_code: int = None
    status_message: str = "ok"
    data: Any = None
    access_token: str = None
    refresh_token: str = None
    csrf_token: str | None = None
    action: str = None
    paginated: PaginatedOutput | None = None
    otp_code: str | None = None
