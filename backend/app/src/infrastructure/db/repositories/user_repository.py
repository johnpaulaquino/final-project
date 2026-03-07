from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.src.domain.dto.auth_dto import UserDTO
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Address, PersonalInfo, Users
from app.src.schema.auth_schema import SignUpRequest


class UserRepository(UserInterface):
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def insert_record(self, signup_user: SignUpRequest) -> UserDTO:
        user = Users(email=signup_user.email, password=signup_user.password)
        
        user.is_active = True
        user.sign_up_steps = 3
        
        self.db.add(user)
        await self.db.flush()
        # insert password, firstname, lastname,middle name
        
        # return the email and id only
        return UserDTO(**user.model_dump())
    
    async def insert_personal_info_address(self, user_id, signup_user: SignUpRequest):
        personal_info = PersonalInfo(user_id=user_id,
                                     lastname=signup_user.lastname,
                                     firstname=signup_user.firstname,
                                     middle_name=signup_user.middle_name)
        # insert the address
        address = Address(user_id=user_id)
        self.db.add_all([personal_info, address])
    
    async def find_record(self, email: str):
        stmt = (select(Users,
                       PersonalInfo,
                       Address, )
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .outerjoin(Address, Users.id == Address.user_id)
                .where(Users.email == email))
        
        result = await self.db.execute(stmt)
        data = result.mappings().fetchall()
        
        return data[0] if data else data
    
    async def find_record_by_id(self, user_id: str):
        stmt = (select(Users,
                       PersonalInfo,
                       Address, )
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .outerjoin(Address, Users.id == Address.user_id)
                .where(Users.id == user_id))
        
        result = await self.db.execute(stmt)
        data = result.mappings().fetchall()
        
        return data[0] if data else data
    
    async def update_record(self, record_id: str, data: dict | None = None):
        pass
    
    async def soft_delete_record(self, record_id: str) -> None:
        pass
    
    async def delete_record(self, record_id: str):
        pass

# @staticmethod
# async def find_user_by_email(email: str):
#     async with create_session() as db:
#         try:
#             stmt = (select(Users,
#                            PersonalInfo,
#                            Address,
#                            )
#                     .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
#                     .outerjoin(Address, Users.id == Address.user_id)
#                     .where(Users.email == email))
#
#             result = await safe_execute(db, stmt)
#             data = result.mappings().fetchall()
#
#             return data
#         except Exception as e:
#             raise e
#
# @staticmethod
# async def find_user_by_id(user_id: str):
#     async with create_session() as db:
#         try:
#             stmt = (select(Users,
#                            PersonalInfo,
#                            Address,
#                            )
#                     .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
#                     .outerjoin(Address, Users.id == Address.user_id)
#                     .where(Users.email == user_id))
#
#             result = await safe_execute(db, stmt)
#             data = result.scalars().fetchall()
#
#             return data
#         except Exception as e:
#             raise e
#
# @staticmethod
# async def update_user_password(user_id: str, data: dict):
#     async with create_session() as db:
#         try:
#             stmt = update(Users).where(Users.id == user_id).values(**data)
#             await safe_execute(db, stmt)
#             await safe_commit(db)
#         except Exception as e:
#             raise e
#
# @staticmethod
# async def soft_delete_user(user_id: str):
#     async with create_session() as db:
#         try:
#             stmt = update(Users).values(Users.is_deleted == True).where(Users.id == user_id)
#             await safe_execute(db, stmt)
#             await safe_commit(db)
#         except Exception as e:
#             raise e
#
# @staticmethod
# async def hard_delete(user_id: str):
#     async with create_session() as db:
#         try:
#             stmt = delete(Users).where(Users.id == user_id)
#             await safe_execute(db, stmt)
#             await safe_commit(db)
#         except Exception as e:
#             raise e
