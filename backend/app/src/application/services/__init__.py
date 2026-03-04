import asyncpg
from sqlalchemy.exc import DBAPIError, OperationalError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_fixed

TransientErrors = (OperationalError, DBAPIError, asyncpg.PostgresError)
retry_on_transient = retry(retry=retry_if_exception_type(TransientErrors),
                           stop=stop_after_attempt(5),
                           wait=wait_fixed(1),
                           reraise=True, )
