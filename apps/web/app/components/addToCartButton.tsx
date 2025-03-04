"use client";

import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock ?? 0,
        quantity: 1,
      });
      alert("Product added to cart!");
    
  };

  return (
    <button
      onClick={handleAddToCart}
      //to make button unclickable if product stock = 0
      //disabled={!product.stock || product.stock <= 0}
    >
      Add to Cart
    </button>
  );
}
