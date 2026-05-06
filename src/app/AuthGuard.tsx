import { useProfile } from '@/features/identity/profile/hooks'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'

export function AuthGuard() {
  const { data: profile, isLoading, isError } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // Error de red (backend caído) → dejamos pasar a la app
  if (isError) {
    return <Outlet />
  }

  // null significa 404 — no tiene perfil todavía
  if (profile === null) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
