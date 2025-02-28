"use client";
import { useState } from "react";
import { Button } from "@/components/button";
import { updateProduct, listProducts } from "@/actions/productActions";

interface BuyProductButtonProps {
  isSubmitting: boolean;
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl: string;
    stock: number | null; 
  };
  onProductsUpdated: () => void;
}

export const BuyProductButton = ({
  isSubmitting,
  product,
  onProductsUpdated,
}: BuyProductButtonProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    if (product.stock === null || product.stock <= 0) {
      setError("Sorry, this product is out of stock.");
      return;
    }

    // Confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to buy ${product.name}?`);

    if (!isConfirmed) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const updatedStock = product.stock - 1;

      const sanitizedProduct = {
        ...product,
        description: product.description ?? undefined,
        stock: updatedStock,
      };

      await updateProduct(product.id, sanitizedProduct);

      await listProducts();
      onProductsUpdated();
    } catch (error) {
      console.error("Error buying product:", error);
      setError("An error occurred while processing your purchase.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button className="buy-product-button" onClick={handleBuy}>
        {isSubmitting || isLoading ? "Processing..." : "Buy Now"}
      </Button>
      {error && <p className="error-message">{error}</p>}
      {isLoading && <div className="loading-spinner">Loading...</div>}
    </div>
  );
};
