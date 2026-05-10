import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../types'

interface ProfileResponse {
  id: number
  displayName: string | null
  ownerId: number
}

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    // Read access token from URL hash: #token=<AT>
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const token = params.get('token')

    // Clear the hash from URL immediately (token should not linger)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    if (!token) {
      clearAuth()
      navigate('/login', { replace: true })
      return
    }

    // Fetch user profile to get displayName and user id
    apiClient
      .get('identity/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .json<ProfileResponse>()
      .then((profile) => {
        const user: AuthUser = {
          id: profile.ownerId,
          email: '', // Email not in profile response — OK for OAuth
          displayName: profile.displayName,
        }
        setAuth(token, user)
        navigate('/', { replace: true })
      })
      .catch(() => {
        // Profile may not exist yet (first OAuth login) — still set auth
        const user: AuthUser = { id: 0, email: '', displayName: null }
        setAuth(token, user)
        navigate('/', { replace: true })
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
