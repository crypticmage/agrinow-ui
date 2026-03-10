"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/appStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { routes } from "@/data/sidebarRoutes";

export function AppSidebar() {
  const pathname = usePathname();
  const role = (useAppStore((s) => s.currentUser?.role) ?? "staff") as
    | "admin"
    | "manager"
    | "staff";
  const isMobile = useIsMobile();
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <Sprout className="h-6 w-6 text-sidebar-primary shrink-0" />
        {!collapsed && (
          <span className="font-bold text-sm text-sidebar-foreground tracking-tight">
            SeedSense
          </span>
        )}
      </div>
      <SidebarContent>
        {routes.map((group) => {
          const filtered = group.items.filter((item) =>
            (item.roles as readonly string[]).includes(role),
          );
          if (!filtered.length) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest font-semibold">
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu>
                {filtered.map((item) => {
                  const active =
                    item.url === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link href={item.url} onClick={handleNavClick}>
                        <SidebarMenuButton
                          isActive={active}
                          className={`hover:bg-sidebar-accent/60 transition-colors cursor-pointer ${
                            active
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : ""
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
