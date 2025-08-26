export interface CartItem {
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
}
