from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_

from app.src.core.constants import ConstantsData
from app.src.domain.dto.auth_dto import UserDTO, UserWithPasswordDTO
from app.src.domain.dto.users_dto import (UserAddressDTO, UserAddressesDTO, UserFullInformationDTO,
                                          UserFullInformationWithoutPasswordDTO, UserPersonalInfoDTO, )
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.exceptions.domain_exceptions import DomainError
from app.src.infrastructure.db.entity import Address, Orders, PersonalInfo, Transactions, Users
from app.src.infrastructure.db.entity.users.address_entity import CreateAddress
from app.src.schema import EnvironmentStatus, RoleSchema
from app.src.schema.auth_schema import SignUpRequest
from app.src.schema.orders_schema import OrderStatusSchema


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
        self.__db.add(personal_info)
    
    async def insert_address(self, address: CreateAddress):
        address_info = Address(**address.model_dump())
        
        # insert the address
        self.__db.add(address_info)
        
        return UserAddressDTO.model_validate(address_info)
    
    async def find_record(self, email: str) -> UserFullInformationDTO:
        stmt = (select(Users,
                       PersonalInfo)
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .where(Users.email == email))
        
        result = await self.__db.execute(stmt)
        data = result.mappings().fetchall()
        
        return UserFullInformationDTO(**data[0]) if data else data
    
    async def find_record_with_password(self, email: str) -> UserFullInformationDTO:
        stmt = (select(Users,
                       PersonalInfo)
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .where(Users.email == email))
        
        result = await self.__db.execute(stmt)
        data = result.mappings().fetchall()
        
        return UserFullInformationDTO(**data[0]) if data else data
    
    async def find_record_by_id(self, user_id: str) -> UserFullInformationWithoutPasswordDTO:
        stmt = (select(Users,
                       PersonalInfo)
                .select_from(Users)
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
                .where(Users.id == user_id))
        
        result = await self.__db.execute(stmt)
        data = result.mappings().fetchall()
        
        return UserFullInformationWithoutPasswordDTO(**data[0]) if data else data
    
    async def find_record_by_id_with_password(self, user_id: str) -> UserFullInformationDTO:
        stmt = (select(Users,
                       PersonalInfo)
                .select_from(Users)
                .outerjoin(PersonalInfo, Users.id == PersonalInfo.user_id)
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
                .where(Users.id == user_id))
        
        result = await self.__db.execute(stmt)
        data = result.scalars().first()
        return UserDTO.model_validate(data) if data else data
    
    async def get_user_info_only_with_password(self, user_id: str) -> UserWithPasswordDTO:
        """
        To get the personal info only.
        :param user_id: is a unique from user.
        :return: Personal Information only.
        """
        stmt = (select(Users)
                .where(Users.id == user_id))
        
        result = await self.__db.execute(stmt)
        data = result.scalars().first()
        
        return UserWithPasswordDTO.model_validate(data) if data else data
    
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
    
    async def get_address_only(self, address_id: str, user_id: str) -> UserAddressDTO:
        """
        To get the address only.
        :param user_id: Unique from users.
        """
        try:
            stmt = (select(Address)
                    .where(and_(Address.id == address_id, Address.user_id == user_id)))
            result = await self.__db.execute(stmt)
            data = result.scalars().first()
            
            return UserAddressDTO.model_validate(data) if data else data
        except Exception as e:
            raise e
    
    async def get_addresses_only(self, user_id: str) -> UserAddressesDTO:
        """
        To get the address only.
        :param user_id: Unique from users.
        """
        try:
            stmt = (select(Address)
                    .where(Address.user_id == user_id)).limit(5)
            result = await self.__db.execute(stmt)
            data = result.scalars().fetchall()
            data = {"addresses": data}
            return UserAddressesDTO(**data) if data else data
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
    
    async def get_paginated_user_sales(self, offset, limit: int):
        try:
            stmt = (select(Users.id,
                           PersonalInfo.firstname,
                           PersonalInfo.middle_name,
                           PersonalInfo.lastname,
                           func.sum(Transactions.total_amount).label("total_amount"),
                           Transactions.transaction_reference, )
                    .select_from(Users)
                    .join(PersonalInfo, Users.id == PersonalInfo.user_id)
                    .outerjoin(Orders, Users.id == Orders.user_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(Orders.order_status.in_([OrderStatusSchema.Delivered,
                                                    OrderStatusSchema.Received]))
                    .group_by(Transactions.transaction_reference,
                              Users.id,
                              PersonalInfo.firstname,
                              PersonalInfo.middle_name,
                              PersonalInfo.lastname)
                    .offset(offset)
                    .limit(limit))
            result = await self.__db.execute(stmt)
            data = result.mappings().fetchall()
            return data
        except Exception as e:
            raise e
    
    async def get_total_paginated_user_sales(self):
        try:
            stmt = (
                    select(func.count(func.distinct(Transactions.transaction_reference)))
                    .select_from(Users)
                    .join(PersonalInfo, Users.id == PersonalInfo.user_id)
                    .outerjoin(Orders, Users.id == Orders.user_id)
                    .outerjoin(Transactions, Orders.id == Transactions.order_id)
                    .where(Orders.order_status.in_([
                            OrderStatusSchema.Delivered,
                            OrderStatusSchema.Received,
                            ]))
            )
            
            # Use scalar() because it returns a single integer, not a row/tuple
            result = await self.__db.execute(stmt)
            data = result.scalar() or 0
            
            # If there are no records, scalar() might return None, so default to 0
            return data
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
    
    async def get_user_ids(self):
        try:
            stmt = select(Users.id).where(and_(Users.is_active == True,
                                               Users.role == RoleSchema.CUSTOMER,
                                               Users.is_deleted == False))
            result = await self.__db.execute(stmt)
            data = result.scalars().fetchall()
            return data
        except Exception as e:
            raise e
    
    async def update_default_address(self, address_id: str, user_id: str):
        try:
            # first update all default to false
            stmt = update(Address).where(
                    Address.user_id == user_id).values(is_selected=False)
            # then update the specific address
            
            stmt1 = update(Address).where(and_(Address.id == address_id,
                                               Address.user_id == user_id)).values(is_selected=True)
            
            # execute stmt1  first
            await self.__db.execute(stmt)
            # execute specific address
            await self.__db.execute(stmt1)
        
        except Exception as e:
            raise e
    
    async def delete_user_address(self, user_id, address_id):
        try:
            stmt = delete(Address).where(and_(Address.user_id == user_id,
                                              Address.id == address_id))
            
            await self.__db.execute(stmt)
        except Exception as e:
            raise e
