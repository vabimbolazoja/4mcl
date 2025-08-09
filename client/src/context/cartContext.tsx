// context/CartContext.tsx

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem } from '../types/cart';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT_ITEM'; payload: string }
  | { type: 'DECREMENT_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
}>({
  state: { items: [] },
  addItem: () => {},
  removeItem: () => {},
  incrementItem: () => {},
  decrementItem: () => {},
  clearCart: () => {},
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(item => item._id === action.payload._id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload?.quantity }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
      };

    case 'INCREMENT_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };

    case 'DECREMENT_ITEM':
      return {
        ...state,
        items: state.items
          .map(item =>
            item._id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0),
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const incrementItem = (id: string) => dispatch({ type: 'INCREMENT_ITEM', payload: id });
  const decrementItem = (id: string) => dispatch({ type: 'DECREMENT_ITEM', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, incrementItem, decrementItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
