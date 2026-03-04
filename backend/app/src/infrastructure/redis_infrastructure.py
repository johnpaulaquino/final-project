import redis.exceptions
from redis.asyncio import Redis

from app.src.domain.interfaces.redis_interface import RedisInterface
from app.src.exceptions import BaseAppExceptions


class RedisInfrastructure(RedisInterface):
    
    def __init__(self, redis_app: Redis):
        self.redis_app = redis_app
        
        if self.redis_app is None:
            raise BaseAppExceptions
    
    async def set_otp(self, identifier: str, otp: str, exp: int = 180):
        key = f"otp:{identifier}"
        try:
            await self.redis_app.setex(key, value=otp, time=exp)
        except redis.exceptions.ConnectionError as e:
            raise BaseAppExceptions(message_status="Unavailable services", message="Redis service unavailable.",
                                    status_code=503)
    
    async def get_otp(self, identifier: str) -> str | None:
        key = f"otp:{identifier}"
        try:
            return await self.redis_app.get(key)
        except redis.exceptions.ConnectionError as e:
            raise BaseAppExceptions(message_status="Unavailable services", message="Redis service unavailable.",
                                    status_code=503)
    
    async def delete_otp(self, identifier: str):
        key = f"otp:{identifier}"
        try:
            await self.redis_app.delete(key)
        except redis.exceptions.ConnectionError as e:
            raise BaseAppExceptions(message_status="Unavailable services", message="Redis service unavailable.",
                                    status_code=503)
