from fastapi import APIRouter

from app.src.core.constants import ConstantsData, EndpointTags

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/notifications"

v1_notification_router = APIRouter(tags=[EndpointTags.CUSTOMER], prefix=__base_endpoint)


@v1_notification_router.websocket("")
async def realtime_notification(user_id: str):
    pass
