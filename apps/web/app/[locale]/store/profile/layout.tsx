"use client";

import React from "react";
import { redirect } from "next/navigation";
import {
  useIsAuthenticated,
  useCurrentUser,
  useCurrentStore,
} from "@/store/useUserStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const store = useCurrentStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="user-info">
          {user?.image && (
            <img src={user.image} alt="Profile" className="avatar" />
          )}
          <div>
            <h3>Welcome, {user?.firstName || user?.name || "User"}</h3>
            {store && <p>Store: {store.name}</p>}
            <h3>Email: {user?.email}</h3>
          </div>
        </div>
      </header>

      <div className="dashboard-content">{children}</div>
    </div>
  );
}
