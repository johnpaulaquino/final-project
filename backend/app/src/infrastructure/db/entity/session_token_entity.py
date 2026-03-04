import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


class SessionToken(SQLModel, table=True):
    __tablename__ = "session_token"
    id: str = Field(primary_key=True, nullable=False, default_factory=lambda: str(uuid.uuid4()))
    expires_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    user_id: str = Field(default=None, nullable=True, foreign_key="users.id", ondelete="CASCADE")
    token: str = Field(nullable=False, index=True)
    is_revoke: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
