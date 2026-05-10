from typing import Annotated, Any, AsyncGenerator

from fastapi import Cookie, Depends, Request, WebSocketException
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError 

from starlette import status

from app.src.application.services.auth_services import AuthServices
from app.src.application.services.carts_services import CartsServices
from app.src.application.services.notification_services import NotificationServices
from app.src.application.services.order_services import OrderServices
from app.src.application.services.products_services import ProductsServices
from app.src.application.services.user_services import UserServices
from app.src.core.constants import ConstantsData, ConstantsKey
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


# for user injection
__cloudinary_users = __get_cloudinary_factory(sub_folder_name="")

# for products injection
__cloudinary_products = __get_cloudinary_factory(sub_folder_name="products")
__cloudinary_products_carousel = __get_cloudinary_factory(sub_folder_name="carousel")


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

async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    try:

        # check first the token in headers if there is.
        if token:

            encoded_data = AppSecurity.decode_jwt_token(token)
            # return the decoded token
            return DecodedTokenDTO(**encoded_data)
        
        # otherwise go to the cookie and check if there's a cookie.
        cookie_access_token = request.cookies.get(ConstantsKey.COOKIE_ACCESS_TOKEN)
        encoded_data = AppSecurity.decode_jwt_token(cookie_access_token)

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
        cloudinary_infrastructure: CloudinaryInfrastructure = Depends(__cloudinary_users),
        
        ) -> UserServices:
    return UserServices(uow, cloudinary_infrastructure=cloudinary_infrastructure)


def get_products_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        cloudinary_infrastructure: CloudinaryInfrastructure = Depends(__cloudinary_products),
        ) -> ProductsServices:
    return ProductsServices(uow,
                            cloudinary_infrastructure=cloudinary_infrastructure)


# it is part of the product
def get_products_carousel_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        cloudinary_infrastructure: CloudinaryInfrastructure = Depends(__cloudinary_products_carousel),
        ) -> ProductsServices:
    return ProductsServices(uow,
                            cloudinary_infrastructure=cloudinary_infrastructure)


def get_cart_service(
        uow: SQLUnitOfWork = Depends(get_uow),
        ) -> CartsServices:
    return CartsServices(uow)


def get_notification_service(uow: SQLUnitOfWork = Depends(get_uow)) -> NotificationServices:
    return NotificationServices(uow)


def get_current_user_websocket(access_token: Annotated[str | None, Cookie()] = None,
                               ) -> DecodedTokenDTO:
    """
    Validates the user via HttpOnly cookie before allowing a WebSocket connection.
    Throws a 1008 Policy Violation if auth fails, triggering the frontend to refresh.
    """
    
    # No cookie found? Reject immediately.
    if not access_token:
        raise WebSocketException(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Invalid token."
                )
    
    try:
        # Decode the token using your secret key
        payload = AppSecurity.decode_jwt_token(access_token)
        
        if not payload.get("user_id"):
            raise WebSocketException(
                    code=status.WS_1008_POLICY_VIOLATION,
                    reason="Invalid token."
                    )
        
        # Success! Return the user_id to the router
        return DecodedTokenDTO(**payload)
    
    except ExpiredSignatureError as e:
        raise WebSocketException(
                code=status.WS_1008_POLICY_VIOLATION,
                reason=str(e)
                )
    
    except Exception as e:
        # Catch-all for tampered or invalid tokens
        raise e
