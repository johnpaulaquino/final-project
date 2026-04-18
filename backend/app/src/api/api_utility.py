from datetime import timedelta

from fastapi.responses import JSONResponse

from app.src.core.constants import ConstantsData, ConstantsKeyData
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
