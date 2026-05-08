import sys

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.src.api.v1.v1_auth_route import v1_auth_router
from app.src.api.v1.v1_cart_route import v1_cart_router
from app.src.api.v1.v1_notification_route import v1_notification_router
from app.src.api.v1.v1_order_route import v1_order_router
from app.src.api.v1.v1_products_route import v1_products_router
from app.src.api.v1.v1_user_route import v1_user_router
from app.src.api.v1.v1_recommend_route import v1_recommend_router  # ← NEW
from app.src.core.constants import ConstantsData
from app.src.exceptions import BaseAppExceptions, app_exception_handler
from app.src.exceptions.domain_exceptions import DomainError
from app.src.utils.life_span import app_lifespan
from app.src.utils.utility import Utility

app = FastAPI(lifespan=app_lifespan)

origins = Utility.get_cors()
app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        )

app.include_router(v1_notification_router)
app.include_router(v1_auth_router)
app.include_router(v1_cart_router)
app.include_router(v1_products_router)
app.include_router(v1_order_router)
app.include_router(v1_user_router)
app.include_router(v1_recommend_router)  # ← NEW

# to handle custom exception
app.add_exception_handler(handler=app_exception_handler,
                          exc_class_or_status_code=BaseAppExceptions)
app.add_exception_handler(handler=app_exception_handler,
                          exc_class_or_status_code=DomainError)
app.add_exception_handler(handler=app_exception_handler,
                          exc_class_or_status_code=Exception)


def start():
    """Entry point for the 'server' command in pyproject.toml"""
    use_loop = "uvloop" if sys.platform != "win32" else "auto"
    uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=ConstantsData.SERVER_PORT,
            reload=True,
            workers=4,
            loop=use_loop,
            proxy_headers=True,
            forwarded_allow_ips="*", )


if __name__ == "__main__":
    start()