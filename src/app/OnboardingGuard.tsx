import { useEffect, useState } from 'react'
import { useProfile } from '@/features/identity/profile/hooks'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'

export function OnboardingGuard() {
  const { data: profile, isLoading, isError } = useProfile()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) return
    const t = setTimeout(() => setTimedOut(true), 6000)
    return () => clearTimeout(t)
  }, [isLoading])

  if (isLoading && !timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // Backend caído o timeout → dejamos ver onboarding igualmente
  if (isError || timedOut) {
    return <Outlet />
  }

  if (profile !== null && profile !== undefined) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
