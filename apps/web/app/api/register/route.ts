import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";
import { hashPassword } from "@monkeyprint/utils/hash";
import { registerSchema } from "@monkeyprint/utils/zod";

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
      const storeUrl = name.trim().toLowerCase().replace(/\s+/g, "-");
      if (name) {
        store = await tx.store.create({
          data: {
            userId: newUser.id,
            name: name,
            image: image || null,
            url: storeUrl,
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
