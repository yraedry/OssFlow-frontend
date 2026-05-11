import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/client'
import { refreshToken } from '../api'
import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../types'

interface ProfileResponse {
  id: number
  displayName: string | null
  ownerId: number
}

// El backend redirige aquí tras OAuth2 success con cookie HttpOnly ya seteada.
// El access token NO viaja por URL (A11): lo obtenemos con un silent refresh
// sobre la cookie que acabamos de recibir.
export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ok = params.get('ok')

    // Limpia query inmediatamente.
    window.history.replaceState(null, '', window.location.pathname)

    if (ok !== '1') {
      clearAuth()
      navigate('/login', { replace: true })
      return
    }

    refreshToken()
      .then(async (r) => {
        const profile = await apiClient
          .get('identity/profile', { headers: { Authorization: `Bearer ${r.accessToken}` } })
          .json<ProfileResponse>()
          .catch(() => null)
        const user: AuthUser = profile
          ? { id: profile.ownerId, email: '', displayName: profile.displayName }
          : { id: 0, email: '', displayName: null }
        setAuth(r.accessToken, user)
        navigate(profile ? '/' : '/onboarding', { replace: true })
      })
      .catch(() => {
        clearAuth()
        navigate('/login?error=oauth_failed', { replace: true })
      })
  }, [navigate, setAuth, clearAuth])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Completando autenticación...</p>
      </div>
    </div>
  )
}
