"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";

export function useAuthCheck() {
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to rehydrate from localStorage before making redirect decisions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  // Return true during SSR/Hydration to prevent visual layout flashes
  return isHydrated ? isAuthenticated : true;
}
