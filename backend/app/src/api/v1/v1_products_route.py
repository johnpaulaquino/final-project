from typing import List, Optional

from alembic.util import status
from fastapi import APIRouter, Depends, File, Query, UploadFile
from starlette import status

from app.src.application.services.products_services import ProductsServices
from app.src.core.constants import ConstantsData, EndpointTags
from app.src.core.dependencies import get_uow
from app.src.infrastructure.cloudinary_infrastructure import CloudinaryInfrastructure
from app.src.infrastructure.db.uow import SQLUnitOfWork
from app.src.schema import PaginatedSchema
from app.src.schema.products_schema import ProductsFullInformationRequestSchema, UpdateProductsInformationRequestSchema
from app.src.utils.successful_response import SuccessfulResponse

# prefix endpoint
__base_endpoint = f"{ConstantsData.API_V1_ENDPOINT}/products"
v1_products_router = APIRouter(tags=[EndpointTags.PRODUCTS], prefix=__base_endpoint, )

__sub_folder_cloudinary = 'products'


@v1_products_router.post(f"{ConstantsData.API_V1_ENDPOINT}/insert", tags=[EndpointTags.ADMIN], )
async def insert_product(
        products_schema: ProductsFullInformationRequestSchema = Depends(
                ProductsFullInformationRequestSchema.depends_schema),
        uow: SQLUnitOfWork = Depends(get_uow),
        images: Optional[List[UploadFile]] = File(None)):
    try:
        cloudinary_infrastructure = CloudinaryInfrastructure(sub_folder_name=__sub_folder_cloudinary)
        product_services = ProductsServices(uow, cloudinary_infrastructure=cloudinary_infrastructure)
        
        filenames, images_bytes = await __get_filenames_and_image_bytes(images)
        
        product_services_result = await product_services.insert_products(product_request=products_schema,
                                                                         filenames=filenames,
                                                                         img_bytes=images_bytes)
        
        product_services_result.status_code = status.HTTP_201_CREATED
        response = SuccessfulResponse(product_services_result)
        
        return response
    
    except Exception as e:
        raise e


@v1_products_router.get("/{product_id}", tags=[EndpointTags.CUSTOMER])
async def get_product_information(product_id: str, uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        product_services = ProductsServices(uow)
        
        response_dto = await product_services.get_product_information(product_id)
        response_dto.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(response_dto)
        
        return response
    except Exception as e:
        raise e


@v1_products_router.get("/", tags=[EndpointTags.CUSTOMER])
async def get_product_information_paginated(paginated: PaginatedSchema = Query(),
                                            uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        product_services = ProductsServices(uow)
        
        response_dto = await product_services.get_product_information_paginated(paginated)
        response_dto.status_code = status.HTTP_200_OK
        
        response = SuccessfulResponse(response_dto)
        
        return response
    except Exception as e:
        raise e


# will insert safe route here.
@v1_products_router.put("/{product_id}", tags=[EndpointTags.ADMIN])
async def update_product_information(product_id: str,
                                     new_data: UpdateProductsInformationRequestSchema = Depends(
                                             UpdateProductsInformationRequestSchema.update_depends_schema),
                                     images: List[UploadFile] = File(None),
                                     uow: SQLUnitOfWork = Depends(get_uow),
                                     
                                     ):
    
    try:
        cloudinary_infrastructure = CloudinaryInfrastructure(sub_folder_name=__sub_folder_cloudinary)
        product_services = ProductsServices(uow, cloudinary_infrastructure=cloudinary_infrastructure)
        filenames, images_bytes = await __get_filenames_and_image_bytes(images)
        response_schema = await product_services.update_product_information(product_id,
                                                                            new_data,
                                                                            filenames,
                                                                            images_bytes)
        
        response_schema.status_code = status.HTTP_200_OK
        response = SuccessfulResponse(response_schema)
        
        return response
    except Exception as e:
        raise e


# will inject the safe route here
@v1_products_router.delete("/{product_id}", tags=[EndpointTags.ADMIN])
async def delete_product(product_id: str, uow: SQLUnitOfWork = Depends(get_uow)):
    try:
        cloudinary_infrastructure = CloudinaryInfrastructure(sub_folder_name=__sub_folder_cloudinary)
        product_services = ProductsServices(uow, cloudinary_infrastructure=cloudinary_infrastructure)
        
        services_response = await product_services.delete_product_information(product_id)
        services_response.status_code = status.HTTP_200_OK
        
        # set the response for
        response = SuccessfulResponse(services_response)
        
        # return the http response
        return response
    except Exception as e:
        raise e


async def __get_filenames_and_image_bytes(images: Optional[List[UploadFile]] = File(None)):
    filenames = []
    images_bytes = []
    
    # check if not null
    if images:
        for image in images:
            if image:
                filename = image.filename
                image_byte = await image.read()
                filenames.append(filename)
                images_bytes.append(image_byte)
    
    return filenames, images_bytes
