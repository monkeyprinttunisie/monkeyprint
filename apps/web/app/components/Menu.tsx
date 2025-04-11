// components/Menu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

export default function Menu() {
  /* const { cart } = useCart(); */
  const cart = useCartStore((state) => state.cart);
  const pathname = usePathname(); // Get the current route

  return (
    <div className="fixed bottom-0 left-0 h-[8vh] right-0 bg-white shadow-lg p-4 flex justify-around items-center">
      <Link href="/products/listProducts" className="text-gray-900">
        <img
          src={
            pathname === "/products/listProducts"
              ? "/icons/home-icon-selected.svg"
              : "/icons/home-icon.svg"
          }
          alt="Home icon"
          width="24"
          height="24"
        />
      </Link>

      <Link href="/wishlist" className="text-gray-900">
        <img
          src={
            pathname === "/wishlist"
              ? "/icons/wishlist-icon-selected.svg"
              : "/icons/wishlist-icon.svg"
          }
          alt="Wishlist icon"
          width="24"
          height="24"
        />
      </Link>

      <Link href="/categories" className="text-gray-800">
        <img
          src={
            pathname === "/categories"
              ? "/icons/categories-icon-selected.svg"
              : "/icons/categories-icon.svg"
          }
          alt="Categories icon"
          width="24"
          height="24"
        />
      </Link>

      <Link href="/cart" className="text-gray-900">
        <img
          src={
            pathname === "/cart"
              ? cart.length > 0
                ? "/icons/cart-icon-selected.svg"
                : "/icons/empty-cart-icon-selected.svg"
              : cart.length > 0
                ? "/icons/cart-icon.svg"
                : "/icons/empty-cart-icon.svg"
          }
          alt="Cart icon"
          width="24"
          height="24"
        />
      </Link>

      <Link href="/profile" className="text-gray-800">
        <img
          src={
            pathname === "/profile"
              ? "/icons/profile-icon-selected.svg"
              : "/icons/profile-icon.svg"
          }
          alt="Profile icon"
          width="24"
          height="24"
        />
      </Link>
    </div>
  );
}