"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Bell, Sun, Moon, User as UserIcon, LogOut, X, LogIn, Key, UserCog, Trash2, AlertCircle, ShieldOff, Monitor, Cloud } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useQuery } from '@tanstack/react-query';
import api from "@/lib/api";
import { useSitesList } from "@/hooks/queries/useSites";
import { useUsers } from "@/hooks/queries/users";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
  type: "field" | "staff";
  name: string;
  sub: string;
  url: string;
};

interface ActivityNotif {
  id: number;
  user_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  action: string;
  description: string | null;
  timestamp: string;
}

const NOTIF_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  login:            { icon: LogIn,       color: "text-emerald-500", label: "Login" },
  logout:           { icon: LogOut,      color: "text-slate-400",   label: "Logout" },
  password_changed: { icon: Key,         color: "text-amber-500",   label: "Password changed" },
  user_updated:     { icon: UserCog,     color: "text-blue-500",    label: "User updated" },
  user_deleted:     { icon: Trash2,      color: "text-rose-500",    label: "User deleted" },
  failed_login:     { icon: AlertCircle, color: "text-rose-500",    label: "Failed login" },
  force_logout:     { icon: ShieldOff,   color: "text-purple-500",  label: "Force logout" },
  user_created:     { icon: UserIcon,    color: "text-emerald-500", label: "User created" },
};

function wmoIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

/**
 * Full-screen logout overlay.
 * Fades in with a spinner + farewell message; the actual redirect fires after 900ms.
 */
function LogoutOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4 select-none"
      >
        <div className="relative h-12 w-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            style={{ borderTopColor: "hsl(var(--primary))" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Logging out…</p>
          <p className="text-xs text-muted-foreground mt-0.5">See you next time!</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TopNav() {
  const router = useRouter();
  const user = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const { isDark, toggle, mounted } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [readNotifIds, setReadNotifIds] = useState<number[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  // Real weather
  const { position } = useGeolocation();
  const { data: weather } = useWeather(position?.lat ?? null, position?.lng ?? null);

  // Real search data (served from TanStack Query cache — no extra requests)
  const { data: sites = [] } = useSitesList();
  const { data: users = [] } = useUsers();

  // Real notifications from activity log
  const { data: activityLogs = [] } = useQuery<ActivityNotif[]>({
    queryKey: ["notifications-feed"],
    queryFn: async () => {
      const { data } = await api.get<ActivityNotif[]>("/users/logs?limit=10");
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    sites.forEach((s) => {
      if (
        s.site_name.toLowerCase().includes(q) ||
        (s.site_description?.toLowerCase() ?? "").includes(q)
      ) {
        results.push({
          type: "field",
          name: s.site_name,
          sub: s.site_description ?? "Site",
          url: `/fields-map`,
        });
      }
    });

    users.forEach((u) => {
      const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
      if (
        fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      ) {
        results.push({
          type: "staff",
          name: fullName || u.username,
          sub: `${u.role} · ${u.is_active ? "Active" : "Inactive"}`,
          url: "/user-management",
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, sites, users]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      router.push("/login");
    }, 900);
  };

  const markOneRead = (id: number) =>
    setReadNotifIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const unreadCount = activityLogs.filter((n) => !readNotifIds.includes(n.id)).length;

  return (
    <>
      {/* Logout overlay — renders over everything when loggingOut = true */}
      <AnimatePresence>
        {loggingOut && <LogoutOverlay key="logout-overlay" />}
      </AnimatePresence>

      <header className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0">
        <SidebarTrigger className="mr-1" />

        {/* Search — real sites + users */}
        <div ref={searchRef} className="relative hidden md:block flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites, staff..."
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
              onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
              {searchResults.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground text-center">No results found</p>
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
                    <Badge variant="outline" className="text-xs shrink-0">
                      {r.type === "field" ? "site" : "staff"}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Live weather */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          {weather ? (
            <>
              <span className="text-base leading-none">{wmoIcon(weather.conditionCode)}</span>
              <span className="font-medium text-foreground">{weather.temp}°C</span>
              <span className="hidden lg:inline text-xs">{weather.condition}</span>
            </>
          ) : (
            <Cloud className="h-4 w-4 opacity-40" />
          )}
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

        {/* Notifications — real activity log */}
        <Popover>
          <PopoverTrigger>
            <div
              role="button"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              className="inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-md relative text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {/* Badge animates with a spring pop whenever unreadCount changes */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 1.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center pointer-events-none"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b flex items-center justify-between">
              <p className="text-sm font-semibold">Recent Activity</p>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    className="text-xs text-muted-foreground"
                  >
                    {unreadCount} new
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {activityLogs.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No activity yet</p>
              ) : (
                activityLogs.map((n) => {
                  const isRead = readNotifIds.includes(n.id);
                  const meta = NOTIF_META[n.action] ?? {
                    icon: Monitor,
                    color: "text-muted-foreground",
                    label: n.action.replace(/_/g, " "),
                  };
                  const Icon = meta.icon;
                  const actor = n.first_name
                    ? `${n.first_name} ${n.last_name ?? ""}`.trim()
                    : (n.username ?? `User #${n.user_id}`);
                  let timeAgo = "";
                  try { timeAgo = formatDistanceToNow(new Date(n.timestamp), { addSuffix: true }); }
                  catch { timeAgo = ""; }
                  return (
                    <button
                      key={n.id}
                      className={[
                        "w-full flex items-start gap-3 px-3 py-3 text-left",
                        "border-b last:border-0 cursor-pointer",
                        "hover:bg-accent",
                        // Smooth colour transition when going unread → read
                        "transition-colors duration-300",
                        !isRead ? "bg-primary/5" : "",
                      ].join(" ")}
                      onClick={() => markOneRead(n.id)}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!isRead ? "font-medium" : "text-muted-foreground"}`}>
                          {meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {actor}{timeAgo ? ` · ${timeAgo}` : ""}
                        </p>
                      </div>
                      {/* Unread dot scales out when read */}
                      <AnimatePresence>
                        {!isRead && (
                          <motion.div
                            key={`dot-${n.id}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 25 }}
                            className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"
                          />
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })
              )}
            </div>
            {activityLogs.length > 0 && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs hover:bg-accent cursor-pointer"
                  onClick={() => setReadNotifIds(activityLogs.map((n) => n.id))}
                >
                  Mark all as read
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer outline-hidden group">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden md:flex flex-col items-start gap-0.5">
              <p className="text-xs font-semibold leading-none text-foreground">
                {formatUsername(user?.username || "")}
              </p>
              <p className="text-xs text-muted-foreground capitalize leading-none font-normal">
                {user?.role}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
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
    </>
  );
}
