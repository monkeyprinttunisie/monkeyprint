"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/types";
import {
  fetchCart,
  addToCartAction,
  updateCartItemQuantityAction,
  removeFromCartAction,
  clearCartAction,
} from "@/actions/cartActions";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  updateCartItemQuantity: (
    productId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      const cartData = await fetchCart();
      setCart(cartData);
    };
    loadCart();
  }, []);

  const addToCart = async (product: CartItem) => {
    const updatedCart = await addToCartAction(product);
    setCart(updatedCart);
  };

  const updateCartItemQuantity = async (
    productId: string,
    quantity: number
  ) => {
    const updatedCart = await updateCartItemQuantityAction(productId, quantity);
    setCart(updatedCart);
  };

  const removeFromCart = async (productId: string) => {
    const updatedCart = await removeFromCartAction(productId);
    setCart(updatedCart);
  };

  const clearCart = async () => {
    await clearCartAction();
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
