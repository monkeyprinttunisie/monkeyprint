// updateProductButton.tsx
"use client";

import { Button } from "@/components/button";

interface UpdateProductButtonProps {
  isSubmitting: boolean;
  onClick: (e: React.FormEvent) => void;
}

export const UpdateProductButton = ({ isSubmitting, onClick }: UpdateProductButtonProps) => {
  return (
    <Button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={onClick}
    >
      {isSubmitting ? "Submitting..." : "Update Product"}
    </Button>
  );
};
