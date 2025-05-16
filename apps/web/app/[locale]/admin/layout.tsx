"use client";

import { useState } from "react";
import AdminNav from "@/components/admin/AdminNav";
import AdminMenuButton from "@/components/admin/AdminMenuButton";
import { Toaster } from "sonner";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex">
      {/* Mobile menu button - only show when menu is closed */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden fixed left-4 ">
          <AdminMenuButton isOpen={false} toggleMenu={toggleMenu} />
        </div>
      )}

      {/* Navigation sidebar */}
      <AdminNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-200">
        <main className="min-h-screen">
          {/* Added padding-top on mobile to ensure content doesn't hide under the button */}
          <div className="pt-12 lg:pt-0">
            {children}
            <Toaster position="top-center" closeButton richColors />
          </div>
        </main>
      </div>
    </div>
  );
}
