from fastapi import APIRouter, Depends, Query, WebSocket
from starlette import status
from starlette.websockets import WebSocketDisconnect

from app.src.application.services.notification_services import NotificationServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_current_user, get_current_user_websocket, get_notification_service
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.db.entity.notifications_entity import CreateNotification
from app.src.infrastructure.websocket_infrastructure import ConnectionManager
from app.src.schema import PaginatedSchema
from app.src.utils.successful_response import SuccessfulResponse

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/notifications"

v1_notification_router = APIRouter(tags=[EndpointTags.NOTIFICATIONS], prefix=__base_endpoint)


@v1_notification_router.websocket("/")
async def realtime_notification(websocket: WebSocket,
                                current_user: DecodedTokenDTO = Depends(get_current_user_websocket),
                                ):
    try:
        
        # Register the connection with our Manager
        await ConnectionManager.connect_socket(current_user.user_id, websocket)
        try:
            # Keep the connection open indefinitely
            while True:
                # We wait for messages from the client.
                # Even if the client never sends anything, this keeps the loop alive.
                data = await websocket.receive_text()
                print(data)
        except WebSocketDisconnect:
            # Handle clean disconnects (User closed the browser tab)
            await ConnectionManager.disconnect(current_user.user_id)
        
        except Exception as e:
            # Handle dirty disconnects (Internet dropped, token expired, etc.)
            await ConnectionManager.disconnect(current_user.user_id)
    except Exception as e:
        raise e


@v1_notification_router.post("/send-to-all")
async def send_notification_to_all_users(notification: CreateNotification = Depends(CreateNotification.create_depends),
                                         current_user: DecodedTokenDTO = Depends(get_current_user),
                                         notification_services: NotificationServices = Depends(
                                                 get_notification_service)):
    try:
        notification_services_response = await notification_services.send_notification_to_all_users(notification,
                                                                                                    current_user)
        
        notification_services_response.status_code = status.HTTP_201_CREATED
        user_ids = notification_services_response.data
        
        # then set the data into None
        notification_services_response.data = None
        
        # send data from open websockets
        await ConnectionManager.broadcast_to_all_specified_users(
                user_ids=user_ids,
                message=notification.model_dump(exclude_unset=True, exclude_none=True))
        
        response = SuccessfulResponse(notification_services_response)
        return response
    
    except Exception as e:
        raise e


@v1_notification_router.post('/')
async def create_notification(notification: CreateNotification = Depends(CreateNotification.create_depends),
                              current_user: DecodedTokenDTO = Depends(get_current_user),
                              notification_services: NotificationServices = Depends(get_notification_service), ):
    try:
        notification_services_response = await notification_services.create_notification(notification, current_user)
        notification_services_response.status_code = status.HTTP_201_CREATED
        
        response = SuccessfulResponse(notification_services_response)
        
        await ConnectionManager.send_personal_messages(notification_services_response.data, current_user.user_id)
        
        return response
    except Exception as e:
        raise e


@v1_notification_router.get("/")
async def get_paginated_notifications(paginated: PaginatedSchema = Query(),
                                      current_user: DecodedTokenDTO = Depends(get_current_user),
                                      notification_services: NotificationServices = Depends(
                                              get_notification_service), ):
    try:
        notification_services_response = await notification_services.get_paginated_notifications(paginated,
                                                                                                 current_user)
        notification_services_response.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(notification_services_response)
        return response
    except Exception as e:
        raise e
