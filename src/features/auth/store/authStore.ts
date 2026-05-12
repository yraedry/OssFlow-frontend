import { create } from 'zustand'
import type { AuthUser } from '../types'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  isInitialized: boolean
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setAuth: (token, user) => set({ accessToken: token, user, isInitialized: true }),
  clearAuth: () => set({ accessToken: null, user: null, isInitialized: true }),
  setInitialized: () => set({ isInitialized: true }),
}))
