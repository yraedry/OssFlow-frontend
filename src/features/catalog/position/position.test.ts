import { describe, it, expect } from 'vitest'
import type { Position } from './types'
import { createPositionSchema } from './schemas'

describe('Position schemas', () => {
  it('validates a valid position', () => {
    const result = createPositionSchema.safeParse({
      name: 'Guardia cerrada',
      type: 'BOTTOM',
      visibility: 'PRIVATE',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createPositionSchema.safeParse({
      name: '',
      type: 'TOP',
      visibility: 'PUBLIC',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = createPositionSchema.safeParse({
      name: 'Test',
      type: 'INVALID',
      visibility: 'PUBLIC',
    })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 120 chars', () => {
    const result = createPositionSchema.safeParse({
      name: 'a'.repeat(121),
      type: 'NEUTRAL',
      visibility: 'PRIVATE',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional description', () => {
    const result = createPositionSchema.safeParse({
      name: 'Test',
      type: 'TOP',
      visibility: 'PUBLIC',
      description: 'Descripción opcional',
    })
    expect(result.success).toBe(true)
  })
})

describe('Position type', () => {
  it('has correct shape', () => {
    const pos: Position = {
      id: 1,
      name: 'Guardia',
      type: 'BOTTOM',
      visibility: 'PRIVATE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(pos.id).toBe(1)
    expect(pos.type).toBe('BOTTOM')
  })
})
