"use client";

import { handleSignIn } from "@/actions";
import { Button } from "./button";

interface SignInProps {
  provider: string;
}

export default function SignIn({ provider }: SignInProps) {
  return (
    <Button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => handleSignIn(provider)}
    >
      Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  );
}
