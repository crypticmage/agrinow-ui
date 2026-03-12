export interface OrgMember {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: OrgRole;
  subordinates: OrgMember[];
}

export type OrgRole = "Admin" | "Manager" | "Farmer" | "Agent" | "Analyst";

export interface OrgRoleConfig {
  gradient: string;
  accent: string;
  badgeLight: string;
  badgeDark: string;
  pillLight: string;
  pillDark: string;
  dot: string;
  ringColor: string;
  shadowColor: string;
}

export interface OrgNodeProps {
  node: OrgMember;
  depth?: number;
}

export interface RoleBadgeProps {
  role: OrgRole;
  cfg: OrgRoleConfig;
}

export interface ReportsBadgeProps {
  count: number;
  cfg: OrgRoleConfig;
}

export interface SubtreeRowProps {
  nodes: OrgMember[];
  depth: number;
}
