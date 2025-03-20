"use client";
import { useRef, useEffect } from "react";
/* import { useStore } from "zustand";
 */import { productStore } from "@/store/productStore";

export function ProductStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialized = useRef(false);
/*   useStore(productStore, () => ({}));
 */  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      productStore.getState().loadProducts();
    }
  }, []);

  return <>{children}</>;
}
