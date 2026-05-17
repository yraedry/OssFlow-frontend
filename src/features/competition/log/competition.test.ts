import { describe, it, expect } from 'vitest'
import { createCompetitionLogSchema } from './schemas'
import { createMatchSchema } from '../match/schemas'

describe('CompetitionLog schemas', () => {
  it('validates a valid competition log', () => {
    const result = createCompetitionLogSchema.safeParse({
      eventName: 'Copa BJJ',
      eventDate: '2026-06-15',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty eventName', () => {
    const result = createCompetitionLogSchema.safeParse({
      eventName: '',
      eventDate: '2026-06-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing eventDate', () => {
    const result = createCompetitionLogSchema.safeParse({
      eventName: 'Copa',
      eventDate: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    const result = createCompetitionLogSchema.safeParse({
      eventName: 'Copa BJJ',
      eventDate: '2026-06-15',
      weightCategory: '-76 kg',
      totalMatches: 5,
      result: '1er puesto',
      analysisMarkdown: '# Análisis\n\nBuen torneo.',
    })
    expect(result.success).toBe(true)
  })
})

describe('Match schemas', () => {
  it('validates an empty match (all fields optional)', () => {
    const result = createMatchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('validates a match with outcome and techniqueText', () => {
    const result = createMatchSchema.safeParse({
      opponentName: 'Juan',
      outcome: 'WIN',
      techniqueText: 'Armbar',
    })
    expect(result.success).toBe(true)
  })

  it('rejects techniqueText too long', () => {
    const result = createMatchSchema.safeParse({
      techniqueText: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })
})
