import { describe, it, expect } from 'vitest'
import { dayEntrySchema, saveWeeklyTemplateSchema } from './schemas'

describe('dayEntrySchema', () => {
  it('accepts a valid entry with sessions', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'MONDAY',
      sessions: [{ type: 'BJJ' }, { type: 'STRENGTH', time: '09:00' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts an entry with no sessions', () => {
    const result = dayEntrySchema.safeParse({ dayOfWeek: 'MONDAY', sessions: [] })
    expect(result.success).toBe(true)
  })

  it('fails if dayOfWeek is invalid', () => {
    const result = dayEntrySchema.safeParse({ dayOfWeek: 'LUNES', sessions: [] })
    expect(result.success).toBe(false)
  })

  it('fails if session type is invalid', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'MONDAY',
      sessions: [{ type: 'YOGA' }],
    })
    expect(result.success).toBe(false)
  })

  it('fails if time format is invalid', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'MONDAY',
      sessions: [{ type: 'BJJ', time: '9:00' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('saveWeeklyTemplateSchema', () => {
  it('accepts a template with valid days', () => {
    const result = saveWeeklyTemplateSchema.safeParse({
      days: [
        { dayOfWeek: 'MONDAY', sessions: [{ type: 'BJJ' }, { type: 'BJJ', time: '19:00' }] },
        { dayOfWeek: 'TUESDAY', sessions: [{ type: 'CARDIO', time: '07:30' }] },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('fails if more than 7 days', () => {
    const days = Array.from({ length: 8 }, () => ({
      dayOfWeek: 'MONDAY',
      sessions: [],
    }))
    const result = saveWeeklyTemplateSchema.safeParse({ days })
    expect(result.success).toBe(false)
  })

  it('accepts empty days array', () => {
    const result = saveWeeklyTemplateSchema.safeParse({ days: [] })
    expect(result.success).toBe(true)
  })

  it('allows multiple sessions of the same type on one day', () => {
    const result = saveWeeklyTemplateSchema.safeParse({
      days: [{
        dayOfWeek: 'WEDNESDAY',
        sessions: [
          { type: 'BJJ', time: '07:00' },
          { type: 'BJJ', time: '19:00' },
          { type: 'MOBILITY' },
        ],
      }],
    })
    expect(result.success).toBe(true)
  })
})
