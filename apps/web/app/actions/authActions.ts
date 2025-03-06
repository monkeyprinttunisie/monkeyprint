"use server";

import { signIn, signOut } from "@/auth";

export async function signInAction(provider: string) {
  await signIn(provider, { redirectTo: "/profile" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/login" });
}
