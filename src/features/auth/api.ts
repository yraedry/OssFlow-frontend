import ky from 'ky'
import type { AuthResponse, RefreshResponse, RegisterRequest, LoginRequest } from './types'

// Auth endpoints use /api/auth (no /v1 prefix)
const authClient = ky.create({
  prefix: '/api/auth',
  credentials: 'include',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function register(data: RegisterRequest): Promise<void> {
  await authClient.post('register', { json: data })
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return authClient.post('login', { json: data }).json<AuthResponse>()
}

export async function logout(): Promise<void> {
  await authClient.post('logout')
}

export async function refreshToken(): Promise<RefreshResponse> {
  return authClient.post('refresh').json<RefreshResponse>()
}

export async function forgotPassword(email: string): Promise<void> {
  await authClient.post('forgot-password', { json: { email } })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await authClient.post('reset-password', { json: { token, newPassword } })
}

export async function verifyEmail(token: string): Promise<void> {
  await authClient.get('verify-email', { searchParams: { token } })
}

export async function resendVerification(email: string): Promise<void> {
  await authClient.post('resend-verification', { json: { email } })
}
