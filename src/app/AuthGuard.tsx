import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAuthStore } from '@/features/auth/store/authStore'
import { refreshToken } from '@/features/auth/api'
import { apiClient } from '@/shared/api/client'
import { ApiClientError } from '@/shared/api/client'
import { LandingPage } from '@/features/auth/pages/LandingPage'

interface ProfileResponse {
  id: number
  displayName: string | null
  ownerId: number
}

export function AuthGuard() {
  const { accessToken, isInitialized, setAuth, clearAuth } = useAuthStore()
  const [checking, setChecking] = useState(!isInitialized)
  const navigate = useNavigate()
  const location = useLocation()
  const attempted = useRef(false)

  useEffect(() => {
    if (isInitialized) return

    if (attempted.current) return
    attempted.current = true

    const timeout = setTimeout(() => {
      clearAuth()
      setChecking(false)
    }, 3000)

    refreshToken()
      .then(async (r) => {
        clearTimeout(timeout)
        setAuth(r.accessToken, { id: 0, email: '', displayName: null })
        try {
          const profile = await apiClient
            .get('identity/profile', { headers: { Authorization: `Bearer ${r.accessToken}` } })
            .json<ProfileResponse>()
          setAuth(r.accessToken, {
            id: profile.ownerId,
            email: '',
            displayName: profile.displayName,
          })
        } catch (e) {
          if (e instanceof ApiClientError && e.status === 404) {
            navigate('/onboarding', { replace: true })
            return
          }
        }
        setChecking(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        clearAuth()
        setChecking(false)
      })
  }, [isInitialized, setAuth, clearAuth, navigate])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // Sin sesión activa: si estamos en /, mostramos el landing.
  // Para cualquier otra ruta protegida (/diario/*, /estudio/*, etc.)
  // redirigimos al login para no perder la intención de navegación.
  if (!accessToken) {
    if (location.pathname === '/') {
      return <LandingPage />
    }
    navigate('/login', { replace: true })
    return null
  }

  return <Outlet />
}
