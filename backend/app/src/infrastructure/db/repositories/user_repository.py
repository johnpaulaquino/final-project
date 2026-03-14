from jinja2.nodes import Add
from sqlalchemy import delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_, select

from app.src.core.constants import ConstantsData
from app.src.domain.dto.auth_dto import UserDTO
from app.src.domain.dto.users_dto import UserAddressDTO, UserFullInformationDTO, UserPersonalInfoDTO
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.exceptions.domain_exceptions import DomainError
from app.src.infrastructure.db.entity import Address, PersonalInfo, Users
from app.src.schema import EnvironmentStatus
from app.src.schema.auth_schema import SignUpRequest


class UserRepository(UserInterface):
    
    def __init__(self, __db: AsyncSession):
        self.__db = __db
    
    async def insert_record(self, signup_user: SignUpRequest) -> UserDTO:
        user = Users(email=signup_user.email, password=signup_user.password)
        
        user.is_active = True
        user.sign_up_steps = 3
        
        self.__db.add(user)
        await self.__db.flush()
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
        self.__db.add_all([personal_info, address])
    
    async def find_record(self, email: str) -> UserFullInformationDTO:
        stmt = (select(Users,
                       PersonalInfo,
                       Address, )
                .select_from(Users)
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .outerjoin(Address, Users.id == Address.user_id)
                .where(Users.email == email))
        
        result = await self.__db.execute(stmt)
        data = result.mappings().fetchall()
        
        return UserFullInformationDTO(**data[0]) if data else data
    
    async def find_record_by_id(self, user_id: str) -> UserFullInformationDTO:
        stmt = (select(Users,
                       PersonalInfo,
                       Address, )
                .select_from(Users)
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .outerjoin(Address, Users.id == Address.user_id)
                .where(Users.id == user_id))
        
        result = await self.__db.execute(stmt)
        data = result.mappings().fetchall()
        
        return UserFullInformationDTO(**data[0]) if data else data
    
    async def get_user_info_only(self, user_id: str) -> UserDTO:
        """
        To get the personal info only.
        :param user_id: is a unique from user.
        :return: Personal Information only.
        """
        stmt = (select(Users)
                .where(Users.user_id == user_id))
        
        result = await self.__db.execute(stmt)
        data = result.scalars().first()
        
        return UserDTO.model_validate(data) if data else data
    
    async def get_personal_info_only(self, user_id: str) -> UserPersonalInfoDTO:
        """
        To get the personal info only.
        :param user_id: is a unique from user.
        :return: Personal Information only.
        """
        stmt = (select(PersonalInfo)
                .where(PersonalInfo.user_id == user_id))
        
        result = await self.__db.execute(stmt)
        data = result.scalars().first()
        
        return UserPersonalInfoDTO.model_validate(data) if data else data
    
    async def get_address_only(self, user_id: str) -> UserAddressDTO:
        """
        To get the address only.
        :param user_id: Unique from users.
        """
        try:
            stmt = (select(Address)
                    .where(Address.user_id == user_id))
            result = await self.__db.execute(stmt)
            data = result.scalars().first()
            
            return UserAddressDTO.model_validate(data) if data else data
        except Exception as e:
            raise e
    
    async def update_record(self, record_id: str, data: dict | None = None):
        try:
            stmt = update(Users).values(**data).where(Users.id == record_id)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def soft_delete_record(self, record_id: str) -> None:
        try:
            stmt = update(Users).values(is_deleted=True).where(Users.id == record_id)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def delete_record(self, record_id: str):
        try:
            stmt = delete(Users).where(Users.id == record_id)
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
    
    async def update_user_personal_info(self, user_id, data: dict):
        try:
            stmt = update(PersonalInfo).values(**data).where(PersonalInfo.user_id == user_id)
            await self.__db.execute(stmt)
        except Exception as e:
            # log error message
            if ConstantsData.ENVIRONMENT == EnvironmentStatus.Dev:
                raise DomainError(str(e))
            raise DomainError
    
    async def update_user_address(self, user_id, address_id, data: dict):
        try:
            stmt = update(Address).values(**data).where(and_(Address.user_id == user_id,
                                                             Address.id == address_id))
            await self.__db.execute(stmt)
        except Exception as e:
            # log error message
            if ConstantsData.ENVIRONMENT == EnvironmentStatus.Dev:
                return DomainError(str(e))
            raise DomainError
    
    async def delete_user_address(self, user_id, address_id):
        try:
            stmt = delete(Address).where(and_(Address.user_id == user_id,
                                              Address.id == address_id))
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
