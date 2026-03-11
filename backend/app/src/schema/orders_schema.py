from enum import Enum

from fastapi import Body
from pydantic import BaseModel


class OrderPaymentMethod(str, Enum):
    COD = "COD"
    G_CASH = "G-CASH"
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"


class OrderStatus(str, Enum):
    Pending = "Pending"  # Order placed by user
    Approved = "Approved"  # Admin or system approved order
    Shipped = "Shipped"  # Order is on the way
    Delivered = "Delivered"  # Rider delivered the order
    Received = "Received"  # Customer received the order
    Cancelled = "Cancelled"  # Cancelled by admin or user
    Returned = "Returned"  # Customer returned order


class OrderPaymentStatus(str, Enum):
    Unpaid = "Unpaid"  # Payment not yet collected
    Paid = "Paid"  # Successfully paid
    Failed = "Failed"  # Payment failed
    Refunded = "Refunded"  # Refund issued


class CreateOrder(BaseModel):
    user_id: str = None
    product_id: str
    quantity: int = 1
    price: float = 0
    payment_method: OrderPaymentMethod = OrderPaymentMethod.COD
    order_status: OrderStatus = OrderStatus.Pending
    
    @staticmethod
    def depends(
            quantity: int = Body(default=1, ge=1),
            product_id: str = Body(...),
            payment_method: OrderPaymentMethod = Body(...)):
        return CreateOrder(quantity=quantity,
                           payment_method=payment_method,
                           product_id=product_id)


class ConfirmOrderSchema(BaseModel):
    order_id: int
    user_id: str
    product_id: str


class CancelOrderSchema(ConfirmOrderSchema):
    pass


class ShippedOrderSchema(ConfirmOrderSchema):
    pass
