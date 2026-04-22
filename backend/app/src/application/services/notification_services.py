from app.src.application.services.shared_services import SharedServices
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.db.entity.notifications_entity import CreateNotification
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema, SuccessfulResponseSchema
from app.src.utils.utility import Utility


class NotificationServices(SharedServices):
    def __init__(self, __uow: SQLUnitOfWork):
        self.__uof = __uow
        super().__init__(__uow)
    
    async def create_notification(self, notification: CreateNotification, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            data = await self.check_if_user_exists(current_user.user_id)
            # then send a data
            notification.user_id = current_user.user_id
            
            # create notification
            new_data = await self.__uof.notifications.insert_record(notification)
            # send notification trough websocket
            return SuccessfulResponseSchema(data=new_data,
                                            message="Successfully created notification.")
        except Exception as e:
            raise e
    
    async def get_paginated_notifications(self, paginated: PaginatedSchema, current_user: DecodedTokenDTO):
        try:
            await self.check_if_user_exists(current_user.user_id)
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            data = await self.__uof.notifications.get_paginated_data(offset, paginated.limit, current_user.user_id)
            if not data:
                return SuccessfulResponseSchema(message="Successfully, but no data to retrieve.")
            
            total_notification = await self.__uof.notifications.get_total_notifications(current_user.user_id)
            paginated_data = Utility.get_paginated_data(offset=offset,
                                                        skip=paginated.skip,
                                                        limit=paginated.limit,
                                                        total_records=total_notification)
            
            return SuccessfulResponseSchema(message="Successfully retrieved data.", paginated=paginated_data, data=data)
        except Exception as e:
            raise e
    
    async def mark_all_as_read_user_notification(self, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # data to update
            to_update = {"is_user_read": True}
            await self.__uof.notifications.mark_all_as_read_notifications(current_user.user_id, to_update)
            
            return SuccessfulResponseSchema(message="Successfully read all notifications.")
        except Exception as e:
            raise e
    
    async def clear_all_user_notifications(self, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # data to update
            to_update = {"is_clear": True}
            await self.__uof.notifications.clear_user_notifications(current_user.user_id, to_update)
            
            return SuccessfulResponseSchema(message="Successfully clear all notifications.")
        except Exception as e:
            raise e
