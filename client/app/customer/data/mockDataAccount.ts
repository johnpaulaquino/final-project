export type AccountTab = 'Profile Info' | 'Address Book' | 'Security' | 'Order History' | 'Payment Methods';

export interface Order {
  id: string;
  status: 'PREPARING' | 'DELIVERED' | 'CANCELLED';
  title: string;
  itemsCount: number;
  date?: string;
  time?: string;
  estimatedDelivery?: string;
  total: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  isDefault: boolean;
}

export interface PaymentCard {
  id: string;
  last4: string;
  expiry: string;
  name: string;
  isDefault: boolean;
}


export const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    street: '123 Baker Street, Apt 4B',
    city: 'Metro City, 10001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    street: '456 Corporate Blvd, Suite 200',
    city: 'Business District, 10002',
    isDefault: false,
  }
];
