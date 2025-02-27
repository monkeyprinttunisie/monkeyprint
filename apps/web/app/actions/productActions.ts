"use server";

import { db } from "@monkeyprint/db";

export async function listProducts() {
  try {
    const products = await db.product.findMany();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

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

export async function createProduct(name: string, price: number, description: string, imageUrl: string) {
    try {
        await db.product.create({
            data: {
                name,
                price,
                description,
                imageUrl,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, error: "Failed to create product" };
    }
}
