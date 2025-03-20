import { useStore } from "zustand";
import { ProductState } from "@/types";
import { productStore } from "@/store/productStore";

export const useProductStore = <T>(selector: (state: ProductState) => T): T => {
  return useStore(productStore, selector);
};
