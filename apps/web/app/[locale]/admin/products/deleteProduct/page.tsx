"use client";

import DeleteProductButton from "@/components/DeleteProductButton";
import { deleteProductAction } from "@/actions/productActions";
import { useRouter } from "next/navigation";

export default function DeleteProductPage() {
  const router = useRouter();

  const handleDelete = async (productId: string) => {
    await deleteProductAction(productId);
    router.push("/products");
  };

  return (
    <DeleteProductButton
      productId="08742a79-2189-4128-9976-3506f50b8e23"
      onDelete={handleDelete}
    />
  );
}
