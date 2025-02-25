import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const { id: requestId, ...updateData } = await request.json();

    if (!requestId || requestId !== id) {
      return NextResponse.json({ error: "Product ID is required and must match the URL" }, { status: 400 });
    }

    console.log("PATCH request received. Partially updating product ID:", id);
    console.log("Update data:", updateData);

    const updatedProduct = await db.product.update({
      where: { id: id },
      data: updateData,
    });

    console.log("Product updated successfully:", updatedProduct);
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error partially updating product:", error);
    return NextResponse.json({ error: "Failed to partially update product" }, { status: 500 });
  }
}
