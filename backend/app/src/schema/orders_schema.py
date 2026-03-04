from enum import Enum

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
    Delivered = "Delivered"  # Customer received the order
    Cancelled = "Cancelled"  # Cancelled by admin or user
    Returned = "Returned"  # Customer returned order


class OrderPaymentStatus(str, Enum):
    Unpaid = "Unpaid"  # Payment not yet collected
    Paid = "Paid"  # Successfully paid
    Failed = "Failed"  # Payment failed
    Refunded = "Refunded"  # Refund issued


class CreateOrder(BaseModel):
    user_id: str
    product_id: str
    quantity: int
    payment_method: OrderPaymentMethod = OrderPaymentMethod.COD
    total: float
    payment_status: OrderPaymentStatus = OrderPaymentStatus.Unpaid
    order_status: OrderStatus = OrderStatus.Pending
