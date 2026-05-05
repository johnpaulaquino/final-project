from typing import Optional

from fastapi import APIRouter, Body, Cookie, Depends, File, Query, UploadFile
from starlette import status

from app.src.api.api_utility import delete_auth_cookie, get_filenames_and_image_bytes
from app.src.application.services.user_services import UserServices
from app.src.core.constants import ConstantsData, ConstantsKeyData, EndpointTags
from app.src.core.dependencies import get_current_user, get_redis_services, get_user_service
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.infrastructure.db.entity.users.address_entity import CreateAddress, UpdateAddress
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure
from app.src.schema import PaginatedSchema, RoleSchema
from app.src.schema.user_schema import ChangePasswordSchema, UpdateUserSchema
from app.src.utils.successful_response import SuccessfulResponse

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/me"

v1_user_router = APIRouter(tags=[EndpointTags.USERS], prefix=__base_endpoint)


@v1_user_router.get("/")
async def get_information(current_user: DecodedTokenDTO = Depends(get_current_user),
                          user_service: UserServices = Depends(get_user_service),
                          ):
    
    try:
        user_response = await user_service.get_information(current_user)
        user_response.status_code = status.HTTP_200_OK
        return SuccessfulResponse(user_response)
    except Exception as e:
        raise e


@v1_user_router.post('/otp/sms')
async def send_sms_otp(
        contact_number: str = Body(...),
        current_user: DecodedTokenDTO = Depends(get_current_user),
        redis_infrastructure: RedisInfrastructure = Depends(get_redis_services),
        user_service: UserServices = Depends(get_user_service), ):
    
    try:
        old_otp = await redis_infrastructure.get_otp(current_user.user_id)
        
        # retrieved user services response
        user_services_response = await user_service.send_sms_otp(contact_number, current_user, old_otp)
        
        # set the otp code
        await redis_infrastructure.set_otp(current_user.user_id, user_services_response.otp_code,
                                           5 * 60)  # expires as 5 minutes
        
        # TODO Project process of API for sending sms, but for now there's no actual sms sending using background task.
        user_services_response.status_code = status.HTTP_200_OK
        return SuccessfulResponse(user_services_response)
    except Exception as e:
        raise e


@v1_user_router.get("/all", tags=[RoleSchema.ADMIN])
async def get_all_active_users(paginated: PaginatedSchema = Query(),
                               current_user: DecodedTokenDTO = Depends(get_current_user),
                               user_service: UserServices = Depends(get_user_service),
                               ):
    try:
        user_service_response = await user_service.get_all_active_users(paginated, current_user)
        user_service_response.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(user_service_response)
        return response
    except Exception as e:
        raise e


@v1_user_router.post("/otp/verify")
async def verify_otp_code(otp_code: str,
                          current_user: DecodedTokenDTO = Depends(get_current_user),
                          redis_infrastructure: RedisInfrastructure = Depends(get_redis_services),
                          user_service: UserServices = Depends(get_user_service), ):
    try:
        # get the otp from redis to verify
        otp_from_redis = await redis_infrastructure.get_otp(current_user.user_id)
        
        services_response = await user_service.verify_sms_otp(otp_code, otp_from_redis, current_user)
        
        # delete the otp in redis if successfully verified.
        await redis_infrastructure.delete_otp(current_user.user_id)
        # set the status code
        services_response.status_code = status.HTTP_200_OK
        # then return the response
        return SuccessfulResponse(services_response)
    except Exception as e:
        raise e


@v1_user_router.get("/addresses")
async def get_addresses(current_user: DecodedTokenDTO = Depends(get_current_user),
                        user_service: UserServices = Depends(get_user_service), ):
    try:
        user_response = await user_service.get_user_addresses(current_user)
        
        user_response.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(user_response)
        
        return response
    except Exception as e:
        raise e


@v1_user_router.post('/address')
async def insert_address(address: CreateAddress = Depends(CreateAddress.create_depends),
                         current_user: DecodedTokenDTO = Depends(get_current_user),
                         user_service: UserServices = Depends(get_user_service),
                         ):
    try:
        user_response = await user_service.insert_address(address, current_user)
        user_response.status_code = status.HTTP_201_CREATED
        response = SuccessfulResponse(user_response)
        
        return response
    except Exception as e:
        raise e


@v1_user_router.patch("/change-password")
async def change_password(change_password: ChangePasswordSchema,
                          current_user: DecodedTokenDTO = Depends(get_current_user),
                          refresh_access_token: str = Cookie(default=None, alias=ConstantsKeyData.COOKIE_REFRESH_TOKEN),
                          user_service: UserServices = Depends(get_user_service)):
    try:
        user_response = await user_service.change_password(change_password, refresh_access_token, current_user)
        
        user_response.status_code = status.HTTP_200_OK
        # delete cookies
        response = SuccessfulResponse(user_response)
        
        delete_auth_cookie(response)
        
        return response
    except Exception as e:
        print(e)
        raise e


@v1_user_router.patch('/')
async def update_user_personal_information(data: UpdateUserSchema = Depends(UpdateUserSchema.depends),
                                           current_user: DecodedTokenDTO = Depends(get_current_user),
                                           image: Optional[UploadFile] = File(None),
                                           user_service: UserServices = Depends(get_user_service),
                                           ):
    try:
        filename, img_byte = None, None
        if image:
            filename, img_byte = await get_filenames_and_image_bytes([image])
        user_response = await user_service.update_profile_information(data, current_user, filename, img_byte)
        user_response.status_code = status.HTTP_200_OK
        
        return SuccessfulResponse(user_response)
    except Exception as e:
        raise e


@v1_user_router.patch("/address/{address_id}")
async def update_address(address_id: str,
                         address: UpdateAddress = Depends(UpdateAddress.update_depends),
                         current_user: DecodedTokenDTO = Depends(get_current_user),
                         user_service: UserServices = Depends(get_user_service),
                         ):
    try:
        user_service_response = await user_service.update_address(address, address_id, current_user)
        
        user_service_response.status_code = status.HTTP_200_OK
        return SuccessfulResponse(user_service_response)
    except Exception as e:
        raise e


@v1_user_router.delete("/address/{address_id}")
async def delete_user_address(address_id: str,
                              current_user: DecodedTokenDTO = Depends(get_current_user),
                              user_service: UserServices = Depends(get_user_service)):
    try:
        user_response = await user_service.delete_user_address(address_id, current_user)
        user_response.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(user_response)
        return response
    except Exception as e:
        raise e
@v1_user_router.patch('/set-default/{address_id}')
async def set_address_as_default(address_id : str, current_user : DecodedTokenDTO = Depends(get_current_user),
                                 user_service: UserServices = Depends(get_user_service)):
    try:
        user_service_response = await user_service.set_address_as_default(address_id, current_user)

        user_service_response.status_code = status.HTTP_200_OK

        return SuccessfulResponse(user_service_response)

    except Exception as e:
        raise e