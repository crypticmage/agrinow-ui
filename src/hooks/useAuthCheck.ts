"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";

export function useAuthCheck() {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    // 1. Check if user is theoretically authenticated in Zustand
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // 2. Optional cookie validity check (only if your auth is cookie-based).
    // If you're only using client state (Zustand), don't force-logout just because a cookie is missing.
    const checkAuthStatus = () => {
      if (typeof document === "undefined") return;

      const hasAuthTokenCookie = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("auth-token="));

      // If your backend sets/uses an auth cookie, enforce it here.
      // Otherwise, treat a missing cookie as "not applicable" and keep the session in client state.
      if (!hasAuthTokenCookie) return;
    };

    checkAuthStatus();
    const intervalId = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, logout, router]);

  return isAuthenticated;
}
