from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Body, Cookie, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from starlette import status

from app.src.application.services.auth_services import AuthServices
from app.src.core.constants import ConstantsData, ConstantsKeyData, EndpointTags
from app.src.core.dependencies import (get_auth_service, get_email_infrastructure, get_redis_services,
                                       )
from app.src.core.security import AppSecurity
from app.src.exceptions.http_exceptions import DataBadRequestException
from app.src.infrastructure.email_infrastructure import EmailInfrastructure
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure
from app.src.schema import SuccessfulResponseSchema
from app.src.schema.auth_schema import CookieResponseSchema, LoginRequest, SignUpRequest
from app.src.utils.successful_response import SuccessfulResponse

__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/auth"

v1_auth_router = APIRouter(tags=[EndpointTags.AUTHENTICATION], prefix=__base_endpoint)


@v1_auth_router.post("/signup", tags=[EndpointTags.CUSTOMER])
async def create_account(background_task: BackgroundTasks,
                         email: EmailStr | str = Body(),
                         email_infrastructure: EmailInfrastructure = Depends(get_email_infrastructure),
                         auth_services: AuthServices = Depends(get_auth_service),
                         redis_services: RedisInfrastructure = Depends(get_redis_services)):
    try:
        # email infrastructure.
        # otp from redis.
        otp_code_from_redis = await redis_services.get_otp(email)
        
        # auth services response.
        services_response = await auth_services.manual_signup_initiate(email, old_otp_code=otp_code_from_redis)
        
        # check if the services response contains an otp code, if it does, send the email and set the cookie,
        # otherwise just set the cookie and return the response.
        success_response_schema = SuccessfulResponseSchema(message=services_response.message,
                                                           status_code=status.HTTP_200_OK)
        
        if services_response.otp_code:
            # set the otp code in redis.
            redis_expiration = 3 * 60
            await redis_services.set_otp(email, services_response.otp_code, redis_expiration)
            success_response_schema.status_code = status.HTTP_202_ACCEPTED
            success_response_schema.status_message = "accepted"
            # send email in background task.
            background_task.add_task(email_infrastructure.send_email_verification_code, recipient=email,
                                     verification_code=services_response.otp_code)
        
        response = SuccessfulResponse(success_response_schema)
        
        verification_cookie_data = CookieResponseSchema(
                key=ConstantsKeyData.COOKIE_VERIFICATION_KEY,
                value=services_response.verification_token
                )
        
        csrf_cookie_data = CookieResponseSchema(
                key=ConstantsKeyData.COOKIE_CSRF_TOKEN,
                value=services_response.csrf_token)
        
        csrf_cookie_data.httponly = False
        # model_dump() (or dict() in older Pydantic) securely maps your schema to Starlette's kwargs
        response.set_cookie(**verification_cookie_data.model_dump())
        response.set_cookie(**csrf_cookie_data.model_dump())
        
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/verify-otp", tags=[EndpointTags.CUSTOMER])
async def verify_signup_otp(otp_code: str = Body(),
                            verification_token: str = Cookie(None, alias=ConstantsKeyData.COOKIE_VERIFICATION_KEY),
                            auth_services: AuthServices = Depends(get_auth_service),
                            redis_services: RedisInfrastructure = Depends(get_redis_services)):
    try:
        # auth services.
        try:
            # verify token
            payload = AppSecurity.decode_jwt_token(verification_token)
            # get the email
            user_email: str = payload.get("user_email")
            user_email = user_email.strip()
        except Exception as e:
            raise DataBadRequestException(message="Signup verification failed. Please re-enter your email.", )
        # otp from redis.
        otp_code_from_redis = await redis_services.get_otp(user_email)
        
        # auth services response.
        services_response = await auth_services.verify_signup_otp_code(otp_code=otp_code,
                                                                       otp_code_from_redis=otp_code_from_redis,
                                                                       email=user_email)
        
        # if successful response
        success_response_schema = SuccessfulResponseSchema(message=services_response.message)
        
        success_response_schema.status_code = status.HTTP_201_CREATED
        success_response_schema.status_message = "ok"
        response = SuccessfulResponse(success_response_schema)
        
        await redis_services.delete_otp(user_email)
        
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/complete-signup", tags=[EndpointTags.CUSTOMER])
async def complete_signup(signup_data: SignUpRequest = Depends(SignUpRequest.sign_up_request_depends),
                          redis_services: RedisInfrastructure = Depends(get_redis_services),
                          auth_services: AuthServices = Depends(get_auth_service),
                          verification_token: str = Cookie(None)):
    try:
        
        # auth services response.
        services_response = await auth_services.manual_signup_final_step(signup_data, verification_token)
        # delete the otp code from redis.
        await redis_services.delete_otp(signup_data.email)
        # delete data from temp users table
        
        # if successful response
        # set the data from services response to the successful response schema, and return the response.
        success_response_schema = SuccessfulResponseSchema(message=services_response.message)
        # set the status code to 201 created, and status message to "ok"
        success_response_schema.status_code = status.HTTP_201_CREATED
        success_response_schema.status_message = "ok"
        # set the access token to the successful response schema.
        success_response_schema.access_token = services_response.access_token
        # finally initialize the successful response with the successful response schema, and return the response.
        response = SuccessfulResponse(success_response_schema)
        
        # if no errors, then return the response with the access token if there is one.
        success_response_schema.access_token = services_response.access_token
        success_response_schema.refresh_token = services_response.refresh_token
        success_response_schema.csrf_token = services_response.csrf_token
        
        response = SuccessfulResponse(success_response_schema)
        
        access_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_ACCESS_TOKEN,
                                             value=success_response_schema.access_token)
        access_cookie.max_age = 15 * 60  # 16 minutes, same as the access token
        response.set_cookie(**access_cookie.model_dump())
        
        # refresh cookie
        refresh_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_REFRESH_TOKEN,
                                              value=success_response_schema.refresh_token)
        refresh_cookie.max_age = int(
                timedelta(days=ConstantsData.JWT_EXPIRATION).total_seconds())  # 7 days, same as the refresh token
        response.set_cookie(**refresh_cookie.model_dump())
        
        # csrf cookie
        csrf_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_CSRF_TOKEN,
                                           value=success_response_schema.csrf_token)
        csrf_cookie.max_age = 15 * 60  # 16 minutes, same as the access token
        csrf_cookie.httponly = False
        response.set_cookie(**csrf_cookie.model_dump())
        
        # remove the cookie from the response
        response.delete_cookie(key=ConstantsKeyData.COOKIE_VERIFICATION_KEY)
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/login", tags=[EndpointTags.CUSTOMER])
async def login(form_data: OAuth2PasswordRequestForm = Depends(),
                auth_services: AuthServices = Depends(get_auth_service),
                ):
    try:
        
        credentials = LoginRequest(email=form_data.username, password=form_data.password)
        auth_response = await auth_services.manual_login(credentials=credentials)
        
        response_schema = SuccessfulResponseSchema(message=auth_response.message,
                                                   status_code=status.HTTP_200_OK,
                                                   status_message="ok")
        
        # if no errors, then return the response with the access token if there is one.
        response_schema.access_token = auth_response.access_token
        response_schema.refresh_token = auth_response.refresh_token
        response_schema.csrf_token = auth_response.csrf_token
        
        response = SuccessfulResponse(response_schema)
        
        access_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_ACCESS_TOKEN,
                                             value=response_schema.access_token)
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
        
        return response
    
    
    except Exception as e:
        raise e


@v1_auth_router.post('/refresh-token', tags=[EndpointTags.CUSTOMER])
async def refresh_token(refresh_token: str = Cookie(None),
                        auth_services: AuthServices = Depends(get_auth_service), ):
    try:
        auth_services_response = await auth_services.refresh_token(refresh_token=refresh_token)
        
        auth_services_response.status_code = status.HTTP_200_OK
        response = SuccessfulResponse(auth_services_response)
        response.set_cookie(**CookieResponseSchema(key=ConstantsKeyData.COOKIE_ACCESS_TOKEN,
                                                   value=auth_services_response.access_token).model_dump())
        
        response.set_cookie(**CookieResponseSchema(key=ConstantsKeyData.COOKIE_REFRESH_TOKEN,
                                                   value=auth_services_response.refresh_token).model_dump())
        # csrf cookie
        csrf_cookie = CookieResponseSchema(key=ConstantsKeyData.COOKIE_CSRF_TOKEN,
                                           value=auth_services_response.csrf_token)
        csrf_cookie.max_age = 15 * 60  # 16 minutes, same as the access token
        csrf_cookie.httponly = False
        response.set_cookie(**csrf_cookie.model_dump())
        return response
    
    except Exception as e:
        raise e


@v1_auth_router.post("/logout")
async def log_out_user(refresh_access_token: str = Cookie(default=None, alias=ConstantsKeyData.COOKIE_ACCESS_TOKEN),
                       auth_services: AuthServices = Depends(get_auth_service)):
    try:
        auth_services_response = await auth_services.log_out_user(refresh_token=refresh_access_token)
        auth_services_response.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(auth_services_response)
        
        response.delete_cookie(key=ConstantsKeyData.COOKIE_ACCESS_TOKEN)
        response.delete_cookie(key=ConstantsKeyData.COOKIE_CSRF_TOKEN)
        response.delete_cookie(key=ConstantsKeyData.COOKIE_REFRESH_TOKEN)
        
        return response
    except Exception as e:
        raise e
