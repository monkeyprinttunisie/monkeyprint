"use client";

import { signOutAction } from "@/actions/authActions";
import { Button } from "./button";

export default function SignOut() {
  return (
    <Button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => signOutAction()}
    >
      Sign out
    </Button>
  );
}
