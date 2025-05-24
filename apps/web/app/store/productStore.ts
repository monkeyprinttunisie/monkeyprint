import { createStore } from "zustand/vanilla";
import { ProductState } from "@/types";
import {
  listProductsAction,
  deleteProductAction,
  getProductsByCategories,
  getStoreProducts,
  getProductsByStoreAndCategories,
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

  loadStoreProducts: async (storeId: string) => {
    set({ loading: true });
    try {
      const result = await getStoreProducts(storeId);
      if (result.success && result.products) {
        set({ products: result.products, filteredProducts: result.products });
      } else {
        console.error("Error loading store products:", result.error);
        set({ products: [], filteredProducts: [] });
      }
    } catch (error) {
      console.error("Error loading store products:", error);
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

  filterByStoreAndCategories: async (
    storeId: string,
    categoryIds: string[]
  ) => {
    set({ loading: true });
    try {
      // If no categories selected (All) or "all" is included, get all store products
      if (!categoryIds.length || categoryIds.includes("all")) {
        const result = await getStoreProducts(storeId);
        if (result.success && result.products) {
          set({ filteredProducts: result.products });
        } else {
          set({ filteredProducts: [] });
        }
      } else {
        // Get filtered products by both store and categories
        const result = await getProductsByStoreAndCategories(
          storeId,
          categoryIds
        );
        if (result.success && result.products) {
          set({ filteredProducts: result.products });
        } else {
          set({ filteredProducts: [] });
        }
      }
    } catch (error) {
      console.error("Error filtering store products:", error);
      set({ filteredProducts: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
