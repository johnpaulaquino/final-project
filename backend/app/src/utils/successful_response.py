from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse

from app.src.schema import SuccessfulResponseSchema


def SuccessfulResponse(success_schema: SuccessfulResponseSchema):
    
    message_content = {'status_code'   : success_schema.status_code,
                       "status_message": success_schema.status_message,
                       "message"       : success_schema.message}

    if success_schema.verification_token is not None:
        message_content.update({"verification_token": success_schema.verification_token})

    if success_schema.csrf_token is not None:
        message_content.update({"csrf_token": success_schema.csrf_token})

    if success_schema.paginated is not None:
        # to check if it's a paginated data
        message_content.update({"paginated": jsonable_encoder(success_schema.paginated)})
    
    if success_schema.refresh_token is not None:
        # to check if it's a paginated data
        message_content.update({"refresh_token": success_schema.refresh_token})
    if success_schema.data is not None:
        # to ch
        message_content.update({"data": jsonable_encoder(success_schema.data)})
    
    if success_schema.access_token is not None:
        message_content.update({"access_token": success_schema.access_token,
                                "access_type" : 'Bearer'})
    
    if success_schema.action is not None:
        message_content.update({"action": success_schema.action})
    
    if success_schema.headers is not None:
        return JSONResponse(
                status_code=success_schema.status_code,
                content=message_content,
                headers=success_schema.headers)
    
    return JSONResponse(
            status_code=success_schema.status_code,
            content=message_content, )
