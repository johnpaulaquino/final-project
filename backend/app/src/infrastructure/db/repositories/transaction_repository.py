from sqlalchemy.ext.asyncio import AsyncSession

from app.src.domain.dto.transactions_dto import TransactionDTO
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity.products.transactions_entity import Transactions
from app.src.schema.transaction_schema import CreateTransactionSchema


class TransactionRepository(UserInterface):
    
    def __init__(self, db: AsyncSession):
        self.__db = db
    
    async def insert_record(self, record: CreateTransactionSchema) -> TransactionDTO:
        try:
            transaction = Transactions(**record.model_dump())
            self.__db.add(transaction)
            await self.__db.flush()
            
            return TransactionDTO.model_validate(transaction, from_attributes=True)
        except Exception as e:
            raise e
    
    async def find_record(self, record_id: str):
        try:
            pass
        except Exception as e:
            raise e
    
    async def delete_record(self, record_id: str):
        try:
            pass
        except Exception as e:
            raise e
    
    async def soft_delete_record(self, record_id: str) -> None:
        try:
            pass
        except Exception as e:
            raise e
    
    async def update_record(self, record_id: str, data: dict | None = None):
        try:
            pass
        except Exception as e:
            raise e
