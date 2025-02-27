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
