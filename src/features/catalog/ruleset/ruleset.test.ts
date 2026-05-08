import { describe, it, expect } from 'vitest'
import { createRulesetSchema } from './schemas'

const validRuleset = {
  federationId: 1,
}

describe('Ruleset schemas', () => {
  it('validates valid ruleset with just federationId', () => {
    expect(createRulesetSchema.safeParse(validRuleset).success).toBe(true)
  })
  it('validates ruleset with sourceUrl', () => {
    expect(createRulesetSchema.safeParse({ federationId: 1, sourceUrl: 'https://ibjjf.com' }).success).toBe(true)
  })
  it('rejects missing federationId', () => {
    expect(createRulesetSchema.safeParse({}).success).toBe(false)
  })
  it('rejects invalid URL in sourceUrl', () => {
    expect(createRulesetSchema.safeParse({ federationId: 1, sourceUrl: 'not-a-url' }).success).toBe(false)
  })
  it('accepts empty string as sourceUrl', () => {
    expect(createRulesetSchema.safeParse({ federationId: 1, sourceUrl: '' }).success).toBe(true)
  })
})
