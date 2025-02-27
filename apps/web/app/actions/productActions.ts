"use server";
import { db } from "@monkeyprint/db";
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