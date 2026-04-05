export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Chocolate Roll Bites",
    price: "$4.80",
    image: "/logo.jpg",
    quantity: 1,
  }
];