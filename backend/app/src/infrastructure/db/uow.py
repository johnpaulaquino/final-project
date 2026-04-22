from sqlalchemy.ext.asyncio import AsyncSession

from app.src.infrastructure.db.repositories.carts_repoisitory import CartsRepository
from app.src.infrastructure.db.repositories.notification_respository import NotificationRepository
from app.src.infrastructure.db.repositories.orders_repository import OrdersRepository
from app.src.infrastructure.db.repositories.products_repository import ProductsRepository
from app.src.infrastructure.db.repositories.session_token_repository import SessionTokenRepository
from app.src.infrastructure.db.repositories.temp_user_repository import TempUserRepository
from app.src.infrastructure.db.repositories.transaction_repository import TransactionRepository
from app.src.infrastructure.db.repositories.user_repository import UserRepository


class SQLUnitOfWork:
    def __init__(self, _db: AsyncSession):
        self._db = _db
        self.users = UserRepository(self._db)
        self.temp_users = TempUserRepository(self._db)
        self.token_session = SessionTokenRepository(self._db)
        self.products = ProductsRepository(self._db)
        self.orders = OrdersRepository(self._db)
        self.transactions = TransactionRepository(self._db)
        self.carts = CartsRepository(self._db)
        self.notifications = NotificationRepository(self._db)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_val:
            await self._db.rollback()
        else:
            await self._db.commit()
        await self._db.close()
