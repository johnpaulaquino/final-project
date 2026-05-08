import resend
from fastapi_mail import FastMail, MessageSchema, MessageType
from jinja2 import FileSystemLoader, Environment
from pydantic import NameEmail

from app.config.mail_config import MAIL_CONFIGURATION, RESEND_TEMPLATE_PATH
from app.src.core.constants import ConstantsData
from app.src.domain.interfaces.email_interface import EmailInterface


class EmailInfrastructure(EmailInterface):
    def __init__(self):
        self.__fm = FastMail(MAIL_CONFIGURATION)
        self.template_env = Environment(loader=FileSystemLoader(RESEND_TEMPLATE_PATH))
        resend.api_key =ConstantsData.RESEND_API_KEY
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
                               "error_response"     : error_response},
                subtype=MessageType.html,
                )
        await self.__fm.send_message(message, template_name=email_template)

    async def send_message_using_resend(self,recipient,verification_code : str):
        template = self.template_env.get_template('code-verification.html')
        print(template)
        html_content = template.render(activation_code=verification_code)
        params = {
            "from": "biskota@resend.dev",
            "to": [recipient],
            "subject": "Your Verification Code",
            "html": html_content
        }
        response = resend.Emails.send(params)
        return response
