"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to rehydrate from localStorage before making redirect decisions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // 1. Not authenticated at all
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // 2. Authenticated, but token is expired client-side
    const checkExpiry = () => {
      // If the user's localized storage doesn't even have the exp field, force a fresh login
      if (currentUser && currentUser.exp === undefined) {
        toast.info("Session updated, please log in again.");
        logout();
        router.push("/login");
        return;
      }

      if (currentUser?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentUser.exp < currentTime) {
          toast.error("Session expired, please log in again.");
          logout();
          router.push("/login");
        }
      }
    };

    // Check on mount and on every navigation
    checkExpiry();
  }, [isAuthenticated, isHydrated, currentUser, logout, router, pathname]);

  // Return true during SSR/Hydration to prevent visual layout flashes
  return isHydrated ? isAuthenticated : true;
}
