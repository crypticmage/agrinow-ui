import {
  Users2,
  UserCheck,
  UserX,
  ShieldCheck,
  Shield,
  CircleDot,
  X,
} from "lucide-react";

export const statCardsConfig = [
  {
    key: "total",
    label: "Total Users",
    icon: Users2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    key: "active",
    label: "Active",
    icon: UserCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    key: "inactive",
    label: "Inactive",
    icon: UserX,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
];

export const roleConfig: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/20",
  },
  manager: {
    label: "Manager",
    icon: Shield,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/20",
  },
  farmer: {
    label: "Farmer",
    icon: UserCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
  agent: {
    label: "Agent",
    icon: UserCheck,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
  },
  analyst: {
    label: "Analyst",
    icon: UserCheck,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    border: "border-cyan-200 dark:border-cyan-500/20",
  },
};

export const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
];

export const languageOptions = [
  "English",
  "Hindi",
  "Kannada",
  "Telugu",
  "Tamil",
  "Marathi",
];
export const roleOptions = ["Admin", "Manager", "Farmer", "Agent", "Analyst"];
export const employmentTypeOptions = [
  "Full time",
  "Part time",
  "Contract",
  "Intern",
];

export const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  active: {
    label: "Active",
    icon: CircleDot,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
  inactive: {
    label: "Inactive",
    icon: X,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/20",
  },
};
