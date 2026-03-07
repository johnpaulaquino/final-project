from typing import Optional

from fastapi import Body
from pydantic import BaseModel


class CreateTransactionSchema(BaseModel):
    order_id: int = None
    transaction_reference: str
    payment_provider_reference: Optional[str] = None
    
    @staticmethod
    def depends(reference_number: str = Body(), payment_provider_reference: str = Body()):
        return CreateTransactionSchema(transaction_reference=reference_number,
                                       payment_provider_reference=payment_provider_reference)
