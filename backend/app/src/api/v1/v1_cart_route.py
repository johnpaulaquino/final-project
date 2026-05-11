from fastapi import APIRouter, Depends
from starlette import status
from starlette.requests import Request

from app.src.application.services.carts_services import CartsServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_cart_service, get_current_user
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.db.entity.products.carts_entity import CreateCart
from app.src.schema import PaginatedSchema
from app.src.utils.successful_response import SuccessfulResponse

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/cart"

v1_cart_router = APIRouter(tags=[EndpointTags.CUSTOMER], prefix=__base_endpoint)


@v1_cart_router.post("")
async def insert_cart(cart_data: CreateCart = Depends(CreateCart.depends),
                      current_user: DecodedTokenDTO = Depends(get_current_user),
                      cart_services: CartsServices = Depends(get_cart_service),
                      ):
    try:
        
        cart_response = await cart_services.insert_cart(cart_data, current_user)
        cart_response.status_code = status.HTTP_201_CREATED
        
        return SuccessfulResponse(cart_response)
    except Exception as e:
        raise e



@v1_cart_router.get("")
async def paginated_user_cart(paginated: PaginatedSchema = Depends(),

                              current_user: DecodedTokenDTO = Depends(get_current_user),
                              cart_services: CartsServices = Depends(get_cart_service)):
    try:

        cart_response = await cart_services.get_paginated_user_cart(paginated, current_user)
        cart_response.status_code = status.HTTP_200_OK
        
        return SuccessfulResponse(cart_response)
    except Exception as e:
        raise e


@v1_cart_router.delete("/{cart_id}")
async def delete_user_cart(cart_id: str,
                           current_user: DecodedTokenDTO = Depends(get_current_user),
                           cart_services: CartsServices = Depends(get_cart_service)):
    try:
        cart_response = await cart_services.delete_user_cart(cart_id, current_user)
        cart_response.status_code = status.HTTP_200_OK
        return SuccessfulResponse(cart_response)
    except Exception as e:

        raise e


@v1_cart_router.get("/{cart_id}")
async def get_user_cart(cart_id: str,
                        current_user: DecodedTokenDTO = Depends(get_current_user),
                        cart_services: CartsServices = Depends(get_cart_service)):
    try:
        cart_response = await cart_services.get_product_cart(cart_id, current_user)
        cart_response.status_code = status.HTTP_200_OK

        return SuccessfulResponse(cart_response)
    except Exception as e:
        raise e
