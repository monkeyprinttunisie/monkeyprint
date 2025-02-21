import { NextResponse } from "next/server";
import { db } from "@monkeyprint/db";
import { generateToken } from "@monkeyprint/utils/token";
import { sendPasswordResetEmail } from "@monkeyprint/utils/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User with this email does not exist" },
        { status: 404 },
      );
    }

    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await db.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { message: "Password reset email sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in POST /api/forgotPassword:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}