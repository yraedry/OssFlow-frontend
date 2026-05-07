import { describe, it, expect } from 'vitest'
import { createCompetitionLogSchema, createMatchSchema } from './schemas'

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
  it('validates a valid match', () => {
    const result = createMatchSchema.safeParse({
      opponentName: 'Juan',
      result: 'WIN',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid result', () => {
    const result = createMatchSchema.safeParse({
      opponentName: 'Juan',
      result: 'FORFEIT',
    })
    expect(result.success).toBe(false)
  })
})
