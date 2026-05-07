import { describe, it, expect } from 'vitest'
import { dayEntrySchema, saveWeeklyTemplateSchema } from './schemas'

describe('dayEntrySchema', () => {
  it('accepts a valid entry', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'MONDAY',
      bjj: true,
      strength: false,
      cardio: true,
    })
    expect(result.success).toBe(true)
  })

  it('fails if dayOfWeek is invalid', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'LUNES',
      bjj: true,
      strength: false,
      cardio: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('saveWeeklyTemplateSchema', () => {
  it('accepts a template with valid days', () => {
    const result = saveWeeklyTemplateSchema.safeParse({
      days: [
        { dayOfWeek: 'MONDAY', bjj: true, strength: true, cardio: true },
        { dayOfWeek: 'TUESDAY', bjj: false, strength: false, cardio: true },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('fails if more than 7 days', () => {
    const days = Array.from({ length: 8 }, () => ({
      dayOfWeek: 'MONDAY',
      bjj: false,
      strength: false,
      cardio: false,
    }))
    const result = saveWeeklyTemplateSchema.safeParse({ days })
    expect(result.success).toBe(false)
  })

  it('accepts empty days array', () => {
    const result = saveWeeklyTemplateSchema.safeParse({ days: [] })
    expect(result.success).toBe(true)
  })
})
