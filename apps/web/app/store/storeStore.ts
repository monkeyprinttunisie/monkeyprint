import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define types without direct imports from Prisma
type User = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  image?: string | null;
  role?: string;
};

type Store = {
  id: string;
  name: string;
  url?: string | null;
  image?: string | null;
};

type StoreType = "COLLABORATOR" | "OWNER";

// Define the types for our store state
interface UserSession {
  user: User | null;
  currentStore: Store | null;
  storeRole: StoreType | null;
  isAuthenticated: boolean;
}

// Define actions as separate type to make it cleaner
interface UserSessionActions {
  setUser: (user: User | null) => void;
  setCurrentStore: (store: Store | null) => void;
  setStoreRole: (role: StoreType | null) => void;
  logout: () => void;
  // Add a method to sync with Next Auth session
  syncWithNextAuth: (session: any) => void;
}

// Combine both state and actions in the store type
type UserSessionStore = UserSession & UserSessionActions;

// Create the store with persist middleware to save in localStorage
export const useUserSessionStore = create<UserSessionStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      currentStore: null,
      storeRole: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setCurrentStore: (store) =>
        set({
          currentStore: store,
        }),

      setStoreRole: (role) =>
        set({
          storeRole: role,
        }),

      logout: () =>
        set({
          user: null,
          currentStore: null,
          storeRole: null,
          isAuthenticated: false,
        }),

      // Method to sync with Next Auth session
      syncWithNextAuth: (session) => {
        if (session && session.user) {
          set({
            user: session.user,
            isAuthenticated: true,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "user-session-storage",
    }
  )
);

// Export the types for use in other files
export type { User, Store, StoreType };
