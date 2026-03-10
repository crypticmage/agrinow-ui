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
} from "lucide-react";

export const routes = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "manager", "staff"],
      },
      {
        title: "Fields Map",
        url: "/fields-map",
        icon: Map,
        roles: ["admin", "manager", "staff"],
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
        roles: ["admin", "manager"],
      },
      {
        title: "Pest & Disease",
        url: "/pest-disease",
        icon: Bug,
        roles: ["admin", "manager", "staff"],
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
        roles: ["admin", "manager", "staff"],
      },
      {
        title: "Attendance",
        url: "/attendance",
        icon: UserCheck,
        roles: ["admin", "manager", "staff"],
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
        roles: ["admin", "manager"],
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
        roles: ["admin", "manager"],
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
        roles: ["admin", "manager", "staff"],
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
