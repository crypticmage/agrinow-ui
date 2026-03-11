"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { getQueryClient } from "@/lib/getQueryClient";

export function QueryProvider({ children }: { children: ReactNode }) {
  // NOTE: Avoid identical QueryClient instances across multiple components
  // if you have multiple providers, but for a single root provider,
  // getQueryClient() is the standard way to handle this in Next.js.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
