import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Constants(BaseSettings):
    # api versioning
    API_V1_ENDPOINT: str = "/api/v1/biskota"
    # this is for jwt configuration
    JWT_KEY: str
    JWT_ALGORITHM: str
    JWT_EXPIRATION: int
    
    ENVIRONMENT: str
    
    # this is for database
    # this is for database
    # POSTGRES_DB_URL = postgresql + asyncpg: // postgres: 1084 @ localhost:5432 / e_comm
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_HOST: str
    DB_PORT: int
    
    # Redis config
    REDIS_DB_URL: str
    REDIS_SERVER_PORT: int
    
    SERVER_PORT: int
    
    # Cloudinary config
    C_NAME: str
    C_KEY: str
    C_SECRET: str
    C_SECURE: bool
    
    MAIL_USERNAME: str
    MAIL_PASSWORD: SecretStr
    MAIL_FROM: str | EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    MAIL_USE_CREDENTIALS: bool
    MAIL_VALIDATE_CERTS: bool
    
    STATIC_FILE_PATH: Path = Path(__file__).resolve()
    TEMPLATE_PATH: Path = Path(__file__).resolve().parent
    
    FILE_SIZE_LIMIT: int = 1024 * 1024 * 10  # it is exactly 10 mb
    
    STATIC_PATH: str = os.path.abspath(os.path.join(os.curdir, 'static'))
    
    # for prefix in http
    
    model_config = SettingsConfigDict(
            env_file='../../../.example.env'
            )


class ConstantsKey(BaseModel):
    # Key for cookie to retrieve.
    COOKIE_VERIFICATION_KEY: str = "verification_token"
    COOKIE_REFRESH_TOKEN: str = "refresh_token"
    
    # Key for data on signed token
    TOKEN_DATA_KEY_USER_EMAIL: str = 'user_email'
    TOKEN_DATA_KEY_USER_ID: str = 'user_id'
    TOKEN_DATA_KEY_ROLE: str = 'role'
    
    # for user action, especially in authentication
    USER_ACTION_SIGNUP: str = "SIGNUP"
    USER_ACTION_LOGIN: str = "LOGIN"
    USER_ACTION_EMAIL_VERIFICATION: str = "EMAIL_VERIFICATION"


# Constants for Tags
class EndpointTags(str):
    AUTHENTICATION = "Authentication"
    CUSTOMER = "Customer"
    ADMIN = "Admin"
    PRODUCTS = "Products"
    ORDERS = "Orders"
    USERS = "Users"


# initialize classes
ConstantsData = Constants()
ConstantsKeyData = ConstantsKey()
