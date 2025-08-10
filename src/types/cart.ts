// types/cart.ts

export interface CartItem {
    id: string; // or number depending on your product
    name: string;
    price: number;
    quantity: number;
    [key: string]: any; // for additional product data
  }
  