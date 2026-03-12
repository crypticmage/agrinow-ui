import { OrgRole, OrgRoleConfig } from "@/types/organisation-chart";

export const ORG_ROLE_CONFIG: Record<OrgRole, OrgRoleConfig> = {
  Admin: {
    gradient: "from-violet-600 to-purple-700",
    accent: "#7c3aed",
    badgeLight: "bg-violet-100 text-violet-700",
    badgeDark: "bg-violet-900/60 text-violet-300",
    pillLight: "bg-violet-50 border-violet-200 text-violet-700",
    pillDark:
      "dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    ringColor: "#a78bfa",
    shadowColor: "rgba(124,58,237,0.22)",
  },
  Manager: {
    gradient: "from-blue-500 to-indigo-600",
    accent: "#3b82f6",
    badgeLight: "bg-blue-100 text-blue-700",
    badgeDark: "bg-blue-900/60 text-blue-300",
    pillLight: "bg-blue-50 border-blue-200 text-blue-700",
    pillDark: "dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    ringColor: "#93c5fd",
    shadowColor: "rgba(59,130,246,0.22)",
  },
  Farmer: {
    gradient: "from-emerald-500 to-teal-600",
    accent: "#10b981",
    badgeLight: "bg-emerald-100 text-emerald-700",
    badgeDark: "bg-emerald-900/60 text-emerald-300",
    pillLight: "bg-emerald-50 border-emerald-200 text-emerald-700",
    pillDark:
      "dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    ringColor: "#6ee7b7",
    shadowColor: "rgba(16,185,129,0.22)",
  },
  Agent: {
    gradient: "from-amber-500 to-orange-600",
    accent: "#f59e0b",
    badgeLight: "bg-amber-100 text-amber-700",
    badgeDark: "bg-amber-900/60 text-amber-300",
    pillLight: "bg-amber-50 border-amber-200 text-amber-700",
    pillDark: "dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    ringColor: "#fcd34d",
    shadowColor: "rgba(245,158,11,0.22)",
  },
  Analyst: {
    gradient: "from-cyan-500 to-sky-600",
    accent: "#06b6d4",
    badgeLight: "bg-cyan-100 text-cyan-700",
    badgeDark: "bg-cyan-900/60 text-cyan-300",
    pillLight: "bg-cyan-50 border-cyan-200 text-cyan-700",
    pillDark: "dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    ringColor: "#67e8f9",
    shadowColor: "rgba(6,182,212,0.22)",
  },
};

// Role Icons (JSX)
export const ORG_ROLE_ICONS: Record<OrgRole, React.ReactNode> = {
  Admin: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-3.5 h-3.5 shrink-0"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Manager: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-3.5 h-3.5 shrink-0"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Farmer: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-3.5 h-3.5 shrink-0"
    >
      <path d="M12 22V12M12 12C12 12 7 9 4 6c5 0 8 2 8 6zM12 12c0 0 5-3 8-6-5 0-8 2-8 6z" />
      <path d="M5 22h14" />
    </svg>
  ),
  Agent: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-3.5 h-3.5 shrink-0"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4" />
    </svg>
  ),
  Analyst: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-3.5 h-3.5 shrink-0"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
};
