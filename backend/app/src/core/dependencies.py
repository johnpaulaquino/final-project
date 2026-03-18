from typing import Any, AsyncGenerator

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer

from app.src.application.services.auth_services import AuthServices
from app.src.application.services.carts_services import CartsServices
from app.src.application.services.order_services import OrderServices
from app.src.application.services.products_services import ProductsServices
from app.src.application.services.user_services import UserServices
from app.src.core.constants import ConstantsData
from app.src.core.security import AppSecurity
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db import LocalSession
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.infrastructure.email_infrastructure import EmailInfrastructure
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure

oauth2_scheme = OAuth2PasswordBearer(scheme_name='Authentication',
                                     tokenUrl=f"{ConstantsData.API_V1_ENDPOINT}/auth/login")


# email infrastructure factory

def __get_cloudinary_factory(sub_folder_name: str):
    
    def dependency():
        return CloudinaryInfrastructure(sub_folder_name=sub_folder_name)
    
    return dependency


# for products injection
__cloudinary_products = __get_cloudinary_factory(sub_folder_name="products")


# email_infrastructure
def get_email_infrastructure() -> EmailInfrastructure:
    return EmailInfrastructure()


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


def get_order_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        ) -> OrderServices:
    return OrderServices(uow)


def get_auth_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        ) -> AuthServices:
    return AuthServices(uow)


def get_user_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        cloudinary_infrastructure: CloudinaryInfrastructure = Depends(__cloudinary_products),
        
        ) -> UserServices:
    return UserServices(uow, cloudinary_infrastructure=cloudinary_infrastructure)


def get_products_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        cloudinary_infrastructure: CloudinaryInfrastructure = Depends(__cloudinary_products),
        ) -> ProductsServices:
    return ProductsServices(uow,
                            cloudinary_infrastructure=cloudinary_infrastructure)


def get_cart_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        ) -> CartsServices:
    return CartsServices(uow)
