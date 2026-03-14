from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.src.domain.dto.products_dto import ProductInformationDTO, ProductsDataDTO
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Inventory, ProductDetails, Products
from app.src.schema.products_schema import ProductsFullInformationRequestSchema


class ProductsRepository(UserInterface):
    
    def __init__(self, _db: AsyncSession):
        self._db = _db
    
    async def insert_record(self, request: ProductsFullInformationRequestSchema) -> ProductsDataDTO:
        """
        To insert products into database.
        :param request:
        :return: products to access the id.
        """
        # initialize model entity
        products = Products(**request.model_dump())
        # insert into _db, but not commited for the meantime
        self._db.add(products)
        await self._db.flush()

        # insert into product details
        products_details = ProductDetails(**request.model_dump())
        
        # insert into inventory
        inventory = Inventory(**request.model_dump())
        # insert into _db, but not commited for the meantime
        self._db.add_all([inventory, products_details])
        
        # return the Products DTO
        return ProductsDataDTO.model_validate(products, from_attributes=True)
    
    async def find_record(self, record_id: str) -> ProductInformationDTO:
        """
        To retrieved full information of products.
        :param record_id: Unique from products.
        :return: Product record or None
        """
        stmt = select(Products, Inventory.quantity, Inventory.low_stock_threshold,
                      Inventory.reserved_stock, Inventory.cancelled_stock, Inventory.sold_stock,
                      ProductDetails.images, ProductDetails.description
                      ).select_from(Products).outerjoin(ProductDetails, Products.id == ProductDetails.product_id
                                                        ).outerjoin(Inventory, Products.id == Inventory.product_id
                                                                    ).where(Products.id == record_id)
        
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        
        return ProductInformationDTO.model_validate(data[0], from_attributes=True) if data else None
    
    async def get_paginated_record(self, offset: int, limit: int):
        """
        To get the paginated data.
        :param offset: Where the data retrieval start.
        :param limit: How many data will retrieve.
        :return: Paginated data or None.
        """
        stmt = select(Products,
                      Inventory.quantity, Inventory.low_stock_threshold,
                      ProductDetails.description, ProductDetails.images
                      ).select_from(Products).outerjoin(ProductDetails, Products.id == ProductDetails.product_id
                                                        ).outerjoin(Inventory, Products.id == Inventory.product_id
                                                                    ).offset(offset).limit(limit)
        
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        return data or None
    
    async def get_total_records(self):
        try:
            stmt = select(func.count(Products.id))
            result = await self._db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
    async def get_product_only(self, product_id: str) -> ProductsDataDTO:
        """
        To retrieve product only for fast retrieval.
        :param product_id: Unique for product.
        :return: the actual product data.
        """
        stmt = select(Products).where(Products.id == product_id)
        result = await self._db.execute(stmt)
        data = result.scalar_one_or_none()
        
        return data
    
    # product, product details and inventory update
    async def update_record(self, record_id: str, data: dict | None = None):
        """
        To update the products only.
        :param record_id: Unique from products.
        :param data: This is the actual data to be update in database. This is a dict and will map the actual column name.
        :return:
        """
        
        stmt = update(Products).where(Products.id == record_id).values(**data)
        await self._db.execute(stmt)
    
    async def update_product_details(self, product_id: str, data: dict):
        stmt = update(ProductDetails).where(ProductDetails.product_id == product_id).values(**data)
        await self._db.execute(stmt)
    
    async def update_product_inventory(self, product_id: str, data: dict):
        try:
            """
            Update the inventory table.
            :param product_id: unique from product id.
            :param data: A dict object to mapped columns and replace the new one data.
            :return: Nothing
            """
            stmt = update(Inventory).where(Inventory.product_id == product_id).values(**data)
            await self._db.execute(stmt)
        
        except Exception as e:
            raise e
    
    # delete product
    async def delete_record(self, record_id: str):
        """
        To delete the actual product in database.
        :param record_id: Unique from products.
        :return:
        """
        stmt = delete(Products).where(Products.id == record_id)
        await self._db.execute(stmt)
