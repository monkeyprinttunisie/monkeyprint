"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MenuButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function SuperAdminMenuButton({
  isOpen,
  toggleMenu,
}: MenuButtonProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full  ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-14 flex items-center">
        <button
          onClick={toggleMenu}
          className={`p-2 rounded-md hover:bg-blue-50 transition-colors ${
            scrolled ? "text-blue-600" : "text-blue-600"
          }`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
