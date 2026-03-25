import {
  LayoutDashboard,
  Map,
  Sprout,
  Bug,
  ClipboardList,
  UserCheck,
  Wallet,
  TrendingUp,
  FileText,
  Settings,
  Users,
  Activity,
  CalendarDays,
} from "lucide-react";

export const routes = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "manager", "farmer", "agent", "analyst"],
      },
      {
        title: "Fields Map",
        url: "/fields-map",
        icon: Map,
        roles: ["admin", "manager", "farmer", "agent", "analyst"],
      },
    ],
  },
  {
    label: "Crop Management",
    items: [
      {
        title: "Crop Stages",
        url: "/crop-stages",
        icon: Sprout,
        roles: ["admin", "manager", "analyst"],
      },
      {
        title: "Pest & Disease",
        url: "/pest-disease",
        icon: Bug,
        roles: ["admin", "manager", "farmer", "agent"],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Field Visits",
        url: "/field-visits",
        icon: ClipboardList,
        roles: ["admin", "manager", "farmer", "agent", "analyst"],
      },
      {
        title: "Attendance",
        url: "/attendance",
        icon: UserCheck,
        roles: ["admin", "manager", "farmer", "agent", "analyst"],
      },
      {
        title: "Timesheet",
        url: "/timesheet",
        icon: CalendarDays,
        roles: ["admin", "manager"],
      },
      { title: "Payroll", url: "/payroll", icon: Wallet, roles: ["admin"] },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        title: "Yield Forecast",
        url: "/yield-forecast",
        icon: TrendingUp,
        roles: ["admin", "manager", "analyst"],
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
        roles: ["admin", "manager", "analyst"],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "User Management",
        url: "/user-management",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "Activity Log",
        url: "/activity-log",
        icon: Activity,
        roles: ["admin"],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["admin", "manager", "farmer", "agent", "analyst"],
      },
    ],
  },
] as const;

export const tabs = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Map", url: "/fields-map", icon: Map },
  { title: "Pests", url: "/pest-disease", icon: Bug },
  { title: "Visits", url: "/field-visits", icon: ClipboardList },
  { title: "Check-In", url: "/attendance", icon: UserCheck },
];
