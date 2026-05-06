import { describe, it, expect } from 'vitest'
import { updateProfileSchema } from './schemas'

const validProfile = {
  displayName: 'Adrian',
  currentBelt: 'BLUE',
  preferredModality: 'GI',
}

describe('Profile schemas', () => {
  it('validates a valid profile update', () => {
    expect(updateProfileSchema.safeParse(validProfile).success).toBe(true)
  })

  it('rejects empty displayName', () => {
    expect(updateProfileSchema.safeParse({ ...validProfile, displayName: '' }).success).toBe(false)
  })

  it('rejects empty currentBelt', () => {
    expect(updateProfileSchema.safeParse({ ...validProfile, currentBelt: '' }).success).toBe(false)
  })

  it('rejects empty preferredModality', () => {
    expect(updateProfileSchema.safeParse({ ...validProfile, preferredModality: '' }).success).toBe(false)
  })

  it('accepts optional academy', () => {
    expect(updateProfileSchema.safeParse({ ...validProfile, academy: 'Team Atos' }).success).toBe(true)
  })
})
