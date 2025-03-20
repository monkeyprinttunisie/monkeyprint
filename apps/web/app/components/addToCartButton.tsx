"use client";

import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/button";
interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = async () => {
    await addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock ?? 0,
      quantity: 1,
    });
    /* alert("Product added to cart!"); */
  };

  return (
    <Button
      onClick={handleAddToCart}
      className="text-[14px] font-light text-[#F3F3F3] pl-2 pr-2 p-2 text-center font-['Nunito_Sans'] bg-[#004CFF] rounded-[4px] 
    transition-all duration-300 ease-in-out 
    active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
      //to make button unclickable if product stock = 0
      //disabled={!product.stock || product.stock <= 0}
    >
      Add to Cart
    </Button>
  );
}
