import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext, useEffect } from "react";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Support from "@/pages/support";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Cart from "@/pages/cart";
import ProductDetail from "@/pages/product-detail";
import OrderHistory from "@/pages/order-history";
import NotFound from "@/pages/not-found";
import type { CartState } from "@/lib/types";
import Categories from "@/pages/categories"
import Products from "@/pages/products"
import VerifyMail from "@/pages/verify-email"
import ForgotPassword from "@/pages/forgot-password"
import ResetPassword from "@/pages/reset-password"
import ProductCategory from "@/pages/product-by-categories"
import GuestOrder from "@/pages/guest-order"
import 'animate.css';

// Cart Context
const CartContext = createContext<{
  cart: CartState;
  addToCart: (productId: number, quantity: number) => void;
  updateCartItem: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  sessionId: string;
} | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  // Generate a session ID for guest users
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('sessionId');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('sessionId', newId);
    return newId;
  });

  const addToCart = (productId: number, quantity: number) => {
    // This would typically make an API call
    // For now, we'll just update the cart count
    setCart(prev => ({
      ...prev,
      itemCount: prev.itemCount + quantity
    }));
  };

  const updateCartItem = (id: number, quantity: number) => {
    // API call to update cart item
    console.log('Update cart item:', id, quantity);
  };

  const removeFromCart = (id: number) => {
    // API call to remove cart item
    console.log('Remove from cart:', id);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, sessionId }}>
      {children}
    </CartContext.Provider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/products" component={Products} />
      <Route path="/contact" component={Contact} />
      <Route path="/categories" component={Categories} />
      <Route path="/verify-mail" component={VerifyMail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/products-category" component={ProductCategory} />

      
      <Route path="/support" component={Support} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/cart" component={Cart} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/orders" component={OrderHistory} />
      <Route path="/guest-order" component={GuestOrder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
