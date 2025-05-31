"use server";

import { randomBytes } from "crypto";
import { db } from "@monkeyprint/db";
import { signIn, signOut, auth } from "@/auth";
import { sendEmailVerification } from "@monkeyprint/utils/email";

export async function signInAction(provider: string) {
  await signIn(provider, { redirectTo: "/admin/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/login" });
}

export async function sendVerificationEmail(email: string) {
  try {
    // Generate a verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save the token in the database
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send the verification email using your existing email utility
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Use your existing email sending function from @monkeyprint/utils/email
    await sendEmailVerification(email, verifyUrl);

    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: "Failed to send verification email" };
  }
}

//get the current user from the session
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

//get the current user store id (the logged in user )
export async function getUserStoreId() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get the store relation
  const storeRelation = await db.storeUserRelation.findFirst({
    where: {
      userId: user.id,
      role: { in: ["OWNER", "COLLABORATOR"] },
    },
    select: { storeId: true },
  });

  return storeRelation?.storeId || null;
}
