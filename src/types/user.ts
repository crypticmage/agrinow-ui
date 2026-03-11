// Core User entity — used across the whole application
export type UserRole = "Admin" | "Manager" | "Farmer" | "Agent" | "Analyst";

export type EmployeeType = "Full time" | "Part time" | "Contract" | "Intern";

export type Language =
  | "English"
  | "Hindi"
  | "Kannada"
  | "Telugu"
  | "Tamil"
  | "Marathi";

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  language: Language | string;
  role: UserRole | string;
  manager_id: number;
  is_active: boolean;
  hire_date: string;
  relive_date: string;
  emp_type: EmployeeType | string;
  created_dt: string;
}

// Helper to get display name with proper casing
export function formatUserName(firstName: string, lastName: string): string {
  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
}

// Helper to format username display
export function formatUsername(username: string): string {
  if (!username) return "";
  return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
}

export type { User as Users } from "./user";
