import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";
import { hashPassword } from "@monkeyprint/utils/hash";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in POST /api/resetPassword:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
