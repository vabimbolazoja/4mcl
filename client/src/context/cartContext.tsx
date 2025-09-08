// cartContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem } from '../types/cart';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT_ITEM'; payload: string }
  | { type: 'DECREMENT_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] };

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

    case 'SET_CART':
      return { items: action.payload };

    default:
      return state;
  }
};

// 🔑 Utility function (can be imported anywhere)
export const clearCartStorage = () => {
  localStorage.removeItem('cart');
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      dispatch({ type: 'SET_CART', payload: JSON.parse(storedCart) });
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const incrementItem = (id: string) => dispatch({ type: 'INCREMENT_ITEM', payload: id });
  const decrementItem = (id: string) => dispatch({ type: 'DECREMENT_ITEM', payload: id });
  const clearCart = () => {
    clearCartStorage(); // clears localStorage
    dispatch({ type: 'CLEAR_CART' }); // clears state
  };

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, incrementItem, decrementItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
