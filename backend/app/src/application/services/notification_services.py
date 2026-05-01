from app.src.application.services import retry_on_transient
from app.src.application.services.shared_services import SharedServices
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.exceptions.domain_exceptions import DomainNotFoundError
from app.src.infrastructure.db.entity.notifications_entity import CreateNotification
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema, RoleSchema, SuccessfulResponseSchema
from app.src.utils.utility import Utility


class NotificationServices(SharedServices):
    def __init__(self, __uow: SQLUnitOfWork):
        self.__uow = __uow
        super().__init__(__uow)
    
    @retry_on_transient
    async def create_notification(self, notification: CreateNotification, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # then send a data
            notification.user_id = current_user.user_id
            
            # create notification
            new_data = await self.__uow.notifications.insert_record(notification)
            # send notification trough websocket
            return SuccessfulResponseSchema(data=new_data,
                                            message="Successfully created notification.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def get_paginated_notifications(self, paginated: PaginatedSchema, current_user: DecodedTokenDTO):
        try:
            await self._check_user_if_exists(current_user.user_id)
            
            if current_user.role == RoleSchema.CUSTOMER:
                offset = Utility.get_offset(paginated.skip, paginated.limit)
                data = await self.__uow.notifications.get_paginated_data(offset, paginated.limit, current_user.user_id)
                if not data:
                    return SuccessfulResponseSchema(message="Successfully, but no data to retrieve.")
                
                total_notification = await self.__uow.notifications.get_total_notifications(current_user.user_id)
                paginated_data = Utility.get_paginated_data(offset=offset,
                                                            skip=paginated.skip,
                                                            limit=paginated.limit,
                                                            total_records=total_notification)
                
                return SuccessfulResponseSchema(message="Successfully retrieved data.", paginated=paginated_data,
                                                data=data)
            
            offset = Utility.get_offset(paginated.skip, paginated.limit)
            data = await self.__uow.notifications.get_all_paginated_data(offset, paginated.limit)
            if not data:
                return SuccessfulResponseSchema(message="Successfully, but no data to retrieve.")
            
            total_notification = await self.__uow.notifications.get_all_total_notifications()
            paginated_data = Utility.get_paginated_data(offset=offset,
                                                        skip=paginated.skip,
                                                        limit=paginated.limit,
                                                        total_records=total_notification)
            
            return SuccessfulResponseSchema(message="Successfully retrieved data.", paginated=paginated_data, data=data)
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def mark_all_as_read_user_notification(self, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # data to update
            to_update = {"is_user_read": True}
            await self.__uow.notifications.mark_all_as_read_notifications(current_user.user_id, to_update)
            
            return SuccessfulResponseSchema(message="Successfully read all notifications.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def clear_all_user_notifications(self, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # data to update
            to_update = {"is_clear": True}
            await self.__uow.notifications.clear_user_notifications(current_user.user_id, to_update)
            
            return SuccessfulResponseSchema(message="Successfully clear all notifications.")
        except Exception as e:
            raise e
    
    @retry_on_transient
    async def send_notification_to_all_users(self, notification: CreateNotification, current_user: DecodedTokenDTO):
        try:
            # check if users exists
            await self._check_user_if_exists(current_user.user_id)
            # check user role
            self.validate_users_role(current_user.role)
            
            # get user_id of all users
            data = await self.__uow.users.get_user_ids()
            
            if not data:
                return SuccessfulResponseSchema(message="No user to notify.")
            
            # create notification
            notification.user_id = current_user.user_id
            # set all user id from receiver
            
            notification.receivers = data
            await self.__uow.notifications.insert_record(notification)
            # return successful response
            # send data for the api layer, but it will delete it on the api layer
            return SuccessfulResponseSchema(message="Successfully notify users.", data=data)
        except Exception as e:
            
            raise e
    
    async def delete_notification(self, notification_id: str, current_user: DecodedTokenDTO):
        try:
            # check if user exists
            await self._check_user_if_exists(current_user.user_id)
            # check role
            self.validate_users_role(current_user.role)
            
            # check if notification exists
            data = await self.__uow.notifications.find_record(notification_id)
            if not data:
                raise DomainNotFoundError("Can't delete notification that is not exists.")
            
            # otherwise delete notification
            await self.__uow.notifications.delete_record(notification_id)
            return SuccessfulResponseSchema(message="Successfully deleted notification.")
        except Exception as e:
            raise e
