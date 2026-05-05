from datetime import timedelta
from typing import List, Optional

from fastapi import File, UploadFile
from fastapi.responses import JSONResponse

from app.src.core.constants import ConstantsData, ConstantsKeyData
from app.src.domain.dto.auth_dto import OnUpdateSecuredCredentials
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.auth_schema import CookieResponseOnDelete, CookieResponseSchema


def set_auth_cookie(response: JSONResponse, response_schema: SuccessfulResponseSchema):
    
    access_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_ACCESS_TOKEN,
                                         value=response_schema.access_token, )
    access_cookie.max_age = 15 * 60  # 15 minutes, same as the access token
    response.set_cookie(**access_cookie.model_dump())
    
    # refresh cookie
    refresh_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_REFRESH_TOKEN,
                                          value=response_schema.refresh_token)
    refresh_cookie.max_age = int(
            timedelta(days=ConstantsData.JWT_EXPIRATION).total_seconds())  # 7 days, same as the refresh token
    response.set_cookie(**refresh_cookie.model_dump())
    
    # csrf cookie
    csrf_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_CSRF_TOKEN,
                                       value=response_schema.csrf_token)
    csrf_cookie.max_age = 15 * 60  # 15 minutes, same as the access token
    csrf_cookie.httponly = False
    response.set_cookie(**csrf_cookie.model_dump())


def delete_auth_cookie(response: JSONResponse):
    access_cookie = CookieResponseOnDelete(key=ConstantsKeyData.COOKIE_ACCESS_TOKEN)
    response.delete_cookie(**access_cookie.model_dump())
    
    # refresh cookie
    refresh_cookie = CookieResponseOnDelete(key=ConstantsKeyData.COOKIE_REFRESH_TOKEN)
    
    response.delete_cookie(**refresh_cookie.model_dump())
    
    # csrf cookie
    csrf_cookie = CookieResponseOnDelete(key=ConstantsKeyData.COOKIE_CSRF_TOKEN)
    csrf_cookie.httponly = False
    response.delete_cookie(**csrf_cookie.model_dump())


def set_verification_token(response  : JSONResponse,response_schema : OnUpdateSecuredCredentials, expiration : int):
    verification_cookie_data = CookieResponseSchema(
        key=ConstantsKeyData.COOKIE_VERIFICATION_KEY,
        value=response_schema.verification_token
    )
    verification_cookie_data.max_age = verification_cookie_data.max_age if expiration <= 0 else expiration
    csrf_cookie_data = CookieResponseSchema(
        key=ConstantsKeyData.COOKIE_CSRF_TOKEN,
        value=response_schema.csrf_token)
    csrf_cookie_data.max_age = csrf_cookie_data.max_age if expiration <= 0 else expiration

    csrf_cookie_data.httponly = False
    response.set_cookie(**verification_cookie_data.model_dump())
    response.set_cookie(**csrf_cookie_data.model_dump())


def delete_verification_cookie(response: JSONResponse):
    access_cookie = CookieResponseOnDelete(key=ConstantsKeyData.COOKIE_VERIFICATION_KEY)
    response.delete_cookie(**access_cookie.model_dump())

    # refresh cookie
    refresh_cookie = CookieResponseOnDelete(key=ConstantsKeyData.COOKIE_VERIFICATION_KEY)

    response.delete_cookie(**refresh_cookie.model_dump())

    # csrf cookie
    csrf_cookie = CookieResponseOnDelete(key=ConstantsKeyData.COOKIE_CSRF_TOKEN)
    csrf_cookie.httponly = False
    response.delete_cookie(**csrf_cookie.model_dump())
async def get_filenames_and_image_bytes(images: Optional[List[UploadFile]] = File(None)):
    filenames = []
    images_bytes = []
    
    # check if not null
    if images:
        for image in images:
            if image:
                filename = image.filename
                image_byte = await image.read()
                filenames.append(filename)
                images_bytes.append(image_byte)
    
    return filenames, images_bytes
