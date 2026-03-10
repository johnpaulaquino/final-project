from fastapi import APIRouter, Depends, Query, status

from app.src.application.services.order_services import OrderServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_current_user, get_order_service
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.schema import PaginatedSchema
from app.src.schema.orders_schema import ConfirmOrderSchema, CreateOrder, OrderStatus, ShippedOrderSchema
from app.src.utils.successful_response import SuccessfulResponse

# prefix endpoint
__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/order"

v1_order_router = APIRouter(tags=[EndpointTags.ORDERS], prefix=__base_endpoint)


@v1_order_router.post(
        "/",
        tags=[EndpointTags.CUSTOMER])
async def insert_order_item(item_order: CreateOrder = Depends(CreateOrder.depends),
                            current_user: DecodedTokenDTO = Depends(get_current_user),
                            order_services: OrderServices = Depends(get_order_service),
                            ):
    try:
        
        orders_response = await order_services.insert_order(new_order=item_order, user_id=current_user.user_id)
        
        # set the status response
        orders_response.status_code = status.HTTP_201_CREATED
      
        
        return SuccessfulResponse(orders_response)
    except Exception as e:
        raise e


@v1_order_router.post("/confirm", tags=[EndpointTags.ADMIN])
async def confirm_order(data: ConfirmOrderSchema,
                        current_user: DecodedTokenDTO = Depends(get_current_user),
                        order_services: OrderServices = Depends(get_order_service),
                        ):
    try:
        
        order_result = await order_services.confirm_order(data)
        order_result.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(order_result)
        
        return response
    except Exception as e:
        raise e


@v1_order_router.post("/shipped")
async def update_order_to_shipped(data: ShippedOrderSchema,
                                  current_user: DecodedTokenDTO = Depends(get_current_user),
                                  order_services: OrderServices = Depends(get_order_service)):
    try:
        order_result = await order_services.ship_order(data)
        order_result.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(order_result)
        return response
    except Exception as e:
        raise e


@v1_order_router.get("/")
async def get_paginated_orders(paginated: PaginatedSchema = Depends(),
                               order_status=Query(default=OrderStatus.Pending),
                               current_user: DecodedTokenDTO = Depends(get_current_user),
                               order_services: OrderServices = Depends(get_order_service),
                               ):
    try:
        order_response = await order_services.get_paginated_orders(paginated, order_status, current_user)
        order_response.status_code = status.HTTP_200_OK
        
        return SuccessfulResponse(order_response)
    except Exception as e:
        raise e
