import { describe, it, expect } from 'vitest'
import { getErrorMessage } from './errors'
import type { ApiError } from './client'

function makeApiError(code: string, message: string): ApiError {
  return {
    timestamp: new Date().toISOString(),
    status: 400,
    error: 'Bad Request',
    code,
    message,
    path: '/api/v1/test',
    traceId: 'trace-123',
  }
}

describe('getErrorMessage', () => {
  it('returns mapped message for known code', () => {
    const err = makeApiError('POSITION_NOT_FOUND', 'fallback')
    expect(getErrorMessage(err)).toBe('Posición no encontrada')
  })

  it('returns mapped message for INVALID_STATE_TRANSITION', () => {
    const err = makeApiError('INVALID_STATE_TRANSITION', 'fallback')
    expect(getErrorMessage(err)).toBe('Transición de estado no válida')
  })

  it('falls back to api message for unknown code', () => {
    const err = makeApiError('UNKNOWN_CODE', 'Mensaje del servidor')
    expect(getErrorMessage(err)).toBe('Mensaje del servidor')
  })

  it('returns mapped message for PROFILE_ALREADY_EXISTS', () => {
    const err = makeApiError('PROFILE_ALREADY_EXISTS', 'fallback')
    expect(getErrorMessage(err)).toBe('El perfil ya existe')
  })

  it('returns mapped message for PRIMARY_FEDERATION_REQUIRED', () => {
    const err = makeApiError('PRIMARY_FEDERATION_REQUIRED', 'fallback')
    expect(getErrorMessage(err)).toBe('Se requiere una federación primaria')
  })
})
