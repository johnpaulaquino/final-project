from fastapi import APIRouter, Depends, status

from app.src.application.services.order_services import OrderServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_current_user, get_uow
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema.orders_schema import CreateOrder
from app.src.utils.successful_response import SuccessfulResponse

# prefix endpoint
__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/order"

v1_order_router = APIRouter(tags=[EndpointTags.ORDERS], prefix=__base_endpoint)


@v1_order_router.post(
        "/order",
        tags=[EndpointTags.CUSTOMER])
async def insert_order_item(item_order: CreateOrder = Depends(CreateOrder.depends),
                            current_user: DecodedTokenDTO = Depends(get_current_user),
                            uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        order_services = OrderServices(uow)
        
        orders_response = await order_services.insert_order(new_order=item_order, user_id=current_user.user_id)
        
        # set the status response
        orders_response.status_code = status.HTTP_201_CREATED
        
        return SuccessfulResponse(orders_response)
    except Exception as e:
        raise e


@v1_order_router.get("/sample")
async def sample(curr_user=Depends(get_current_user)):
    pass
