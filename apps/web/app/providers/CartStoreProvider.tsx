"use client";

import { useRef, useEffect } from "react";
/* import { useStore } from "zustand";
 */import { cartStore } from "@/store/cartStore";
import { fetchCart } from "@/actions/cartActions";

export function CartStoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
/*   useStore(cartStore, () => ({}));
 */
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchCart().then((cartData) => {
        cartStore.setState({ cart: cartData });
      });
    }
  }, []);

  return <>{children}</>;
}
