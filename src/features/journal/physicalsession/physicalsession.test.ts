import { describe, it, expect } from 'vitest'
import { createPhysicalSessionSchema } from './schemas'

describe('createPhysicalSessionSchema', () => {
  it('acepta un registro válido', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionDate: '2026-05-07',
      sessionType: 'STRENGTH',
      title: 'Fuerza — Empuje',
      durationMinutes: 60,
    })
    expect(result.success).toBe(true)
  })

  it('falla si falta sessionDate', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionType: 'CARDIO',
      title: 'Cardio',
    })
    expect(result.success).toBe(false)
  })

  it('falla si sessionType no es válido', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionDate: '2026-05-07',
      sessionType: 'YOGA',
      title: 'Yoga',
    })
    expect(result.success).toBe(false)
  })

  it('acepta sin durationMinutes (opcional)', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionDate: '2026-05-07',
      sessionType: 'OTHER',
      title: 'Caminata',
    })
    expect(result.success).toBe(true)
  })
})
