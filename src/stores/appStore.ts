import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, AuthRole } from "@/types/auth";

export interface StoreUser extends AuthUser {}

interface AppState {
  currentUser: StoreUser | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  appBannerDismissed: boolean;
  hideAppDownload: boolean;
  login: (userName: string, email: string, role: AuthRole) => void;
  logout: () => void;
  setRole: (role: AuthRole) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  dismissAppBanner: () => void;
  setHideAppDownload: (hide: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      sidebarOpen: true,
      appBannerDismissed: false,
      hideAppDownload: false,
      login: (userName, email, role) =>
        set({
          currentUser: { id: "1", userName, email, role },
          isAuthenticated: true,
        }),
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "auth-token=; Path=/; max-age=0";
        }
        set({ currentUser: null, isAuthenticated: false });
      },
      setRole: (role) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, role } : null,
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      dismissAppBanner: () => set({ appBannerDismissed: true }),
      setHideAppDownload: (hide) => set({ hideAppDownload: hide }),
    }),
    {
      name: "seedsense-storage",
    }
  )
);
