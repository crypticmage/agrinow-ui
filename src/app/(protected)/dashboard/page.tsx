"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sprout,
  Map,
  Bug,
  TrendingUp,
  Users,
  Cloud,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockFields,
  mockStaff,
  mockWeather,
  cropProgressData,
  fieldProductivityData,
  pestFrequencyData,
} from "@/data/mockData";
import { useAppStore } from "@/stores/appStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { PageTransition } from "@/components/PageTransition";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import {
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "@/components/Skeletons";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Total Fields",
    value: "5",
    icon: Map,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "bg-primary",
  },
  {
    label: "Active Stages",
    value: "5",
    icon: Sprout,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "bg-secondary",
  },
  {
    label: "Pest Alerts",
    value: "3",
    icon: Bug,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "bg-destructive",
  },
  {
    label: "Yield Avg",
    value: "3.5 t/ac",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "bg-primary",
  },
  {
    label: "Staff Active",
    value: `${mockStaff.filter((s) => s.status === "active").length}`,
    icon: Users,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "bg-accent",
  },
  {
    label: "Weather",
    value: `${mockWeather.temp}°C`,
    icon: Cloud,
    color: "text-info",
    bg: "bg-info/10",
    border: "bg-info",
  },
];

const Dashboard = () => {
  const role = useAppStore((s) => s.currentUser?.role);
  const loading = useSimulatedLoading(1000);
  const searchParams = useSearchParams();
  const fromLogin = searchParams.get("from") === "login";
  const [showEntry, setShowEntry] = useState(fromLogin);

  useEffect(() => {
    if (!fromLogin) return;
    const timer = setTimeout(() => setShowEntry(false), 2000);
    return () => clearTimeout(timer);
  }, [fromLogin]);

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
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute flex items-center justify-center"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
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
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.18,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of your seed farm operations
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : stats.map((stat) => (
                <Card
                  key={stat.label}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-border shadow-sm bg-card"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-0.75 ${stat.border}`}
                  />
                  <CardContent className="px-4 py-3.5 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors group-hover:bg-muted ${stat.bg} ${stat.color}`}
                    >
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p className="font-medium text-muted-foreground text-[11px] truncate leading-tight mb-0.5">
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold tracking-tight text-foreground leading-tight">
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <div className="lg:col-span-2">
                <ChartSkeleton height={200} />
              </div>
            </>
          ) : (
            <>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Crop Stage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={cropProgressData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="stage"
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        allowDecimals={false}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar
                        dataKey="fields"
                        fill="hsl(122, 46%, 33%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-secondary" />
                    Field Productivity (t/acre)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={fieldProductivityData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis dataKey="name" className="fill-muted-foreground" />
                      <YAxis className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar
                        dataKey="yield"
                        fill="hsl(122, 40%, 57%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-destructive" />
                    Pest/Disease Reports Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={pestFrequencyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis dataKey="week" className="fill-muted-foreground" />
                      <YAxis
                        allowDecimals={false}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        fill="hsl(0, 72%, 51%)"
                        fillOpacity={0.1}
                        stroke="hsl(0, 72%, 51%)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Field Overview Table */}
        {loading ? (
          <TableSkeleton title="Field Overview" rows={5} cols={6} />
        ) : (
          <Card className="animate-fade-in hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Field Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Field</th>
                      <th className="pb-2 font-medium">Crop</th>
                      <th className="pb-2 font-medium">Stage</th>
                      <th className="pb-2 font-medium">Health</th>
                      <th className="pb-2 font-medium">Yield (t/ac)</th>
                      <th className="pb-2 font-medium">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockFields.map((field) => (
                      <tr
                        key={field.id}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-2.5 font-medium">{field.name}</td>
                        <td className="py-2.5">{field.crop}</td>
                        <td className="py-2.5 capitalize">
                          {field.stage.replace("-", " ")}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              field.health === "good"
                                ? "bg-primary/10 text-primary"
                                : field.health === "moderate"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {field.health}
                          </span>
                        </td>
                        <td className="py-2.5">{field.yieldPrediction}</td>
                        <td className="py-2.5">{field.issues}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
