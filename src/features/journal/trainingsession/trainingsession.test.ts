import { describe, it, expect } from 'vitest'
import { createTrainingSessionSchema } from './schemas'

describe('TrainingSession schema', () => {
  it('validates valid session', () => {
    expect(createTrainingSessionSchema.safeParse({
      sessionDate: '2026-05-06', durationMinutes: 90, intensity: 'MODERATE'
    }).success).toBe(true)
  })
  it('rejects zero duration', () => {
    expect(createTrainingSessionSchema.safeParse({
      sessionDate: '2026-05-06', durationMinutes: 0, intensity: 'HARD'
    }).success).toBe(false)
  })
  it('rejects invalid intensity', () => {
    expect(createTrainingSessionSchema.safeParse({
      sessionDate: '2026-05-06', durationMinutes: 60, intensity: 'EXTREME'
    }).success).toBe(false)
  })
})
