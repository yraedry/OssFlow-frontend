import ky from 'ky'
import type { BeforeRequestState, AfterResponseState } from 'ky'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export interface ApiError {
  timestamp: string
  status: number
  error: string
  code: string
  message: string
  path: string
  traceId: string
  fieldErrors?: { field: string; rejectedValue: unknown; message: string }[]
  details?: Record<string, unknown>
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly apiError: ApiError,
  ) {
    super(apiError.message)
    this.name = 'ApiClientError'
  }
}

function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Single in-flight refresh. Si 2 requests reciben 401 simultáneamente, solo
// una dispara refresh y la otra await la misma promesa.
let refreshPromise: Promise<string> | null = null

async function silentRefresh(): Promise<string> {
  if (!refreshPromise) {
    const work = (async () => {
      const { refreshToken } = await import('@/features/auth/api')
      const { useAuthStore } = await import('@/features/auth/store/authStore')
      try {
        const r = await refreshToken()
        const user = useAuthStore.getState().user
        if (user) {
          useAuthStore.getState().setAuth(r.accessToken, user)
        } else {
          useAuthStore.getState().setAuth(r.accessToken, { id: 0, email: '', displayName: null })
        }
        return r.accessToken
      } catch (e) {
        useAuthStore.getState().clearAuth()
        throw e
      }
    })()
    // Encadenamos cleanup sin reasignar; el cliente recibe SIEMPRE la promesa original.
    work.finally(() => {
      refreshPromise = null
    })
    refreshPromise = work
  }
  return refreshPromise
}

export const apiClient = ky.create({
  prefix: BASE_URL,
  timeout: 10_000,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      async ({ request }: BeforeRequestState) => {
        if (!request.headers.get('X-Trace-Id')) {
          request.headers.set('X-Trace-Id', generateTraceId())
        }
        try {
          const { useAuthStore } = await import('@/features/auth/store/authStore')
          const token = useAuthStore.getState().accessToken
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
        } catch {
          // Store not ready yet
        }
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }: AfterResponseState) => {
        if (response.status === 401 && retryCount === 0) {
          try {
            const newToken = await silentRefresh()
            const headers = new Headers(request.headers)
            headers.set('Authorization', `Bearer ${newToken}`)
            return ky.retry({ request: new Request(request, { headers }) })
          } catch {
            try {
              const { useAuthStore } = await import('@/features/auth/store/authStore')
              useAuthStore.getState().clearAuth()
            } catch {
              // ignore
            }
            window.location.href = '/login'
            throw new ApiClientError(401, {
              timestamp: new Date().toISOString(),
              status: 401,
              error: 'Unauthorized',
              code: 'UNAUTHORIZED',
              message: 'Sesión expirada. Redirigiendo al login...',
              path: '',
              traceId: '',
            })
          }
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new ApiClientError(response.status, error as ApiError)
        }
        return response
      },
    ],
  },
})
