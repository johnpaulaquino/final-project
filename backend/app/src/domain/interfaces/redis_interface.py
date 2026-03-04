from abc import ABC, abstractmethod


class RedisInterface(ABC):
    
    @abstractmethod
    async def set_otp(self, identifier: str, otp: str, exp: int = 180):
        pass
    
    @abstractmethod
    async def get_otp(self, identifier: str) -> str | None:
        pass
    
    @abstractmethod
    async def delete_otp(self, identifier: str):
        pass
