import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { db } from "@monkeyprint/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Use Next Auth's signIn function
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Don't redirect, return JSON instead
    });

    // If sign in succeeded, fetch additional user data including store info
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        StoreCollaborator: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get primary store (if any)
    const primaryStoreRelation = user.StoreCollaborator[0];

    // Remove sensitive data before sending to client
    const { StoreCollaborator, ...safeUser } = user;

    // Return user and store info
    return NextResponse.json({
      user: safeUser,
      store: primaryStoreRelation?.store || null,
      storeRole: primaryStoreRelation?.role || null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
