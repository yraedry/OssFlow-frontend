import { describe, it, expect } from 'vitest'
import { createSystemSchema } from './schemas'

describe('System schemas', () => {
  it('validates valid system', () => {
    expect(createSystemSchema.safeParse({ name: 'Test', visibility: 'PRIVATE' }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(createSystemSchema.safeParse({ name: '', visibility: 'PUBLIC' }).success).toBe(false)
  })
  it('rejects invalid visibility', () => {
    expect(createSystemSchema.safeParse({ name: 'X', visibility: 'DRAFT' }).success).toBe(false)
  })
})
