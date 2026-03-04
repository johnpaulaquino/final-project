# from sqlalchemy import select
#
# from app.infrastracture.db.entity import SessionToken
# from app.src.database import create_session, safe_commit
#
#
from sqlalchemy import delete, update
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.src.domain.dto.auth_dto import SessionTokenDTO
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import SessionToken
from app.src.schema.auth_schema import SessionTokenRequest


class SessionTokenRepository(UserInterface[SessionTokenRequest]):
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def insert_record(self, record: SessionTokenRequest):
        session_token = SessionToken(**record.model_dump())
        self.db.add(session_token)
    
    async def find_record(self, token: str) -> SessionTokenDTO | None:
        stmt = select(SessionToken).where(SessionToken.token == token)
        result = await self.db.execute(stmt)
        data: SessionToken = result.scalar()
        return SessionTokenDTO(**data.model_dump())
    
    async def update_record(self, record_id: str, data: dict = None):
        stmt = update(SessionToken).values(**data).where(SessionToken.token == record_id)
        await self.db.execute(stmt)
    
    async def delete_record(self, record_id: str):
        stmt = delete(SessionToken).where(SessionToken.token == record_id)
        await self.db.execute(stmt)
    
    async def update_is_revoke(self, record_id: str):
        stmt = update(SessionToken).values(is_revoke=False).where(SessionToken.token == record_id)
        await self.db.execute(stmt)
