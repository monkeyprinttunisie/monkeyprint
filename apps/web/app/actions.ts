"use server";

import { signIn } from "@/auth";

export async function handleSignIn(provider: string) {
  await signIn(provider);
}
