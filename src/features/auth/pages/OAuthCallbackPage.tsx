import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/client'
import { refreshToken } from '../api'
import { useAuthStore } from '../store/authStore'
import { AuthLayout, AuthCard } from '../components/AuthLayout'
import { Spinner } from '@/shared/components/ui/spinner'
import { MONO } from '@/shared/lib/typography'
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
    <AuthLayout title="Iniciando sesion" subtitle="Validando con Google">
      <AuthCard>
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner />
          <p className="text-muted-foreground text-xs uppercase tracking-widest" style={MONO}>
            Completando autenticacion...
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
