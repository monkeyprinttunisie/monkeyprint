"use server";

import { db } from "@monkeyprint/db";
import { productUpdateSchema } from "@monkeyprint/utils/zod";

interface IUpdatedProductData {
  name?: string;
  description?: string;
  price?: number;
  active?: boolean;
}

export async function updateProduct(
  id: string,
  updateData: IUpdatedProductData,
) {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const validatedData = productUpdateSchema.parse(updateData);

    console.log("Updating product ID:", id);
    console.log("Update data:", updateData);

    const updatedProduct = await db.product.update({
      where: { id },
      data: validatedData,
    });

    console.log("Product updated successfully:", updatedProduct);
    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}
