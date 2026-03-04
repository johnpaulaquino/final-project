from sqlalchemy import delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import TempUsers
from app.src.schema.auth_schema import TempUserRequest


class TempUserRepository(UserInterface[TempUserRequest]):
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def insert_record(self, record: TempUserRequest):
        try:
            temp_user = TempUsers(email=record.email)
            self.db.add(temp_user)
        except Exception as e:
            raise e
    
    async def find_record(self, email: str) -> TempUsers:
        """
        To find record via email.
        :param email: The email of user. This is unique
        :return: The data of user that found using email.
        """
        stmt = select(TempUsers).where(TempUsers.email == email)
        
        result = await self.db.execute(stmt)
        data = result.scalar()
        return data
    
    async def update_record(self, record_id: str, data: dict = None):
        """
        This function is to update the record of data.
        :param record_id:
        :param data:
        :return:
        """
        try:
            stmt = update(TempUsers).where(TempUsers.email == record_id).values(sign_up_steps=2)
            await self.db.execute(stmt)
        except Exception as e:
            raise e
    
    async def delete_record(self, record_id: str):
        """
        This function is to delete the record in database.
        :param record_id: is the unique in records.
        :return:Nothing
        """
        try:
            stmt = delete(TempUsers).where(TempUsers.email == record_id)
            await self.db.execute(stmt)
        except Exception as e:
            raise e
