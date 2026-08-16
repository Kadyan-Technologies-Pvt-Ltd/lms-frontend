export type UserRole = 'ADMIN' | 'MEMBER'

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  is_active: boolean
  is_blacklisted: boolean
  date_joined: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  role: UserRole
  user: User
}

export interface RefreshResponse {
  access: string
}
