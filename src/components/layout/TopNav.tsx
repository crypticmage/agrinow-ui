"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Bell, Sun, Moon, User, LogOut, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/appStore";
import { useDarkMode } from "@/hooks/useDarkMode";
import { formatUsername } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  mockFields,
  mockStaff,
  mockWeather,
  notifications,
} from "@/data/mockData";
import { useRouter } from "next/navigation";

type SearchResult = {
  type: "field" | "staff";
  name: string;
  sub: string;
  url: string;
};

export function TopNav() {
  const router = useRouter();
  const user = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const { isDark, toggle, mounted } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [readNotifs, setReadNotifs] = useState<string[]>([]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    mockFields.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.crop.toLowerCase().includes(q))
        results.push({
          type: "field",
          name: f.name,
          sub: `${f.crop} • ${f.area} ac`,
          url: "/fields-map",
        });
    });
    mockStaff.forEach((s) => {
      if (s.name.toLowerCase().includes(q))
        results.push({
          type: "staff",
          name: s.name,
          sub: `${s.role} • ${s.status}`,
          url: "/attendance",
        });
    });
    return results.slice(0, 6);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const unreadCount = notifications.filter(
    (n) => !n.read && !readNotifs.includes(n.id),
  ).length;

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0">
      <SidebarTrigger className="mr-1" />

      {/* Search */}
      <div ref={searchRef} className="relative hidden md:block flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields, staff..."
          className="pl-9 h-9 bg-muted/50 border-border focus:bg-card transition-colors"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {searchOpen && searchQuery.trim() && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
            {searchResults.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground text-center">
                No results found
              </p>
            ) : (
              searchResults.map((r, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => {
                    router.push(r.url);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                >
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {r.type}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Weather */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sun className="h-4 w-4 text-warning" />
        <span className="font-medium text-foreground">
          {mockWeather.temp}°C
        </span>
        <span className="hidden lg:inline">{mockWeather.condition}</span>
      </div>

      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        title={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger>
          <div
            role="button"
            className="inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-md relative text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-3 border-b">
            <p className="text-sm font-semibold">Notifications</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.map((n) => {
              const isRead = n.read || readNotifs.includes(n.id);
              return (
                <button
                  key={n.id}
                  className={`w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-accent transition-colors border-b last:border-0 cursor-pointer ${!isRead ? "bg-primary/5" : ""}`}
                  onClick={() => setReadNotifs((prev) => [...prev, n.id])}
                >
                  <n.icon className={`h-4 w-4 mt-0.5 shrink-0 ${n.color}`} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${!isRead ? "font-medium" : "text-muted-foreground"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{n.sub}</p>
                  </div>
                  {!isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs hover:bg-accent cursor-pointer"
              onClick={() => setReadNotifs(notifications.map((n) => n.id))}
            >
              Mark all as read
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* User */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer outline-hidden group">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden md:flex flex-col items-start gap-0.5">
            <p className="text-xs font-semibold leading-none text-foreground">
              {formatUsername(user?.userName || "")}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize leading-none font-normal">
              {user?.role}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
