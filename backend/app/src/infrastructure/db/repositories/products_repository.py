from sqlalchemy import delete, distinct, func, select, update
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.src.domain.dto.products_dto import (ListOfProductInformationDTO, ProductDetailsDTO, ProductInformationDTO,
                                             ProductsDataDTO, )
from app.src.domain.interfaces.user_interface import UserInterface
from app.src.infrastructure.db.entity import Inventory, ProductDetails, ProductRatings, Products
from app.src.schema.products_schema import ProductCategories, ProductsFullInformationRequestSchema, ProductsTags


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
        products_details.product_id = products.id
        
        # insert into inventory
        inventory = Inventory(**request.model_dump())
        inventory.product_id = products.id
        # insert into _db, but not commited for the meantime
        self._db.add_all([inventory, products_details])
        
        # return the Products DTO
        return ProductsDataDTO.model_validate(products, from_attributes=True)
    
    async def get_product_categories(self):
        try:
            # select only the distinc category or unique.
            stmt = select(distinct(Products.category).label("category"))
            result = await self._db.execute(stmt)
            data = result.scalars().fetchall()
            return data
        except Exception as e:
            raise e
    
    async def find_record(self, record_id: str) -> ProductInformationDTO:
        """
        To retrieved full information of products.
        :param record_id: Unique from products.
        :return: Product record or None
        """
        
        stmt = select(Products, Inventory.quantity,
                      Inventory.low_stock_threshold,
                      Inventory.reserved_stock,
                      Inventory.cancelled_stock,
                      Inventory.sold_stock,
                      ProductDetails.images, ProductDetails.description
                      ).select_from(Products).outerjoin(ProductDetails, Products.id == ProductDetails.product_id
                                                        ).outerjoin(Inventory, Products.id == Inventory.product_id
                                                                    ).where(Products.id == record_id)
        
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        
        return ProductInformationDTO.model_validate(data[0], from_attributes=True) if data else None
    
    async def find_products_with_product_ids(self, product_ids: list):
        try:
            stmt = select(
                    Products,
                    Inventory.id.label("inventory_label"),
                    Inventory.quantity,
                    Inventory.low_stock_threshold,
                    Inventory.reserved_stock,
                    Inventory.cancelled_stock,
                    Inventory.sold_stock,
                    ).select_from(Products).outerjoin(Inventory, Products.id == Inventory.product_id
                                                      ).where(Products.id.in_(product_ids))
            
            result = await self._db.execute(stmt)
            data = result.mappings().fetchall()
            data = {"products": data}
            return ListOfProductInformationDTO(**data) if data else data
        except Exception as e:
            raise e
    
    async def get_paginated_record(self, offset: int, limit: int):
        """
        To get the paginated data.
        :param offset: Where the data retrieval start.
        :param limit: How many data will retrieve.
        :return: Paginated data or None.
        """
        ratings_subq = (
                select(
                        ProductRatings.product_id,
                        func.avg(ProductRatings.rates).label("avg_rating"),
                        func.count(ProductRatings.rates).label("review_count")
                        )
                .group_by(ProductRatings.product_id)
                .subquery()
        )
        stmt = (select(Products,
                       Inventory.quantity,
                       ratings_subq.c.avg_rating,
                       ProductDetails.description,
                       ProductDetails.images)
                .outerjoin(ProductDetails, Products.id == ProductDetails.product_id)
                .outerjoin(Inventory, Products.id == Inventory.product_id)
                .outerjoin(ratings_subq, Products.id == ratings_subq.c.product_id)
                .offset(offset).limit(limit))
        
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        return data or None
    
    async def get_paginated_record_with_category(self, category, offset: int, limit: int):
        """
        To get the paginated data.
        :param offset: Where the data retrieval start.
        :param limit: How many data will retrieve.
        :param category: category of the product and it will use for filtering.
        :return: Paginated data or None.
        """
        ratings_subq = (
                select(
                        ProductRatings.product_id,
                        func.avg(ProductRatings.rates).label("avg_rating"),
                        func.count(ProductRatings.rates).label("review_count")
                        )
                .group_by(ProductRatings.product_id)
                .subquery())
        stmt = (select(Products,
                       Inventory.quantity,
                       ratings_subq.c.avg_rating,
                       ratings_subq.c.review_count,
                       ProductDetails.description,
                       ProductDetails.images)
                .outerjoin(ProductDetails, Products.id == ProductDetails.product_id)
                .outerjoin(Inventory, Products.id == Inventory.product_id)
                .outerjoin(ratings_subq, Products.id == ratings_subq.c.product_id)
                .offset(offset).limit(limit))
        
        if category.lower() in [ProductCategories.PASTRY.lower(), ProductCategories.DRINKS.lower()]:
            stmt = stmt.where(Products.category == category).offset(offset).limit(limit)
        
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        return data
    
    async def get_paginated_record_with_category_total_records(self, category):
        try:
            stmt = select(func.count(Products.id))
            if category.lower() in [ProductCategories.PASTRY.lower(), ProductCategories.DRINKS.lower()]:
                stmt = stmt.where(Products.category == category)
            result = await self._db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
    async def get_paginated_record_with_best_seller_tag(self, offset: int, limit: int):
        """
        To get the paginated data.
            :param offset: Where the data retrieval start.
            :param tag: to filter data based on tags.
            :param limit: How many data will retrieve.
            :return: Paginated data or None.
            """
        ratings_subq = (
                select(
                        ProductRatings.product_id,
                        func.avg(ProductRatings.rates).label("avg_rating"),
                        )
                .group_by(ProductRatings.product_id)
                .subquery()
        )
        
        stmt = (select(Products,
                       Inventory.quantity,
                       ProductDetails.description,
                       ratings_subq.c.avg_rating,
                       ProductDetails.images
                       ).outerjoin(ProductDetails, Products.id == ProductDetails.product_id)
                .outerjoin(ratings_subq, Products.id == ratings_subq.c.product_id)
                .outerjoin(Inventory, Products.id == Inventory.product_id)
                .where(Products.tags.any(ProductsTags.BEST_SELLER))
                .offset(offset)
                .limit(limit))
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        
        return data or None
    
    async def get_paginated_record_with_best_seller_tag_total_records(self):
        try:
            stmt = select(func.count(Products.id).where(Products.tags.any(ProductsTags.BEST_SELLER)))
            result = await self._db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
    async def get_paginated_record_with_new_products_tag(self, offset: int, limit: int):
        """
           To get the paginated data.
               :param offset: Where the data retrieval start.
               :param tag: to filter data based on tags.
               :param limit: How many data will retrieve.
               :return: Paginated data or None.
               """
        ratings_subq = (
                select(
                        ProductRatings.product_id,
                        func.avg(ProductRatings.rates).label("avg_rating"),
                        )
                .group_by(ProductRatings.product_id)
                .subquery()
        )
        stmt = (select(Products,
                       Inventory.quantity,
                       ProductDetails.description,
                       ratings_subq.c.avg_rating,
                       ProductDetails.images
                       ).outerjoin(ProductDetails, Products.id == ProductDetails.product_id)
                .outerjoin(ratings_subq, Products.id == ratings_subq.c.product_id)
                .outerjoin(Inventory, Products.id == Inventory.product_id)
                .where(Products.tags.any(ProductsTags.NEW_PRODUCT))
                .offset(offset)
                .limit(limit))
        result = await self._db.execute(stmt)
        data = result.mappings().fetchall()
        return data or None
    
    async def get_paginated_record_with_new_products_tag_total_records(self):
        try:
            stmt = select(func.count(Products.id).where(Products.tags.any(ProductsTags.NEW_PRODUCT)))
            result = await self._db.execute(stmt)
            data = result.scalars().first()
            return data
        except Exception as e:
            raise e
    
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
    
    async def get_product_details_only(self, product_id: str) -> ProductDetailsDTO | None:
        try:
            stmt = select(ProductDetails).where(ProductDetails.product_id == product_id)
            result = await self._db.execute(stmt)
            data = result.scalar_one_or_none()
            
            return ProductDetailsDTO.model_validate(data)
        
        except Exception as e:
            raise e
    
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
    
    async def batch_update_product_inventory(self, data: list):
        try:
            stmt = update(Inventory)
            await self._db.execute(stmt, data)
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
