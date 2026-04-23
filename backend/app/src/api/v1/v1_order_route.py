from fastapi import APIRouter, Depends, Query, status

from app.src.application.services.order_services import OrderServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_current_user, get_order_service
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.schema import PaginatedSchema
from app.src.schema.orders_schema import (BatchCreateOrderSchema, ConfirmOrderSchema, CreateOrderSchema,
                                          OrderStatusSchema, )
from app.src.utils.successful_response import SuccessfulResponse

# prefix endpoint
__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/order"

v1_order_router = APIRouter(tags=[EndpointTags.ORDERS], prefix=__base_endpoint)


@v1_order_router.post(
        "/",
        tags=[EndpointTags.CUSTOMER])
async def insert_order_item(item_order: CreateOrderSchema = Depends(CreateOrderSchema.depends),
                            current_user: DecodedTokenDTO = Depends(get_current_user),
                            order_services: OrderServices = Depends(get_order_service),
                            ):
    try:
        
        orders_response = await order_services.insert_order(new_order=item_order, current_user=current_user)
        # set the status response
        orders_response.status_code = status.HTTP_201_CREATED
        
        return SuccessfulResponse(orders_response)
    except Exception as e:
        raise e


@v1_order_router.post(
        "/batch",
        tags=[EndpointTags.CUSTOMER])
async def insert_order_item(item_orders: BatchCreateOrderSchema,
                            current_user: DecodedTokenDTO = Depends(get_current_user),
                            order_services: OrderServices = Depends(get_order_service), ):
    try:
        
        orders_response = await order_services.batch_insert_order(new_orders=item_orders, current_user=current_user)
        # set the status response
        orders_response.status_code = status.HTTP_201_CREATED
        
        return SuccessfulResponse(orders_response)
    except Exception as e:
        raise e


@v1_order_router.get("/", tags=[EndpointTags.CUSTOMER])
async def get_paginated_orders(paginated: PaginatedSchema = Depends(),
                               order_status=Query(default=OrderStatusSchema.Pending),
                               current_user: DecodedTokenDTO = Depends(get_current_user),
                               order_services: OrderServices = Depends(get_order_service),
                               ):
    try:
        order_response = await order_services.get_paginated_orders(paginated, order_status, current_user)
        order_response.status_code = status.HTTP_200_OK
        
        return SuccessfulResponse(order_response)
    except Exception as e:
        raise e


@v1_order_router.get("/admin", tags=[EndpointTags.CUSTOMER])
async def get_paginated_admin_orders(paginated: PaginatedSchema = Depends(),
                                     order_status=Query(default=OrderStatusSchema.Pending),
                                     current_user: DecodedTokenDTO = Depends(get_current_user),
                                     order_services: OrderServices = Depends(get_order_service),
                                     ):
    try:
        order_response = await order_services.get_admin_paginated_orders(paginated, order_status, current_user)
        order_response.status_code = status.HTTP_200_OK
        
        return SuccessfulResponse(order_response)
    except Exception as e:
        raise e


@v1_order_router.patch("/{order_id}/confirm", tags=[EndpointTags.ADMIN])
async def confirm_order(order_id: str,
                        data: ConfirmOrderSchema,
                        current_user: DecodedTokenDTO = Depends(get_current_user),
                        order_services: OrderServices = Depends(get_order_service),
                        ):
    try:
        
        order_result = await order_services.confirm_order(order_id, data, current_user)
        order_result.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(order_result)
        
        return response
    except Exception as e:
        raise e


@v1_order_router.patch("/{order_id}/shipped", tags=[EndpointTags.ADMIN])
async def update_order_to_shipped(order_id: str,
                                  data: ConfirmOrderSchema,
                                  current_user: DecodedTokenDTO = Depends(get_current_user),
                                  order_services
                                  : OrderServices = Depends(get_order_service)):
    
    try:
        order_result = await order_services.ship_order(order_id, data, current_user)
        order_result.status_code = status.HTTP_200_OK
        response = SuccessfulResponse(order_result)
        return response
    except Exception as e:
        raise e


@v1_order_router.patch("/{order_id}/cancel", tags=[EndpointTags.CUSTOMER])
async def cancel_order(order_id: str,
                       current_user: DecodedTokenDTO = Depends(get_current_user),
                       order_services: OrderServices = Depends(get_order_service)):
    try:
        order_response = await order_services.cancel_order(order_id, current_user)
        order_response.status_code = status.HTTP_200_OK
        
        return SuccessfulResponse(order_response)
    except Exception as e:
        print(e)
        raise e
