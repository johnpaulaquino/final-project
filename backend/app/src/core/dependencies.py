from typing import Any, AsyncGenerator

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer

from app.src.core.constants import ConstantsData
from app.src.core.security import AppSecurity
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.db import LocalSession
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure

oauth2_scheme = OAuth2PasswordBearer(scheme_name='Authentication',
                                     tokenUrl=f"{ConstantsData.API_V1_ENDPOINT}/auth/login")


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


# to get the token

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        encoded_data = AppSecurity.decode_jwt_token(token)
        
        # return the decoded token
        return DecodedTokenDTO(**encoded_data)
    
    except Exception as e:
        raise e
