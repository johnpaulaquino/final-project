from sqlmodel import SQLModel

from app.src.infrastructure.db.entity.address_entity import Address
from app.src.infrastructure.db.entity.inventory_entity import Inventory
from app.src.infrastructure.db.entity.orders_entity import Orders
from app.src.infrastructure.db.entity.personal_info_entity import PersonalInfo
from app.src.infrastructure.db.entity.product_details_entity import ProductDetails
from app.src.infrastructure.db.entity.products_entity import Products
from app.src.infrastructure.db.entity.session_token_entity import SessionToken
from app.src.infrastructure.db.entity.temp_users_entity import TempUsers
from app.src.infrastructure.db.entity.users_entity import Users

BaseEntityModel = SQLModel()

__all__ = ["Users",
           "Address",
           "PersonalInfo",
           "TempUsers",
           "Products",
           "ProductDetails",
           "Inventory",
           "Orders",
           "SessionToken"]
