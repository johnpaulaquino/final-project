from typing import Any, AsyncGenerator

from fastapi import Request

from app.src.infrastructure.db import LocalSession
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure


async def get_uow() -> AsyncGenerator[SQLUnitOfWork, Any]:
    async with LocalSession() as session:
        async with SQLUnitOfWork(session) as uow:
            yield uow


async def get_redis_services(request: Request) -> RedisInfrastructure:
    """
    To get the redis instance from the app state, which is created in the life span of the app.
    :param request: a user request, which is used to access the app state.
    :return: the redis instance from the app state.
    """
    return request.app.state.redis_services
