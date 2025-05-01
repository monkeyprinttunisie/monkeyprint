import { NextRequest, NextResponse } from "next/server";
import { db } from "@monkeyprint/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId parameter" },
      { status: 400 }
    );
  }

  try {
    // Find the user's store relationship
    const storeRelation = await db.storeUserRelation.findFirst({
      where: { userId },
      include: {
        store: true,
      },
    });

    if (!storeRelation) {
      return NextResponse.json({ store: null, role: null });
    }

    return NextResponse.json({
      store: storeRelation.store,
      role: storeRelation.role,
    });
  } catch (error) {
    console.error("Error fetching user store data:", error);
    return NextResponse.json(
      { error: "Failed to fetch store data" },
      { status: 500 }
    );
  }
}
