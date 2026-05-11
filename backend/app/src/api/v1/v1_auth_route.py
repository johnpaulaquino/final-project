from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Body, Cookie, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from starlette import status

from app.src.api.api_utility import delete_auth_cookie, set_auth_cookie, set_verification_token, \
    delete_verification_cookie
from app.src.application.services.auth_services import AuthServices
from app.src.core.constants import ConstantsData, ConstantsKeyData, EndpointTags
from app.src.core.dependencies import (get_auth_service, get_email_infrastructure, get_redis_services,
                                       )
from app.src.core.security import AppSecurity
from app.src.exceptions.http_exceptions import DataBadRequestException
from app.src.infrastructure.email_infrastructure import EmailInfrastructure
from app.src.infrastructure.redis_infrastructure import RedisInfrastructure
from app.src.schema import  EnvironmentStatus
from app.src.schema.auth_schema import  LoginRequest, SignUpRequest
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
        services_response.status_code = status.HTTP_200_OK

        if services_response.otp_code:
            # set the otp code in redis.
            redis_expiration = 3 * 60
            await redis_services.set_otp(email, services_response.otp_code, redis_expiration)
            services_response.status_code = status.HTTP_202_ACCEPTED
            services_response.status_message = "accepted"
            # send email in background task.
            if ConstantsData.ENVIRONMENT == EnvironmentStatus.Dev:
                background_task.add_task(email_infrastructure.send_email_verification_code,
                                         recipient=email,
                                         verification_code=services_response.otp_code)
            else:
                try:
                    await email_infrastructure.send_message_using_sendgrid(
                        recipient=email,
                        verification_code=services_response.otp_code)
                    print("SendGrid accepted the email payload!")
                except Exception as e:
                    print("SENDGRID REJECTED THE EMAIL!")

                    # SendGrid hides the actual JSON error message inside 'e.body'
                    if hasattr(e, 'body'):
                        print(f"SendGrid Exact Reason: {e.body}")
                    elif hasattr(e, 'message'):
                        print(f"Error Message: {e.message}")
                    else:
                        print(f"Generic Error: {e}")


        response = SuccessfulResponse(services_response)
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

        services_response.status_code = status.HTTP_201_CREATED
        services_response.status_message = "ok"
        response = SuccessfulResponse(services_response)

        await redis_services.delete_otp(user_email)

        return response

    except Exception as e:
        raise e


@v1_auth_router.post("/complete-signup", tags=[EndpointTags.CUSTOMER])
async def complete_signup(signup_data: SignUpRequest = Depends(SignUpRequest.sign_up_request_depends),
                          redis_services: RedisInfrastructure = Depends(get_redis_services),
                          auth_services: AuthServices = Depends(get_auth_service),
                          verification_token: str = Cookie(None,alias=ConstantsKeyData.COOKIE_VERIFICATION_KEY)):
    try:

        # auth services response.
        services_response = await auth_services.manual_signup_final_step(signup_data, verification_token)
        # delete the otp code from redis.
        await redis_services.delete_otp(signup_data.email)
        # delete data from temp users table

        # if successful response
        # set the data from services response to the successful response schema, and return the response.
        # set the status code to 201 created, and status message to "ok"
        services_response.status_code = status.HTTP_201_CREATED
        services_response.status_message = "ok"
        # set the access token to the successful response schema.

        response = SuccessfulResponse(services_response)

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

        auth_response.status_code = status.HTTP_200_OK

        response = SuccessfulResponse(auth_response)

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
        return response

    except Exception as e:

        raise e


@v1_auth_router.post("/logout")
async def log_out_user(refresh_access_token: str = Cookie(default=None, alias=ConstantsKeyData.COOKIE_REFRESH_TOKEN),
                       auth_services: AuthServices = Depends(get_auth_service)):
    try:
        auth_services_response = await auth_services.log_out_user(refresh_token=refresh_access_token)
        auth_services_response.status_code = status.HTTP_200_OK

        response = SuccessfulResponse(auth_services_response)

        return response
    except Exception as e:
        raise e
