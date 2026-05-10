import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAuthStore } from '@/features/auth/store/authStore'
import { refreshToken } from '@/features/auth/api'

export function AuthGuard() {
  const { accessToken, isInitialized, setAuth, clearAuth } = useAuthStore()
  const [checking, setChecking] = useState(!isInitialized)
  const navigate = useNavigate()
  const attempted = useRef(false)

  useEffect(() => {
    // If already initialized with a token, nothing to do
    if (isInitialized) {
      if (!accessToken) {
        navigate('/login', { replace: true })
      }
      return
    }

    // Not initialized — try a silent refresh via cookie
    if (attempted.current) return
    attempted.current = true

    const timeout = setTimeout(() => {
      // Max 3s: give up and redirect to login
      clearAuth()
      navigate('/login', { replace: true })
    }, 3000)

    refreshToken()
      .then((r) => {
        clearTimeout(timeout)
        // We don't have user info yet; set a placeholder — profile query will fill it
        setAuth(r.accessToken, { id: 0, email: '', displayName: null })
        setChecking(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        clearAuth()
        navigate('/login', { replace: true })
      })
  }, [isInitialized, accessToken, setAuth, clearAuth, navigate])

  // Already initialized
  if (isInitialized) {
    if (!accessToken) return null // navigating to /login
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
