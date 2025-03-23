"use client";

import { usePathname } from "next/navigation";
import Menu from "@/components/Menu";

export default function MenuWrapper() {
  const pathname = usePathname();

  if (pathname.startsWith("/en/auth")) {
    return null;
  }

  return <Menu />;
}
