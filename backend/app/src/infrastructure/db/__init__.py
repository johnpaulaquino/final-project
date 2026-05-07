from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.src.core.constants import ConstantsData
from app.src.schema import EnvironmentStatus

# this is for database
POSTGRES_DB_URL = f"postgresql+asyncpg://{ConstantsData.DB_USER}:{ConstantsData.DB_PASSWORD}@{ConstantsData.DB_HOST}:{ConstantsData.DB_PORT}/{ConstantsData.DB_NAME}"
# This line sets up loggers basically.
if ConstantsData.ENVIRONMENT == EnvironmentStatus.Production:
    POSTGRES_DB_URL=f"postgresql+asyncpg://{ConstantsData.DB_PROD_USER}:{ConstantsData.DB_PROD_PASSWORD}@{ConstantsData.DB_PROD_HOST}:{ConstantsData.DB_PROD_PORT}/{ConstantsData.DB_PROD_NAME}"
engine = create_async_engine(url=POSTGRES_DB_URL,
                             connect_args={
                                 "statement_cache_size": 0,
                                 "prepared_statement_cache_size": 0,
                             }
                             )

LocalSession = async_sessionmaker(bind=engine,
                                  autoflush=False,
                                  expire_on_commit=False,
                                  class_=AsyncSession)
