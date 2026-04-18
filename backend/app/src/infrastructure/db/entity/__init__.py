from sqlmodel import SQLModel

from app.src.infrastructure.db.entity.products.carts_entity import Carts
from app.src.infrastructure.db.entity.products.categories_entity import Categories
from app.src.infrastructure.db.entity.products.inventory_entity import Inventory
from app.src.infrastructure.db.entity.products.orders_entity import Orders
from app.src.infrastructure.db.entity.products.product_details_entity import ProductDetails
from app.src.infrastructure.db.entity.products.product_ratings import ProductRatings
from app.src.infrastructure.db.entity.products.products_entity import Products
from app.src.infrastructure.db.entity.products.transactions_entity import Transactions
from app.src.infrastructure.db.entity.users.address_entity import Address
from app.src.infrastructure.db.entity.users.personal_info_entity import PersonalInfo
from app.src.infrastructure.db.entity.users.session_token_entity import SessionToken
from app.src.infrastructure.db.entity.users.temp_users_entity import TempUsers
from app.src.infrastructure.db.entity.users.users_entity import Users

BaseEntityModel = SQLModel()

__all__ = ["Users",
           "Address",
           "Carts",
           "PersonalInfo",
           "TempUsers",
           "Products",
           "ProductDetails",
           "Inventory",
           "Transactions",
           "Orders",
           "SessionToken",
           "Categories",
           "ProductRatings"]
