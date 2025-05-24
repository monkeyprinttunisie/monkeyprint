"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import {
  Contact,
  MailPlus,
  ShoppingCart,
  MessageSquare,
  Home,
} from "lucide-react";
export default function Menu() {
  const cart = useCartStore((state) => state.cart);
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 h-[8vh] right-0 bg-white shadow-lg p-4 flex justify-around items-center">
      <Link href="/" className="text-gray-900">
        {pathname === "/" ? (
          <Home size={24} className="text-black" strokeWidth={2.25} />
        ) : (
          <Home
            size={24}
            className="text-blue-600 fill-blue-100"
            strokeWidth={1.75}
          />
        )}
      </Link>

      <Link href="/chat" className="text-gray-800">
        {pathname === "/chat" ? (
          <MessageSquare size={24} className="text-black" strokeWidth={2.25} />
        ) : (
          <MessageSquare
            size={24}
            className="text-blue-600 fill-blue-100"
            strokeWidth={1.75}
          />
        )}
      </Link>

      <Link href="/cart" className="text-black relative">
        {pathname === "/cart" ? (
          <ShoppingCart
            size={24}
            className="text-black"
            strokeWidth={2.25}
            fill={cart.length > 0 ? "#f3f4f6" : "none"}
          />
        ) : (
          <ShoppingCart
            size={24}
            className="text-blue-600"
            strokeWidth={1.75}
            fill={cart.length > 0 ? "#dbeafe" : "none"}
          />
        )}

        {/* Cart Badge Indicator */}
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {cart.length > 99 ? "99+" : cart.length}
          </span>
        )}
      </Link>

      <Link href="/aboutUs" className="text-gray-800">
        {pathname === "/aboutUs" ? (
          <Contact size={24} className="text-black" strokeWidth={2.25} />
        ) : (
          <Contact
            size={24}
            className="text-blue-600 fill-blue-100"
            strokeWidth={1.75}
          />
        )}
      </Link>

      <Link href="/contactUs" className="text-gray-800">
        {pathname === "/contactUs" ? (
          <MailPlus size={24} className="text-black" strokeWidth={2.25} />
        ) : (
          <MailPlus
            size={24}
            className="text-blue-600 fill-blue-100"
            strokeWidth={1.75}
          />
        )}
      </Link>
    </div>
  );
}
