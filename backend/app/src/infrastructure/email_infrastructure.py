import asyncio
from os import name

from fastapi_mail import FastMail, MessageSchema, MessageType
from jinja2 import FileSystemLoader, Environment
from pydantic import NameEmail
from sendgrid import Mail, SendGridAPIClient
from sentry_sdk.integrations import httpx


from app.config.mail_config import MAIL_CONFIGURATION, RESEND_TEMPLATE_PATH
from app.src.core.constants import ConstantsData, Constants
from app.src.domain.interfaces.email_interface import EmailInterface


class EmailInfrastructure(EmailInterface):
    def __init__(self):
        self.__fm = FastMail(MAIL_CONFIGURATION)
        self.template_env = Environment(loader=FileSystemLoader(RESEND_TEMPLATE_PATH))


    async def send_email_verification_code(self, recipient: NameEmail | str,
                                           verification_code: int,
                                           subject="Verification Code", ) -> None:
        message = MessageSchema(
            subject=subject,
            recipients=[recipient],
            template_body={"activation_code": verification_code},
            subtype=MessageType.html, )

        await self.__fm.send_message(message, template_name="code-verification.html")

    async def send_message_via_clicking(self, recipient: NameEmail | str, activation_link: str,
                                        subject="Account Verification",
                                        email_template="email-verification.html", error_response=None):
        message = MessageSchema(
            subject=subject,
            recipients=[recipient],
            template_body={"activation_api_link": activation_link, "email": recipient,
                           "error_response": error_response},
            subtype=MessageType.html,
        )
        await self.__fm.send_message(message, template_name=email_template)

    async def send_message_using_sendgrid(self, recipient, verification_code):
        template = self.template_env.get_template('code-verification.html')
        html_content = template.render(activation_code=verification_code)
        message = Mail(
            from_email=('aquinojohnpaul2211@gmail.com', 'Biskota'),
            to_emails=recipient,
            subject='Verification Code',
            html_content=html_content)
        try:
            sg = SendGridAPIClient(ConstantsData.SEND_GRID_API_KEY)
            # sg.set_sendgrid_data_residency("eu")
            await asyncio.to_thread(sg.send, message)
        except Exception as e:
            print(str(e))

