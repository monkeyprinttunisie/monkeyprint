"use server";

import { db } from "@monkeyprint/db";

export async function updateProduct(id: string, updateData: any) {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    console.log("Updating product ID:", id);
    console.log("Update data:", updateData);

    const updatedProduct = await db.product.update({
      where: { id },
      data: updateData,
    });

    console.log("Product updated successfully:", updatedProduct);
    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}
