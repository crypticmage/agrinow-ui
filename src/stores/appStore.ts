import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types/login";

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  login: (userName: string, email: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      sidebarOpen: true,
      login: (userName, email, role) =>
        set({
          currentUser: { id: "1", userName, email, role },
          isAuthenticated: true,
        }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      setRole: (role) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, role } : null,
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "seedsense-storage", // name of the item in the storage (must be unique)
      // by default, it uses localStorage
    }
  )
);
