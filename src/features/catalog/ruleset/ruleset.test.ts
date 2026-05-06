import { describe, it, expect } from 'vitest'
import { createRulesetSchema } from './schemas'

describe('Ruleset schemas', () => {
  it('validates valid ruleset', () => {
    expect(
      createRulesetSchema.safeParse({ federationId: 1, name: 'Reglamento IJF 2024' }).success,
    ).toBe(true)
  })
  it('rejects missing federationId', () => {
    expect(createRulesetSchema.safeParse({ name: 'X' }).success).toBe(false)
  })
  it('rejects empty name', () => {
    expect(createRulesetSchema.safeParse({ federationId: 1, name: '' }).success).toBe(false)
  })
})
