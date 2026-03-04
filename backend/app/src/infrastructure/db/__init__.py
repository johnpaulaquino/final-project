from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.src.core.constants import ConstantsData

# this is for database
POSTGRES_DB_URL = f"postgresql+asyncpg://{ConstantsData.DB_USER}:{ConstantsData.DB_PASSWORD}@{ConstantsData.DB_HOST}:{ConstantsData.DB_PORT}/{ConstantsData.DB_NAME}"

engine = create_async_engine(url=POSTGRES_DB_URL)

LocalSession = async_sessionmaker(bind=engine,
                                  autoflush=False,
                                  expire_on_commit=False,
                                  class_=AsyncSession)
