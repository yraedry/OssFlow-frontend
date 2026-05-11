import { describe, it, expect } from 'vitest'
import { ApiClientError, type ApiError } from './client'

describe('ApiClientError', () => {
  it('is constructible — declarated before use in module body', () => {
    // A10 regression: ApiClientError debe estar definida antes que apiClient
    // (que la usa en hooks). Si volviese a moverse abajo, este test seguiría
    // pasando pero también probamos importación directa para detectar el
    // tipo de bug que era un ReferenceError en runtime.
    const apiError: ApiError = {
      timestamp: '2026-01-01T00:00:00Z',
      status: 401,
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      message: 'Sesión expirada',
      path: '/api/v1/x',
      traceId: 't-1',
    }
    const err = new ApiClientError(401, apiError)
    expect(err.status).toBe(401)
    expect(err.message).toBe('Sesión expirada')
    expect(err.name).toBe('ApiClientError')
    expect(err.apiError.code).toBe('UNAUTHORIZED')
  })

  it('is an instance of Error', () => {
    const err = new ApiClientError(500, {
      timestamp: '',
      status: 500,
      error: 'x',
      code: 'X',
      message: 'boom',
      path: '',
      traceId: '',
    })
    expect(err).toBeInstanceOf(Error)
  })
})
