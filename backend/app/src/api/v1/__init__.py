from typing import List, Optional

from fastapi import File, UploadFile


async def get_filenames_and_image_bytes(images: Optional[List[UploadFile]] = File(None)):
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
