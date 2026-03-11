import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, AuthRole } from "@/types/auth";

export interface StoreUser extends AuthUser {}

interface AppState {
  currentUser: StoreUser | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  login: (userName: string, email: string, role: AuthRole, exp?: number) => void;
  logout: () => void;
  setRole: (role: AuthRole) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      sidebarOpen: true,
      login: (userName, email, role, exp) =>
        set({
          currentUser: { id: "1", userName, email, role, exp: exp || null },
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
      name: "seedsense-storage",
    }
  )
);
