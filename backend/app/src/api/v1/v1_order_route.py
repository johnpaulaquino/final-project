from fastapi import APIRouter, Depends, status

from app.src.application.services.order_services import OrderServices
from app.src.core.dependencies import get_uow
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema.orders_schema import CreateOrder
from app.src.utils.successful_response import SuccessfulResponse

v1_order_router = APIRouter(tags=["Orders"], prefix="/v1")


@v1_order_router.post("/order")  # user_id is a dependency and for now, ganyan na lang muna
async def insert_order_item(item_order: CreateOrder, user_id: str, uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        order_services = OrderServices(uow)
        
        orders_response = await order_services.insert_order(new_order=item_order, user_id=user_id)
        
        # set the status response
        orders_response.status_code = status.HTTP_201_CREATED
        
        return SuccessfulResponse(orders_response)
    except Exception as e:
        raise e
