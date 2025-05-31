import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";
import { hashPassword } from "@monkeyprint/utils/hash";
import { registerSchema } from "@monkeyprint/utils/zod";
import { sendVerificationEmail } from "@/actions/authActions";

// Helper function to generate a URL-friendly string
function generateStoreUrl(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

// Helper function to ensure URL uniqueness
async function ensureUniqueUrl(baseUrl: string): Promise<string> {
  let url = baseUrl;
  let counter = 0;
  let isUnique = false;

  while (!isUnique) {
    const existingStore = await db.store.findFirst({
      where: { url },
    });

    if (!existingStore) {
      isUnique = true;
    } else {
      counter++;
      url = `${baseUrl}-${counter}`;
    }
  }

  return url;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body:", body);
    const { email, name, password, role, firstName, lastName, phoneNumber } =
      registerSchema.parse(body);
    const { image } = body;

    //check if email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email: email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    if (name) {
      const existingStore = await db.store.findUnique({
        where: { name: name },
      });
      if (existingStore) {
        return NextResponse.json(
          { user: null, message: "Store with this name already exists" },
          { status: 409 }
        );
      }
    }

    //hash password using bcrypt from utils/hash
    const hashedPassword = await hashPassword(password);

    const result = await db.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
          firstName,
          lastName,
          phoneNumber,
          image: image || null,
        },
      });

      // Create store if storeName is provided
      let store = null;
      if (name) {
        // Generate URL from store name and ensure it's unique
        const baseUrl = generateStoreUrl(name);
        const storeUrl = await ensureUniqueUrl(baseUrl);

        store = await tx.store.create({
          data: {
            name: name,
            image: image || null,
            url: storeUrl,
          },
        });

        // Create store relations
        await tx.storeUserRelation.create({
          data: {
            storeId: store.id,
            userId: newUser.id,
            role: "OWNER",
          },
        });
        // Create wallet for the store
        await tx.wallet.create({
          data: {
            storeId: store.id,
            Total: 0,
            Delivered: 0,
            Returned: 0,
          },
        });
      }

      return { newUser, store };
    });

    //don't show the password in the response
    const { password: newUserPassword, ...userWithoutPassword } =
      result.newUser;

    sendVerificationEmail(result.newUser.email);

    return NextResponse.json(
      {
        user: userWithoutPassword,
        store: result.store,
        message:
          "User created successfully" + (result.store ? " with store" : ""),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
