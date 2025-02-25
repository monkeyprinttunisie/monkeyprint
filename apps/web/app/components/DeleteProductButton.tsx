"use client";

import { Button } from "./button";

type DeleteProductButtonProps = {
  productId: string;
  className?: string;
};

export default function DeleteProductButton({
  productId,
  className,
}: DeleteProductButtonProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");

      alert("Product soft deleted successfully");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <Button className={className} onClick={handleDelete}>
      Delete Product
    </Button>
  );
}
