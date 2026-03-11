import { Map, Sprout, Bug, TrendingUp, Users, Cloud } from "lucide-react";

export const dashboardStatsConfig = [
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
    key: "staffActive",
    icon: Users,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "bg-accent",
  },
  {
    label: "Weather",
    key: "weather",
    icon: Cloud,
    color: "text-info",
    bg: "bg-info/10",
    border: "bg-info",
  },
];
