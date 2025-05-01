import { NextRequest, NextResponse } from "next/server";
import { db } from "@monkeyprint/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Fetch all users associated with the store
    const collaborators = await db.storeUserRelation.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Map to a cleaner structure that matches our Collaborator type
    const formattedCollaborators = collaborators.map((relation) => ({
      user: relation.user,
      role: relation.role,
    }));

    return NextResponse.json(formattedCollaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}
