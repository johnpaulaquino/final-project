from datetime import datetime
from enum import Enum
from typing import Any, Optional, Self

from fastapi import Body
from pydantic import BaseModel, Field, field_validator, model_validator


class OrderPaymentMethodSchema(str, Enum):
    COD = "COD"
    G_CASH = "G-CASH"
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"


class OrderStatusSchema(str, Enum):
    Pending = "Pending"  # Order placed by user
    Approved = "Approved"  # Admin or system approved order
    Shipped = "Shipped"  # Order is on the way
    Delivered = "Delivered"  # Rider delivered the order
    Received = "Received"  # Customer received the order
    Cancelled = "Cancelled"  # Cancelled by admin or user
    Returned = "Returned"  # Customer returned order


class OrderPaymentStatusSchema(str, Enum):
    Unpaid = "Unpaid"  # Payment not yet collected
    Paid = "Paid"  # Successfully paid
    Failed = "Failed"  # Payment failed
    Refunded = "Refunded"  # Refund issued


class CreateOrderSchema(BaseModel):
    user_id: str = Body(default=None)
    product_id: str = Body(...)
    quantity: int = Body(default=1)
    price: float = Body(default=0)
    payment_method: OrderPaymentMethodSchema = Body(default=OrderPaymentMethodSchema.COD)
    order_status: OrderStatusSchema = Body(default=OrderStatusSchema.Pending)
    
    @staticmethod
    def depends(
            quantity: int = Body(default=1, ge=1),
            product_id: str = Body(...),
            payment_method: OrderPaymentMethodSchema = Body(...)):
        return CreateOrderSchema(quantity=quantity,
                                 payment_method=payment_method,
                                 product_id=product_id)


class ConfirmOrderSchema(BaseModel):
    user_id: str = Body(...)


class ShippedOrderSchemaSchema(ConfirmOrderSchema):
    pass


class UpdateOrdersSchema(BaseModel):
    product_id: str | None = None
    quantity: int | None = None
    price: float | None = None
    order_status: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
