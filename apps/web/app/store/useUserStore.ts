"use client";

import { useUserSessionStore } from "./storeStore";
import { signOut as nextAuthSignOut } from "next-auth/react";

// Hook to access the complete user session
export const useUserSession = () => {
  return useUserSessionStore();
};

// Convenience hooks for specific parts of the store
export const useCurrentUser = () => {
  return useUserSessionStore((state) => state.user);
};

export const useCurrentStore = () => {
  return useUserSessionStore((state) => state.currentStore);
};

export const useStoreRole = () => {
  return useUserSessionStore((state) => state.storeRole);
};

export const useIsAuthenticated = () => {
  return useUserSessionStore((state) => state.isAuthenticated);
};

// Actions
export const useUserActions = () => {
  const {
    setUser,
    setCurrentStore,
    setStoreRole,
    logout: storeLogout,
  } = useUserSessionStore();

  // Extended logout function that also calls Next Auth signOut
  const handleLogout = async () => {
    // First update our local store
    storeLogout();
    // Then trigger Next Auth signOut
    await nextAuthSignOut();
  };

  return {
    setUser,
    setCurrentStore,
    setStoreRole,
    logout: handleLogout,
  };
};
