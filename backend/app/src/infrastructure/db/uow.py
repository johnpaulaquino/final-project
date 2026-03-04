from sqlalchemy.ext.asyncio import AsyncSession

from app.src.infrastructure.db.repositories.orders_repository import OrdersRepository
from app.src.infrastructure.db.repositories.products_repository import ProductsRepository
from app.src.infrastructure.db.repositories.session_token_repository import SessionTokenRepository
from app.src.infrastructure.db.repositories.temp_user_repository import TempUserRepository
from app.src.infrastructure.db.repositories.user_repository import UserRepository


class SQLUnitOfWork:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(self.db)
        self.temp_users = TempUserRepository(self.db)
        self.token_session = SessionTokenRepository(self.db)
        self.products = ProductsRepository(self.db)
        self.orders = OrdersRepository(self.db)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_val:
            await self.db.rollback()
        
        
        else:
            await self.db.commit()
        await self.db.close()
