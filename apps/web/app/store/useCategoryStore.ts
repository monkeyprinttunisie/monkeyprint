import { useStore } from "zustand";
import { CategoryState } from "@/types";
import { categoryStore } from "@/store/categoryStore";

export const useCategoryStore = <T>(
  selector: (state: CategoryState) => T
): T => {
  return useStore(categoryStore, selector);
};
