import { useEffect, useState } from 'react'
import { useProfile } from '@/features/identity/profile/hooks'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'

export function AuthGuard() {
  const { data: profile, isLoading, isError } = useProfile()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    // Fallback: si tras 5s sigue en estado de carga, forzamos el paso
    // Usamos un flag para ignorar la limpieza de StrictMode
    let active = true
    const t = setTimeout(() => {
      if (active) setTimedOut(true)
    }, 5000)
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [])

  // La query terminó (éxito, error 404, o error de red) — mostrar contenido
  const resolved = !isLoading

  if (!resolved && !timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (isError || timedOut) {
    return <Outlet />
  }

  if (profile === null) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
