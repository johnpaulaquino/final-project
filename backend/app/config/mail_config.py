from fastapi_mail import ConnectionConfig

from app.src.core.constants import ConstantsData

MAIL_CONFIGURATION = ConnectionConfig(
        MAIL_USERNAME=ConstantsData.MAIL_USERNAME,
        MAIL_PASSWORD=ConstantsData.MAIL_PASSWORD,
        MAIL_FROM=ConstantsData.MAIL_FROM,
        MAIL_PORT=ConstantsData.MAIL_PORT,
        MAIL_SERVER=ConstantsData.MAIL_SERVER,
        MAIL_STARTTLS=ConstantsData.MAIL_STARTTLS,
        MAIL_SSL_TLS=ConstantsData.MAIL_SSL_TLS,
        USE_CREDENTIALS=ConstantsData.MAIL_USE_CREDENTIALS,
        VALIDATE_CERTS=ConstantsData.MAIL_VALIDATE_CERTS,
        TEMPLATE_FOLDER=ConstantsData.TEMPLATE_PATH.parent.parent / 'templates' / 'email',
        )
RESEND_TEMPLATE_PATH=ConstantsData.TEMPLATE_PATH.parent.parent / 'templates' / 'email'