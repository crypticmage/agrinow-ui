"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Map, Users, CheckCircle2, Cloud, Wind,
  Droplets, ThermometerSun, MapPin, Activity,
  BarChart3, LineChart as LineChartIcon, ShieldCheck, CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/stores/appStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { PageTransition } from "@/components/PageTransition";
import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeletons";
import { motion } from "framer-motion";
import { useSitesList, useMySites } from "@/hooks/queries/useSites";
import { useUsers } from "@/hooks/queries/users";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useTeamMonthAttendance, useMyAttendanceHistory } from "@/hooks/queries/useAttendance";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek } from "date-fns";

function WeatherCard() {
  const { position, loading: geoLoading, error: geoError } = useGeolocation();
  const { data: weather, isLoading: weatherLoading } = useWeather(
    position?.lat ?? null,
    position?.lng ?? null
  );

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

  if (geoError) {
    return (
      <Card className="border border-border shadow-sm bg-card">
        <CardContent className="px-5 py-4 flex items-center gap-3">
          <Cloud className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Weather</p>
            <p className="text-sm text-muted-foreground mt-0.5">Enable location to see weather</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (geoLoading || weatherLoading || !weather) {
    return (
      <Card className="border border-border shadow-sm animate-pulse">
        <CardContent className="px-5 py-4 h-20" />
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm bg-card">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="text-5xl leading-none">{wmoIcon(weather.conditionCode)}</div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{weather.temp}°C</span>
                <span className="text-sm text-muted-foreground">{weather.condition}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {weather.city}{weather.country ? `, ${weather.country}` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ThermometerSun, label: 'Feels like', value: `${weather.feelsLike}°C` },
              { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
              { icon: Cloud, label: 'H / L', value: `${weather.high}° / ${weather.low}°` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg bg-muted/40 px-3 py-2 text-center">
                <Icon className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const DashboardContent = () => {
  const { currentUser } = useAppStore();
  const role = currentUser?.role;
  const isAdminOrManager = role === "admin" || role === "manager";

  const { data: sites = [], isLoading: sitesLoading } = useSitesList();
  const { data: mySites = [] } = useMySites();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: myAttendance = [] } = useMyAttendanceHistory();

  const now = new Date();
  const { data: monthAttendance = [] } = useTeamMonthAttendance(
    now.getFullYear(),
    now.getMonth() + 1
  );

  // Daily check-ins for current month (admin/manager)
  const attendanceByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of monthAttendance) {
      map[r.date] = (map[r.date] ?? 0) + 1;
    }
    const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
    return days
      .filter((d) => d <= now)
      .map((d) => ({
        day: format(d, "d"),
        count: map[format(d, "yyyy-MM-dd")] ?? 0,
      }))
      .slice(-14);
  }, [monthAttendance]);

  // Compliance breakdown (admin/manager)
  const complianceData = useMemo(() => {
    const counts = { compliant: 0, non_compliant: 0, no_location: 0, no_site: 0 };
    for (const r of monthAttendance) {
      const c = r.site_compliance;
      if (c === "compliant") counts.compliant++;
      else if (c === "non_compliant") counts.non_compliant++;
      else if (c === "no_location") counts.no_location++;
      else counts.no_site++;
    }
    return [
      { name: "Compliant",     value: counts.compliant,     color: "hsl(142, 71%, 45%)" },
      { name: "Far from site", value: counts.non_compliant, color: "hsl(0, 72%, 51%)" },
      { name: "No GPS",        value: counts.no_location,   color: "hsl(38, 92%, 50%)" },
      { name: "No site",       value: counts.no_site,       color: "hsl(215, 14%, 60%)" },
    ].filter((d) => d.value > 0);
  }, [monthAttendance]);

  const totalCheckins = monthAttendance.length;
  const compliantCount = monthAttendance.filter((r) => r.site_compliance === "compliant").length;
  const complianceRate = totalCheckins > 0 ? Math.round((compliantCount / totalCheckins) * 100) : 0;

  // ── Real chart data ──────────────────────────────────────────────────────────

  // Chart 1: Sites registered per month (last 8 months)
  const sitesByMonth = useMemo(() => {
    const map: Record<number, { label: string; count: number }> = {};
    sites.forEach((s) => {
      const d = new Date(s.created_date);
      const key = d.getFullYear() * 100 + (d.getMonth() + 1);
      if (!map[key]) map[key] = { label: format(d, "MMM yy"), count: 0 };
      map[key].count++;
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .slice(-8)
      .map(([, v]) => v);
  }, [sites]);

  // Chart 2: Team composition by role
  const teamByRole = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => {
      const r = u.role.charAt(0).toUpperCase() + u.role.slice(1);
      map[r] = (map[r] ?? 0) + 1;
    });
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  }, [users]);

  // Chart 3: My weekly check-ins (last 8 weeks)
  const myWeeklyCheckins = useMemo(() => {
    const map: Record<string, number> = {};
    myAttendance.filter((r) => r.check_in).forEach((r) => {
      const weekStart = format(startOfWeek(parseISO(r.date), { weekStartsOn: 1 }), "MMM d");
      map[weekStart] = (map[weekStart] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-8)
      .map(([week, count]) => ({ week, count }));
  }, [myAttendance]);

  // My check-ins this month (stat card for non-admin)
  const myCheckinsThisMonth = useMemo(() => {
    return myAttendance.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.check_in;
    }).length;
  }, [myAttendance]);

  const loading = sitesLoading || (isAdminOrManager && usersLoading);

  const activeSites = sites.filter((s) => !s.close_date || new Date(s.close_date) > new Date());
  const activeMySites = mySites.filter((s) => !s.close_date || new Date(s.close_date) > new Date());
  const activeUsers = users.filter((u) => u.is_active);

  const searchParams = useSearchParams();
  const fromLogin = searchParams.get("from") === "login";
  const [showEntry, setShowEntry] = useState(fromLogin);

  useEffect(() => {
    if (!fromLogin) return;
    const timer = setTimeout(() => setShowEntry(false), 800);
    return () => clearTimeout(timer);
  }, [fromLogin]);

  const today = format(now, "EEEE, MMMM d");

  return (
    <PageTransition>
      <div className="space-y-6 relative">
        {showEntry && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="h-10 w-10 rounded-full border-2 border-primary/20"
                style={{ borderTopColor: "hsl(var(--primary))" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-sm text-muted-foreground">Loading dashboard…</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Good {now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"},{" "}
              <span className="text-primary">{currentUser?.username ?? "there"}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{today}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              {[
                {
                  label: "Total Sites",
                  value: sites.length,
                  icon: Map,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-900/20",
                  border: "bg-emerald-500",
                },
                {
                  label: "Active Sites",
                  value: activeSites.length,
                  icon: CheckCircle2,
                  color: "text-green-600 dark:text-green-400",
                  bg: "bg-green-50 dark:bg-green-900/20",
                  border: "bg-green-500",
                },
                ...(isAdminOrManager
                  ? [
                      {
                        label: "Total Staff",
                        value: users.length,
                        icon: Users,
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-50 dark:bg-blue-900/20",
                        border: "bg-blue-500",
                      },
                      {
                        label: "Active Staff",
                        value: activeUsers.length,
                        icon: Activity,
                        color: "text-violet-600 dark:text-violet-400",
                        bg: "bg-violet-50 dark:bg-violet-900/20",
                        border: "bg-violet-500",
                      },
                    ]
                  : [
                      {
                        label: "My Sites",
                        value: activeMySites.length,
                        icon: Map,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50 dark:bg-amber-900/20",
                        border: "bg-amber-500",
                      },
                      {
                        label: "Check-ins",
                        value: myCheckinsThisMonth,
                        icon: CheckCircle2,
                        color: "text-teal-600 dark:text-teal-400",
                        bg: "bg-teal-50 dark:bg-teal-900/20",
                        border: "bg-teal-500",
                      },
                    ]),
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card className="group relative overflow-hidden border border-border shadow-sm bg-card h-full">
                    <div className={`absolute top-0 left-0 w-full h-0.5 ${stat.border}`} />
                    <CardContent className="px-3.5 py-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider truncate leading-tight">
                          {stat.label}
                        </p>
                        <p className="text-xl font-bold tracking-tight text-foreground leading-tight">
                          {stat.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Weather card */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <WeatherCard />
          </motion.div>
        )}

        {/* Sites summary table */}
        {!loading && sites.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                Sites Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Site</th>
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium">Created</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.slice(0, 8).map((site) => {
                      const isActive = !site.close_date || new Date(site.close_date) > new Date();
                      return (
                        <tr key={site.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-2.5 font-medium">{site.site_name}</td>
                          <td className="py-2.5 text-muted-foreground max-w-xs truncate">{site.site_description}</td>
                          <td className="py-2.5 text-muted-foreground text-xs">
                            {format(new Date(site.created_date), "MMM d, yyyy")}
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {isActive ? "Active" : "Closed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {sites.length > 8 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    +{sites.length - 8} more sites
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Charts — all real data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <div className="lg:col-span-2"><ChartSkeleton height={200} /></div>
            </>
          ) : (
            <>
              {/* Sites registered per month */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Sites by Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sitesByMonth.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No site data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={sitesByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="count" name="Sites" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              </motion.div>

              {/* Team by role */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-violet-500" />
                    Team by Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamByRole.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No team data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={teamByRole}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="role" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="count" name="Members" fill="hsl(262, 80%, 60%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              </motion.div>

              {/* My weekly check-ins — full width */}
              <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}>
              <Card className="w-full border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-primary" />
                    My Check-ins — Weekly Trend
                    <span className="ml-auto text-xs font-normal text-muted-foreground">last 8 weeks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myWeeklyCheckins.length === 0 ? (
                    <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">No check-in history yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={myWeeklyCheckins}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} formatter={(v) => [v ?? 0, "Check-ins"]} />
                        <Area type="monotone" dataKey="count" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Attendance & Compliance — admin/manager only */}
        {!loading && isAdminOrManager && monthAttendance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <Card className="lg:col-span-2 border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Daily Check-ins — {format(now, "MMMM yyyy")}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{totalCheckins} total</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={attendanceByDay} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={28} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                      formatter={(v) => [v ?? 0, "Check-ins"]}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Site Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {complianceData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    No compliance data yet
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={complianceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                            {complianceData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-foreground">{complianceRate}%</span>
                        <span className="text-[10px] text-muted-foreground">compliant</span>
                      </div>
                    </div>
                    <div className="w-full space-y-1.5">
                      {complianceData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                          <span className="font-medium text-foreground">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export function DashboardClient() {
  return (
    <Suspense fallback={<div className="p-6"><StatCardSkeleton /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
