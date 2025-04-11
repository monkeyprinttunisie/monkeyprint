"use client";
import { useRef, useEffect } from "react";
/* import { useStore } from "zustand";
 */import { categoryStore } from "@/store/categoryStore";

export function CategoryStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialized = useRef(false);
  /* useStore(categoryStore, () => ({})); */

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      categoryStore.getState().refreshCategories();
    }
  }, []);
  return <>{children}</>;
}
