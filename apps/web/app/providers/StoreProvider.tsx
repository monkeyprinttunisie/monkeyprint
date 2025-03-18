"use client";

import { CategoryStoreProvider } from "@/providers/CategoryStoreProvider";
import { ProductStoreProvider } from "@/providers/ProductStoreProvider";
import { CartStoreProvider } from "@/providers/CartStoreProvider";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <CategoryStoreProvider>
      <ProductStoreProvider>
        <CartStoreProvider>{children}</CartStoreProvider>
      </ProductStoreProvider>
    </CategoryStoreProvider>
  );
}
