
//no need to use this because its for the test
export type OrderStatus = 'Action Needed' | 'Pending' | 'Approved' | 'Shipped' | 'Delivered';

export interface Order {
  id: number;
  string_id: string;
  user_id: number;
  client_name: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  order_status: OrderStatus;
  address_id: number;
  created_at: string;
  updated_at?: string;
}

export const initialOrders: Order[] = [
  {
    id: 1,
    string_id: '#ORD-001',
    user_id: 101,
    client_name: 'Alice Johnson',
    product_id: 501,
    product_name: 'Classic Butter Biskota',
    quantity: 5,
    price: 74.95,
    order_status: 'Delivered',
    address_id: 901,
    created_at: '2026-04-20T10:30:00Z',
  },
  {
    id: 2,
    string_id: '#ORD-002',
    user_id: 102,
    client_name: 'Bob Smith',
    product_id: 502,
    product_name: 'Double Chocolate Chunk',
    quantity: 1,
    price: 16.00,
    order_status: 'Pending',
    address_id: 902,
    created_at: '2026-04-21T08:15:00Z',
  },
  {
    id: 3,
    string_id: '#ORD-003',
    user_id: 103,
    client_name: 'Charlie Davis',
    product_id: 503,
    product_name: 'Keto Nutty Crunch',
    quantity: 2,
    price: 49.98,
    order_status: 'Approved',
    address_id: 903,
    created_at: '2026-04-21T09:45:00Z',
  },
  {
    id: 4,
    string_id: '#ORD-004',
    user_id: 104,
    client_name: 'Diana Prince',
    product_id: 504,
    product_name: 'Matcha White Chocolate',
    quantity: 3,
    price: 35.50,
    order_status: 'Action Needed',
    address_id: 904,
    created_at: '2026-04-21T14:20:00Z',
  },
];