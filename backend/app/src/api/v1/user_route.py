from fastapi import APIRouter, Depends
from starlette import status

from app.src.application.services.user_services import UserServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_current_user, get_user_service
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.utils.successful_response import SuccessfulResponse

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/me"

v1_user_router = APIRouter(tags=[EndpointTags.USERS], prefix=__base_endpoint)



@v1_user_router.patch('/{user_id}')
async def update_user_personal_information(user_id: str,
                                           current_user: DecodedTokenDTO = Depends(get_current_user),
                                           user_service: UserServices = Depends(get_user_service),
                                           ):
    try:
        pass
    
    except Exception as e:
        raise e


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
