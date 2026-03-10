export type UserRole = "admin" | "manager" | "staff" | null;

export interface User {
  id: string;
  userName: string | null;
  email: string;
  role: UserRole;
  avatar?: string;
}
