from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import Redis

from app.src.core.constants import ConstantsData
from app.src.exceptions import BaseAppExceptions
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure
from app.src.schema import EnvironmentStatus


@asynccontextmanager
async def app_lifespan(fastapi: FastAPI):
    print(f"Server is starting at {ConstantsData.SERVER_PORT}")
    # start the redis server

    # state is just like a variable in an app. It is best for databases connection, like Redis, Mongo DB.
    # I can access the redis variable in the entire app
    redis_host = ConstantsData.REDIS_DB_URL if EnvironmentStatus.Dev else ConstantsData.REDIS_DB_URL_PROD

    fastapi.state.redis = Redis(host=ConstantsData.REDIS_DB_URL,port=ConstantsData.REDIS_SERVER_PORT,decode_responses=True)

    if EnvironmentStatus.Production == ConstantsData.REDIS_DB_URL_PROD:
        fastapi.state.redis = Redis.from_url(
        redis_host,
        decode_responses=True)
    try:
        fastapi.state.redis_services = RedisInfrastructure(fastapi.state.redis)
    except Exception as e:
        raise BaseAppExceptions

    yield

    print(f"Server is shutting down...")
    await fastapi.state.redis.close()
