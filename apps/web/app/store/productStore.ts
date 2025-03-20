import { createStore } from "zustand/vanilla";
import { ProductState } from "@/types";
import {
  listProductsAction,
  deleteProductAction,
  getProductsByCategories,
} from "@/actions/productActions";

export const productStore = createStore<ProductState>()((set) => ({
  products: [],
  filteredProducts: [],
  loading: true,

  loadProducts: async () => {
    set({ loading: true });
    try {
      const result = await listProductsAction();
      if (result.success && result.products) {
        set({ products: result.products, filteredProducts: result.products });
      } else {
        console.error("Error loading products:", result.error);
        set({ products: [], filteredProducts: [] });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      set({ products: [], filteredProducts: [] });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    try {
      await deleteProductAction(productId);
      set((state) => ({
        products: state.products.filter((product) => product.id !== productId),
        filteredProducts: state.filteredProducts.filter(
          (product) => product.id !== productId
        ),
      }));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  },

  filterByCategories: async (categoryIds) => {
    set({ loading: true });
    try {
      if (!categoryIds.length || categoryIds.includes("all")) {
        set((state) => ({ filteredProducts: state.products }));
      } else {
        const result = await getProductsByCategories(categoryIds);
        if (result.success && result.products) {
          set({ filteredProducts: result.products });
        } else {
          set({ filteredProducts: [] });
        }
      }
    } catch (error) {
      console.error("Error filtering products:", error);
      set({ filteredProducts: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
