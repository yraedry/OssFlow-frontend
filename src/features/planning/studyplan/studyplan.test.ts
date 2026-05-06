import { describe, it, expect } from 'vitest'
import { createStudyPlanSchema } from './schemas'

describe('StudyPlan schemas', () => {
  it('validates a valid plan', () => {
    const result = createStudyPlanSchema.safeParse({
      title: 'Plan verano',
      startDate: '2026-06-01',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = createStudyPlanSchema.safeParse({
      title: '',
      startDate: '2026-06-01',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional endDate', () => {
    const result = createStudyPlanSchema.safeParse({
      title: 'Plan',
      startDate: '2026-06-01',
      endDate: '2026-09-01',
    })
    expect(result.success).toBe(true)
  })
})
