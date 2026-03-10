"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthCheck } from "@/hooks/useAuthCheck";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthCheck();

  if (!isAuthenticated) {
    return null; // Prevent hydration flash while redirecting
  }

  return <AppLayout>{children}</AppLayout>;
}
