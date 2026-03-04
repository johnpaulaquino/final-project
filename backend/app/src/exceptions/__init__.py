from fastapi import Request
from starlette.responses import JSONResponse

from app.src.exceptions.exceptions_mapper import EXCEPTION_MAPPER
from app.src.exceptions.http_exceptions import BaseAppExceptions


def app_exception_handler(_: Request, exc: Exception):
    """
    This is the custom exception that will inject into app.
    :return: The exception
    """
    
    for exc_type, adapter in EXCEPTION_MAPPER.items():
        if isinstance(exc, exc_type):
            http_exc = adapter(exc)
            content = {"status_code": http_exc.status_code,
                       'status'     : http_exc.message_status,
                       'message'    : http_exc.message}
            return JSONResponse(status_code=http_exc.status_code,
                                content=content,
                                headers=http_exc.headers)
        if isinstance(exc, BaseAppExceptions):
            content = {"status_code": exc.status_code,
                       'status'     : exc.message_status,
                       'message'    : exc.message}
            return JSONResponse(status_code=exc.status_code,
                                content=content,
                                headers=exc.headers)
    
    return JSONResponse(status_code=500,
                        content={"status_code": 500,
                                 'status'     : "error",
                                 'message'    : "An unexpected error occurred."})
