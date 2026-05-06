import { describe, it, expect } from 'vitest'
import { createSystemSchema } from './schemas'

const validSystem = { name: 'Test', flowDefinition: '{"nodes":[],"edges":[]}', visibility: 'PRIVATE' as const }

describe('System schemas', () => {
  it('validates valid system', () => {
    expect(createSystemSchema.safeParse(validSystem).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(createSystemSchema.safeParse({ ...validSystem, name: '' }).success).toBe(false)
  })
  it('rejects missing flowDefinition', () => {
    expect(createSystemSchema.safeParse({ name: 'Test', visibility: 'PRIVATE' }).success).toBe(false)
  })
  it('rejects empty flowDefinition', () => {
    expect(createSystemSchema.safeParse({ ...validSystem, flowDefinition: '' }).success).toBe(false)
  })
  it('rejects invalid visibility', () => {
    expect(createSystemSchema.safeParse({ ...validSystem, visibility: 'DRAFT' }).success).toBe(false)
  })
})
