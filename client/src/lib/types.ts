export interface CartState {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
}

export interface CartItemWithProduct {
  id: number;
  sessionId: string;
  userId?: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    priceUsd: string;
    priceNgn: string;
    imageUrl?: string;
  };
}

export interface Currency {
  code: 'USD' | 'NGN';
  symbol: string;
}

export const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$' },
  NGN: { code: 'NGN', symbol: '₦' }
};
