"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types";
import { listProducts, deleteProductAction } from "@/actions/productActions";

interface ProductContextType {
  products: Product[];
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const productsList = await listProducts();
      setProducts(productsList);
    };
    loadProducts();
  }, []);

  const deleteProduct = async (productId: string) => {
    await deleteProductAction(productId);
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };

  return (
    <ProductContext.Provider value={{ products, deleteProduct }}>
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
