import { useProfile } from '@/features/identity/profile/hooks'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'

export function AuthGuard() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // null significa 404 — no tiene perfil
  if (profile === null) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
