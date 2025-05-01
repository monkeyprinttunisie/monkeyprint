"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserSessionStore } from "@/store/storeStore";

export function SessionSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { syncWithNextAuth, setCurrentStore, setStoreRole } =
    useUserSessionStore();

  useEffect(() => {
    // Sync basic user data from Next Auth session
    syncWithNextAuth(session);

    // If we have a user ID, fetch their store relationship
    if (session?.user?.id) {
      const fetchUserStore = async () => {
        try {
          const userWithStore = await fetch(
            `/api/user/store?userId=${session?.user?.id}`
          );
          const { store, role } = await userWithStore.json();

          if (store) {
            setCurrentStore(store);
            setStoreRole(role);
          }
        } catch (error) {
          console.error("Failed to fetch user store:", error);
        }
      };

      fetchUserStore();
    }
  }, [session, status, syncWithNextAuth, setCurrentStore, setStoreRole]);

  return <>{children}</>;
}
