import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export function GuestGuard() {
  const { accessToken, isInitialized } = useAuthStore()

  if (isInitialized && accessToken) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
