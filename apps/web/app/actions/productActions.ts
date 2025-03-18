"use server";

import { db } from "@monkeyprint/db";
import { productUpdateSchema } from "@monkeyprint/utils/zod";

interface IUpdatedProductData {
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  stock?: number;
}

export async function updateProduct(
  id: string,
  updateData: IUpdatedProductData
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

export async function listProductsAction() {
  try {
    const products = await db.product.findMany();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function deleteProductAction(id: string) {
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

export async function createProduct(productData: IUpdatedProductData) {
  try {
    await db.product.create({
      data: productData,
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}
