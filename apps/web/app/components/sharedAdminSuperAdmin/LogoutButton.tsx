"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  onClose?: () => void;
}

export default function LogoutButton({ onClose }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Close the mobile menu if provided
    if (onClose) {
      onClose();
    }

    // Sign out and redirect to login
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center p-3 rounded-md hover:bg-blue-700 text-white"
    >
      <LogOut className="w-5 h-5" />
      <span className="ml-3">Logout</span>
    </button>
  );
}
