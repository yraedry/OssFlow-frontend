import { useProfile } from '@/features/identity/profile/hooks'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'

export function OnboardingGuard() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (profile !== null && profile !== undefined) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
