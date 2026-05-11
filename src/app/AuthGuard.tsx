import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAuthStore } from '@/features/auth/store/authStore'
import { refreshToken } from '@/features/auth/api'
import { apiClient } from '@/shared/api/client'
import { ApiClientError } from '@/shared/api/client'

interface ProfileResponse {
  id: number
  displayName: string | null
  ownerId: number
}

export function AuthGuard() {
  const { accessToken, isInitialized, setAuth, clearAuth } = useAuthStore()
  const [checking, setChecking] = useState(!isInitialized)
  const navigate = useNavigate()
  const attempted = useRef(false)

  useEffect(() => {
    if (isInitialized) {
      if (!accessToken) {
        navigate('/login', { replace: true })
      }
      return
    }

    if (attempted.current) return
    attempted.current = true

    const timeout = setTimeout(() => {
      clearAuth()
      navigate('/login', { replace: true })
    }, 3000)

    refreshToken()
      .then(async (r) => {
        clearTimeout(timeout)
        // Placeholder mientras cargamos profile; setAuth define isInitialized=true.
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
          // Profile no existe → primer login OAuth o usuario sin onboarding.
          if (e instanceof ApiClientError && e.status === 404) {
            navigate('/onboarding', { replace: true })
            return
          }
          // Otro error: dejamos el placeholder, AuthGuard ya pasa el outlet.
        }
        setChecking(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        clearAuth()
        navigate('/login', { replace: true })
      })
  }, [isInitialized, accessToken, setAuth, clearAuth, navigate])

  if (isInitialized) {
    if (!accessToken) return null
    return <Outlet />
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return <Outlet />
}
