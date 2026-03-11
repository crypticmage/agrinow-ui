"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

export function useAuthCheck() {
  const router = useRouter();
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
      if (currentUser?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentUser.exp < currentTime) {
          toast.error("Session expired, please log in again.");
          logout();
          router.push("/login");
        }
      }
    };

    // Check immediately and then every minute
    checkExpiry();
    const intervalId = setInterval(checkExpiry, 60000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isHydrated, currentUser, logout, router]);

  // Return true during SSR/Hydration to prevent visual layout flashes
  return isHydrated ? isAuthenticated : true;
}
