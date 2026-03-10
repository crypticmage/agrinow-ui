"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import Login from "./(auth)/login/page";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser) {
    return <Login />;
  }

  // Brief fallback while replace() is in flight
  return <div className="min-h-screen bg-background" />;
}
