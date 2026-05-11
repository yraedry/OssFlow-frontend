export interface AuthUser {
  id: number
  email: string
  displayName: string | null
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}
