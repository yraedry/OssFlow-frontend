import ky from 'ky'
import type { BeforeRequestState, AfterResponseState } from 'ky'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

function generateTraceId(): string {
  return crypto.randomUUID()
}

export const apiClient = ky.create({
  prefix: BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      ({ request }: BeforeRequestState) => {
        if (!request.headers.get('X-Trace-Id')) {
          request.headers.set('X-Trace-Id', generateTraceId())
        }
      },
    ],
    afterResponse: [
      async ({ response }: AfterResponseState) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new ApiClientError(response.status, error as ApiError)
        }
        return response
      },
    ],
  },
})

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
