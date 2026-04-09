from typing import List, Optional

from alembic.util import status
from fastapi import APIRouter, Body, Depends, File, Query, UploadFile
from starlette import status

from app.src.api.v1 import get_filenames_and_image_bytes
from app.src.application.services.products_services import ProductsServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_current_user, get_products_service
from app.src.domain.dto.auth_dto import DecodedTokenDTO
from app.src.schema import PaginatedSchema
from app.src.schema.products_schema import ProductsFullInformationRequestSchema, UpdateProductsInformationRequestSchema
from app.src.utils.successful_response import SuccessfulResponse

# prefix endpoint
__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/products"
v1_products_router = APIRouter(tags=[EndpointTags.PRODUCTS], prefix=__base_endpoint, )


@v1_products_router.post(f"{ConstantsData.API_V1_ENDPOINT}/insert", tags=[EndpointTags.ADMIN], )
async def insert_product(
        products_schema: ProductsFullInformationRequestSchema = Depends(
                ProductsFullInformationRequestSchema.depends_schema),
        current_user: DecodedTokenDTO = Depends(get_current_user),
        
        product_services: ProductsServices = Depends(get_products_service),
        images: Optional[List[UploadFile]] = File(None)):
    try:
        
        filenames, images_bytes = await get_filenames_and_image_bytes(images)
        
        product_services_result = await product_services.insert_products(product_request=products_schema,
                                                                         filenames=filenames,
                                                                         current_user=current_user,
                                                                         img_bytes=images_bytes)
        
        product_services_result.status_code = status.HTTP_201_CREATED
        response = SuccessfulResponse(product_services_result)
        
        return response
    
    except Exception as e:
        raise e


@v1_products_router.get('/categories', tags=[EndpointTags.CUSTOMER])
async def get_product_categories(product_services: ProductsServices = Depends(
        get_products_service)):
    try:
        
        product_response = await product_services.get_product_categories()
        product_response.status_code = 200
        response = SuccessfulResponse(product_response)
        
        return response
    except Exception as e:
        raise e


@v1_products_router.get("/with")
async def get_products_by_categories(category: str = Query(), paginated: PaginatedSchema = Depends(),
                                     product_services
                                     : ProductsServices = Depends(
                                             get_products_service)):
    
    try:
        product_response = await product_services.get_products_by_categories(category, paginated)
        product_response.status_code = 200
        response = SuccessfulResponse(product_response)
        
        return response
    except Exception as e:
        raise e


@v1_products_router.get("/tags", tags=[EndpointTags.CUSTOMER])
async def get_product_information_paginated_with_tags(paginated: PaginatedSchema = Depends(),
                                                      product_services: ProductsServices = Depends(
                                                              get_products_service)):
    try:
        
        response_dto = await product_services.get_product_information_paginated_with_tags(paginated)
        
        response_dto.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(response_dto)
        return response
    
    except Exception as e:
        raise e


@v1_products_router.get("/", tags=[EndpointTags.CUSTOMER])
async def get_product_information_paginated(paginated: PaginatedSchema = Query(),
                                            product_services: ProductsServices = Depends(get_products_service),
                                            ):
    try:
        
        response_dto = await product_services.get_product_information_paginated(paginated)
        response_dto.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(response_dto)
        
        return response
    except Exception as e:
        raise e


# will insert safe route here.
@v1_products_router.patch("/full/{product_id}", tags=[EndpointTags.ADMIN])
async def update_product_information(product_id: str,
                                     new_data: UpdateProductsInformationRequestSchema = Depends(
                                             UpdateProductsInformationRequestSchema.update_depends_schema),
                                     images: List[UploadFile] = File(None),
                                     current_user: DecodedTokenDTO = Depends(get_current_user),
                                     product_services: ProductsServices = Depends(get_products_service),
                                     ):
    
    try:
        
        filenames, images_bytes = await get_filenames_and_image_bytes(images)
        response_schema = await product_services.update_product_information(product_id,
                                                                            new_data,
                                                                            filenames,
                                                                            current_user,
                                                                            images_bytes)
        
        response_schema.status_code = status.HTTP_200_OK
        response = SuccessfulResponse(response_schema)
        
        return response
    except Exception as e:
        raise e


# will insert safe route here.
@v1_products_router.patch("/information/{product_id}", tags=[EndpointTags.ADMIN])
async def update_product_information(product_id: str,
                                     new_data: UpdateProductsInformationRequestSchema = Depends(
                                             UpdateProductsInformationRequestSchema.update_depends_schema_no_public_id),
                                     current_user: DecodedTokenDTO = Depends(get_current_user),
                                     product_services: ProductsServices = Depends(get_products_service),
                                     ):
    
    try:
        
        response_schema = await product_services.update_product_information_no_images(product_id,
                                                                                      new_data,
                                                                                      current_user, )
        
        response_schema.status_code = status.HTTP_200_OK
        response = SuccessfulResponse(response_schema)
        
        return response
    except Exception as e:
        raise e


# will insert safe route here.
@v1_products_router.patch("/images/{product_id}", tags=[EndpointTags.ADMIN])
async def update_product_images_only(product_id: str,
                                     public_ids: Optional[list[str]] = Body(None),
                                     images: List[UploadFile] = File(None),
                                     current_user: DecodedTokenDTO = Depends(get_current_user),
                                     product_services: ProductsServices = Depends(get_products_service),
                                     ):
    
    try:
        """
        """
        filenames, images_bytes = await get_filenames_and_image_bytes(images)
        response_schema = await product_services.update_product_images(product_id,
                                                                       public_ids,
                                                                       filenames,
                                                                       current_user,
                                                                       images_bytes)
        
        response_schema.status_code = status.HTTP_200_OK
        response = SuccessfulResponse(response_schema)
        
        return response
    except Exception as e:
        raise e


@v1_products_router.get("/{product_id}", tags=[EndpointTags.CUSTOMER])
async def get_product_information(product_id: str,
                                  product_services: ProductsServices = Depends(get_products_service)):
    try:
        
        response_dto = await product_services.get_product_information(product_id)
        response_dto.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(response_dto)
        
        return response
    except Exception as e:
        raise e


# will inject the safe route here
@v1_products_router.delete("/{product_id}", tags=[EndpointTags.ADMIN])
async def delete_product(product_id: str,
                         product_services: ProductsServices = Depends(get_products_service),
                         current_user: DecodedTokenDTO = Depends(get_current_user),
                         ):
    try:
        
        services_response = await product_services.delete_product_information(product_id, current_user)
        services_response.status_code = status.HTTP_200_OK
        
        # set the response for
        response = SuccessfulResponse(services_response)
        
        # return the http response
        return response
    except Exception as e:
        raise e
