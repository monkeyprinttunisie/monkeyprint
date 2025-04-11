import { useStore } from "zustand";
import { CartState } from "@/types";
import { cartStore } from "@/store/cartStore";

// creatin a hook to use in components
export const useCartStore = <T>(selector: (state: CartState) => T): T => {
  return useStore(cartStore, selector);
};
