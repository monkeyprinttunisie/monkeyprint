"use client";

import { signInAction } from "@/actions/authActions";
import { Button } from "./button";

interface SignInProps {
  provider: string;
  iconPath?: string;
  className?: string;
}

const providerIcons: Record<string, string> = {
  google: "bg-[url('/icons/google.svg')]",
  facebook: "bg-[url('/icons/facebook.svg')]",
};

export default function SignIn({ provider, className }: SignInProps) {
  return (
    <Button
      className={
        className +
        ` p-4  w-[54px] h-[54px] bg-[#F4F3FC] border border-[#004CFF] rounded-full bg-no-repeat bg-center ${providerIcons[provider] || ""} bg-[length:50%_50%]`
      }
      onClick={() => signInAction(provider)}
    />
  );
}
