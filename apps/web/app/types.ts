export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  stock: number | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
}
