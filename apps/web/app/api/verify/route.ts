import { NextRequest, NextResponse } from "next/server";
import { db } from "@monkeyprint/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        new URL("/auth/verification-error", req.url)
      );
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/verification-error", req.url)
      );
    }

    // Update the user's email verification status
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // Redirect to verification success page
    return NextResponse.redirect(
      new URL("/auth/verification-success", req.url)
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/verification-error", req.url));
  }
}
