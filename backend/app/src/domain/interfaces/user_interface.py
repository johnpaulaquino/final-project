from typing import Protocol, TypeVar

T = TypeVar('T')


class UserInterface[T](Protocol):
    
    async def insert_record(self, record: T):
        pass
    
    async def find_record(self, record_id: str):
        pass
    
    async def update_record(self, record_id: str, data: dict | None = None):
        pass
    
    async def delete_record(self, record_id: str):
        pass
    
    async def soft_delete_record(self, record_id: str) -> None:
        pass
