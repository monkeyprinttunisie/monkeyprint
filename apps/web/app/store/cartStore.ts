import { createStore } from "zustand/vanilla";
import { CartItem, CartState } from "@/types";
import {
  fetchCart,
  addToCartAction,
  updateCartItemQuantityAction,
  removeFromCartAction,
  clearCartAction,
} from "@/actions/cartActions";

export const cartStore = createStore<CartState>()((set) => ({
  cart: [],
  addToCart : async (product) => {
    try{
      const updatedCart = await addToCartAction(product);
      set({ cart: updatedCart });
    } catch(error){
      console.error("Error updating cart quantity", error);
    }
  },
  
  updateCartItemQuantity: async (productId, quantity) => {
    try {
      const updatedCart = await updateCartItemQuantityAction(productId, quantity);
      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error updating cart quantity", error);
    }
  }, 

  removeFromCart: async (productId) => {
    try {
      const updatedCart = await removeFromCartAction(productId);
      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error removing item from cart", error);
    }
  },

  clearCart: async () => {
    try {
      await clearCartAction();
      set({ cart: [] });
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  }
}));
