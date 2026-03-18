export type AuthRole = 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst' | null

export interface AuthUser {
  id?: string
  username: string | null
  email: string
  role: AuthRole
}

export interface LoginResponse {
  access_token: string
  token_type: string
  username: string
  email: string
  role: string
}
