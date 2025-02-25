import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = params?.id;

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 }
    );
  }

  try {
    const product = await db.product.softDelete({ id: productId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product soft deleted", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
