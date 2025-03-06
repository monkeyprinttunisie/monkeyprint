"use client";

import { Button } from "./button";

type DeleteProductButtonProps = {
  productId: string;
  className?: string;
  onDelete: (productId: string) => void;
};

export default function DeleteProductButton({
  productId,
  className,
  onDelete,
}: DeleteProductButtonProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await onDelete(productId);
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
