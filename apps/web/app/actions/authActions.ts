"use server";

import { db } from "@monkeyprint/db";
import { signIn, signOut, auth } from "@/auth";

export async function signInAction(provider: string) {
  await signIn(provider, { redirectTo: "/admin/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/login" });
}

export async function sendVerificationEmail(email: string) {
  return await signIn("resend", { email, redirect: false });
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
