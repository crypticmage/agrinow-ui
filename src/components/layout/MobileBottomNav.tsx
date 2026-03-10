"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { tabs } from "@/data/sidebarRoutes";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active =
            tab.url === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(tab.url);
          return (
            <Link
              key={tab.url}
              href={tab.url}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors",
                active ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
