"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Smartphone, Download, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore } from "@/stores/appStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { routes } from "@/data/sidebarRoutes";

export function AppSidebar() {
  const pathname = usePathname();
  const role = (useAppStore((s) => s.currentUser?.role) ?? "farmer") as
    | "admin"
    | "manager"
    | "farmer"
    | "agent"
    | "analyst";
  const hideAppDownload = useAppStore((s) => s.hideAppDownload);
  const isMobile = useIsMobile();
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const [qrOpen, setQrOpen] = useState(false);

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const apkUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/SeedSense.apk`
      : "/SeedSense.apk";

  const footerContent = (
    <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary/20 group-hover:bg-sidebar-primary/30 transition-colors">
      <Smartphone className="h-4 w-4 text-sidebar-primary" />
    </div>
  );

  const footerLabel = !collapsed && (
    <div className="min-w-0 flex-1 self-center text-left">
      <p className="text-xs font-medium leading-tight text-sidebar-foreground">
        Get the App
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-[10px] leading-none text-sidebar-foreground/55">
        {isMobile ? (
          <>
            <Download className="h-3 w-3 shrink-0" />
            <span className="truncate">Android APK</span>
          </>
        ) : (
          <>
            <QrCode className="h-3 w-3 shrink-0" />
            <span className="truncate">Scan QR Code</span>
          </>
        )}
      </div>
    </div>
  );

  const footerClass = `
    group flex w-full items-center gap-3 rounded-lg
    bg-sidebar-accent/50 border border-sidebar-border
    ${collapsed ? "justify-center px-2" : "justify-start px-3"} py-2.5
    hover:bg-sidebar-accent hover:border-sidebar-primary/30
    transition-all duration-200 cursor-pointer
  `;

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

      {!hideAppDownload && (
        <SidebarFooter className="border-t border-sidebar-border p-3">
          {isMobile ? (
            /* Mobile: direct download */
            <a
              href="/SeedSense.apk"
              download="SeedSense.apk"
              title="Download SeedSense for Android"
              className={footerClass}
            >
              {footerContent}
              {footerLabel}
            </a>
          ) : (
            /* Desktop: QR code popover */
            <Popover open={qrOpen} onOpenChange={setQrOpen}>
              <PopoverTrigger className="w-full">
                <div
                  role="button"
                  title="Scan QR to download SeedSense for Android"
                  className={footerClass}
                >
                  {footerContent}
                  {footerLabel}
                </div>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="end"
                sideOffset={12}
                className="w-64 p-0 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30">
                  <p className="text-xs font-semibold text-foreground">
                    Download Android App
                  </p>
                  <button
                    onClick={() => setQrOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="bg-white rounded-xl p-3 shadow-sm border">
                    <QRCodeSVG
                      value={apkUrl}
                      size={160}
                      level="M"
                      fgColor="#2E7D32"
                      bgColor="#ffffff"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      Scan with your phone
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Point your camera at the QR code to download the
                      SeedSense Android app
                    </p>
                  </div>
                  <div className="w-full pt-1 border-t">
                    <a
                      href="/SeedSense.apk"
                      download="SeedSense.apk"
                      className="flex items-center justify-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium py-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      Or download directly
                    </a>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
