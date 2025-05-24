import { NextResponse } from "next/server";
import { PrismaClient } from "@monkeyprint/db";

// Plain Prisma client without extensions
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const store = await prisma.store.findFirst({
      where: {
        url: url,
        isDeleted: false,
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error looking up store:", error);
    return NextResponse.json(
      { error: "Failed to look up store" },
      { status: 500 }
    );
  }
}
