import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreUser {
  username: string
  email: string
  role: 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'
}

interface AppState {
  currentUser: StoreUser | null
  isAuthenticated: boolean
  sidebarOpen: boolean
  // In-memory only — never persisted to localStorage
  accessToken: string | null
  login: (username: string, email: string, role: string, token?: string) => void
  logout: () => void
  setRole: (role: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      sidebarOpen: true,
      accessToken: null,
      login: (username, email, role, token) =>
        set({
          currentUser: { username, email, role: role as StoreUser['role'] },
          isAuthenticated: true,
          accessToken: token ?? null,
        }),
      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; max-age=0'
        }
        set({ currentUser: null, isAuthenticated: false, accessToken: null })
      },
      setRole: (role) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, role: role as StoreUser['role'] }
            : null,
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'seedsense-user', // localStorage key — stores display info only, NOT the JWT
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        // accessToken intentionally excluded — in-memory only
      }),
    }
  )
)
