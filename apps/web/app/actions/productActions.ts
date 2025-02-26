"use server";

import { db } from "@monkeyprint/db";

export async function deleteProduct(id: string) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  try {
    const product = await db.product.softDelete({ id: id });
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    throw new Error("Failed to delete product");
  }
}
