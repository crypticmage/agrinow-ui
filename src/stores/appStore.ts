import { User, UserRole } from "@/types/login";
import { create } from "zustand";

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

export const useAppStore = create<AppState>((set) => ({
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
}));
