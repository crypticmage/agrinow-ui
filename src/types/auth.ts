export type AuthRole = "admin" | "manager" | "staff" | null;

export interface AuthUser {
  id: string;
  userName: string | null;
  email: string;
  role: AuthRole;
  avatar?: string;
  exp?: number | null;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user?: {
    username?: string;
    role?: AuthRole;
    email?: string;
  };
  username?: string;
  role?: AuthRole;
  email?: string;
}

export type { AuthUser as User, AuthRole as UserRole } from "./auth";
