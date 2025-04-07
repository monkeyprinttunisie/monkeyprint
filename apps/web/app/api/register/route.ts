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
    const { storeImage } = body;

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

    //hash password using bcrypt from utils/hash
    const hashedPassword = await hashPassword(password);
    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        phoneNumber,
        image: storeImage || null,
      },
    });

    //don't show the password in the response
    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json(
      { user: rest, message: "User created successfully" },
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
