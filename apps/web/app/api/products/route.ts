import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";
import { ourFileRouter } from "@/api/uploadthing/core";

export const POST = async (request: Request) => {
    try {

        // Parse request body
        const body = await request.json();
        const { name, description, price, imageUrl } = body;
        console.log('Received body:', body);
        // Validation check
        if (!name || !price || !imageUrl) {
            return NextResponse.json(
                { error: "Name, price, and imageUrl are required" },
                { status: 400 }
            );
        }
        // Create product in the database
        const product = await db.product.create({
            data: {
                name,
                description: description || "",
                price: parseFloat(price),
                imageUrl,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }

}
