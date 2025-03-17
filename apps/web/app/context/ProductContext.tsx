"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Product } from "@/types";
import {
  listProductsAction,
  deleteProductAction,
  getProductsByCategories,
} from "@/actions/productActions";

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  deleteProduct: (productId: string) => Promise<void>;
  filterByCategories: (categoryIds: string[]) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsList = await listProductsAction();
      if (Array.isArray(productsList)) {
        setProducts(productsList);
        setFilteredProducts(productsList);
      } else {
        console.error("Product list is not an array:", productsList);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (productId: string) => {
    try {
      await deleteProductAction(productId);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
      setFilteredProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const filterByCategories = useCallback(
    async (categoryIds: string[]) => {
      try {
        setLoading(true);

        if (!categoryIds.length || categoryIds.includes("all")) {
          setFilteredProducts(products);
        } else {
          const result = await getProductsByCategories(categoryIds);
          if (result.success && Array.isArray(result.products)) {
            setFilteredProducts(result.products);
          } else {
            console.error("Error or invalid products returned:", result);
            setFilteredProducts([]);
          }
        }
      } catch (error) {
        console.error("Error filtering products:", error);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [products]
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        loading,
        deleteProduct,
        filterByCategories,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
