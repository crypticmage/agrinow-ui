"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sprout, Map, Users, CheckCircle2, Cloud, Wind,
  Droplets, ThermometerSun, MapPin, TrendingUp, Activity,
  BarChart3, LineChart as LineChartIcon, ShieldCheck, ShieldX, CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cropProgressData, fieldProductivityData, pestFrequencyData } from "@/data/mockData";
import { useAppStore } from "@/stores/appStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageTransition } from "@/components/PageTransition";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeletons";
import { motion } from "framer-motion";
import { useSitesList } from "@/hooks/queries/useSites";
import { useUsers } from "@/hooks/queries/users";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useTeamMonthAttendance } from "@/hooks/queries/useAttendance";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

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
    <Card className="border border-border shadow-sm bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
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
  const simulatedLoading = useSimulatedLoading(600);

  const { data: sites = [], isLoading: sitesLoading } = useSitesList();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const now = new Date();
  const { data: monthAttendance = [] } = useTeamMonthAttendance(
    now.getFullYear(),
    now.getMonth() + 1
  );

  // Daily attendance count for current month
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
        date: format(d, "yyyy-MM-dd"),
        count: map[format(d, "yyyy-MM-dd")] ?? 0,
      }))
      .slice(-14); // last 14 days
  }, [monthAttendance]);

  // Compliance breakdown for current month
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
      { name: "Compliant", value: counts.compliant, color: "hsl(142, 71%, 45%)" },
      { name: "Far from site", value: counts.non_compliant, color: "hsl(0, 72%, 51%)" },
      { name: "No GPS", value: counts.no_location, color: "hsl(38, 92%, 50%)" },
      { name: "No site", value: counts.no_site, color: "hsl(215, 14%, 60%)" },
    ].filter((d) => d.value > 0);
  }, [monthAttendance]);

  const totalCheckins = monthAttendance.length;
  const compliantCount = monthAttendance.filter((r) => r.site_compliance === "compliant").length;
  const complianceRate = totalCheckins > 0 ? Math.round((compliantCount / totalCheckins) * 100) : 0;

  const loading = simulatedLoading || sitesLoading;

  const searchParams = useSearchParams();
  const fromLogin = searchParams.get("from") === "login";
  const [showEntry, setShowEntry] = useState(fromLogin);

  useEffect(() => {
    if (!fromLogin) return;
    const timer = setTimeout(() => setShowEntry(false), 2000);
    return () => clearTimeout(timer);
  }, [fromLogin]);

  const activeSites = sites.filter(
    (s) => !s.close_date || new Date(s.close_date) > new Date()
  );
  const activeUsers = users.filter((u: any) => u.is_active);

  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <PageTransition>
      <div className="space-y-6 relative">
        {showEntry && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 -translate-y-6">
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute h-20 w-20 rounded-full border-2 border-primary/20"
                  style={{ borderTopColor: "hsl(var(--primary))" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="h-12 w-12 rounded-full bg-primary/10"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute flex items-center justify-center"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sprout className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <motion.p
                  className="text-sm font-semibold text-foreground"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  Loading your dashboard
                </motion.p>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1 w-1 rounded-full bg-muted-foreground/50"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              <span className="text-primary">{currentUser?.username ?? "there"}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{today}</p>
          </div>
        </div>

        {/* Stat cards row */}
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
                ...(role === "admin" || role === "manager"
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
                        value: activeSites.length,
                        icon: Map,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50 dark:bg-amber-900/20",
                        border: "bg-amber-500",
                      },
                      {
                        label: "Yield Avg",
                        value: "3.5 t/ac",
                        icon: TrendingUp,
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
                  <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-border shadow-sm bg-card h-full">
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

        {/* Weather card — full width row */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <WeatherCard />
          </motion.div>
        )}

        {/* Sites summary table */}
        {!loading && sites.length > 0 && (
          <Card className="border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
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
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <div className="lg:col-span-2"><ChartSkeleton height={200} /></div>
            </>
          ) : (
            <>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Crop Stage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={cropProgressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="stage" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis allowDecimals={false} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="fields" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-violet-500" />
                    Field Productivity (t/acre)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={fieldProductivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="fill-muted-foreground" tick={{ fontSize: 11 }} />
                      <YAxis className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="yield" fill="hsl(262, 80%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-destructive" />
                    Pest / Disease Reports Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={pestFrequencyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="week" className="fill-muted-foreground" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="count" fill="hsl(0, 72%, 51%)" fillOpacity={0.1} stroke="hsl(0, 72%, 51%)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
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
            {/* Attendance bar chart */}
            <Card className="lg:col-span-2 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
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
                      formatter={(v: any) => [v, "Check-ins"]}
                    />
                    <Bar dataKey="count" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance pie chart */}
            <Card className="border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Site Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={complianceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {complianceData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: 12 }}
                        />
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
