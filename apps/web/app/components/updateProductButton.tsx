// updateProductButton.tsx
"use client";

import { Button } from "@/components/button";

interface UpdateProductButtonProps {
  isSubmitting: boolean;
  onClick: (e: React.FormEvent) => void;
}

export const UpdateProductButton = ({
  isSubmitting,
  onClick,
}: UpdateProductButtonProps) => {
  const handleClick = () => {
    onClick({} as React.FormEvent);
  };
  return (
    <Button className="" onClick={handleClick}>
      {isSubmitting ? "Submitting..." : "Update Product"}
    </Button>
  );
};
