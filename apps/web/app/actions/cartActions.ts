"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";

export async function fetchCart(): Promise<CartItem[]> {
  const cart = (await cookies()).get("cart")?.value;
  return cart ? JSON.parse(cart) : [];
}

export async function addToCartAction(product: CartItem) {
  const cart = await fetchCart();
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    // to check for stock availability
    /*if (existingProduct.quantity >= product.stock) {
      throw new Error("Cannot add more than available stock.");
    }*/
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  (await cookies()).set("cart", JSON.stringify(cart));
  return cart;
}

export async function updateCartItemQuantityAction(productId: string, quantity: number) {
  const cart = await fetchCart();
  const product = cart.find((item) => item.id === productId);

  if (!product) {
    throw new Error("Product not found in cart.");
  }

  /*if (quantity > product.stock) {
    throw new Error("Cannot add more than available stock.");
  }*/

  product.quantity = quantity;
  (await cookies()).set("cart", JSON.stringify(cart));
  return cart;
}

export async function removeFromCartAction(productId: string) {
  const cart = await fetchCart();
  const updatedCart = cart.filter((item) => item.id !== productId);
  (await cookies()).set("cart", JSON.stringify(updatedCart));
  return updatedCart;
}

export async function clearCartAction() {
  (await cookies()).set("cart", JSON.stringify([]));
  return [];
}