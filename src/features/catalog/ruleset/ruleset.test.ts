import { describe, it, expect } from 'vitest'
import { createRulesetSchema } from './schemas'

const validRuleset = {
  federationId: 1,
  belt: 'WHITE' as const,
  modality: 'GI' as const,
  effectiveFrom: '2024-01-01',
}

describe('Ruleset schemas', () => {
  it('validates valid ruleset', () => {
    expect(createRulesetSchema.safeParse(validRuleset).success).toBe(true)
  })
  it('rejects missing federationId', () => {
    expect(createRulesetSchema.safeParse({ belt: 'WHITE', modality: 'GI', effectiveFrom: '2024-01-01' }).success).toBe(false)
  })
  it('rejects missing effectiveFrom', () => {
    expect(createRulesetSchema.safeParse({ federationId: 1, belt: 'WHITE', modality: 'GI' }).success).toBe(false)
  })
  it('rejects invalid belt', () => {
    expect(createRulesetSchema.safeParse({ ...validRuleset, belt: 'RED' }).success).toBe(false)
  })
  it('rejects invalid modality', () => {
    expect(createRulesetSchema.safeParse({ ...validRuleset, modality: 'BOTH_NOGI' }).success).toBe(false)
  })
})
