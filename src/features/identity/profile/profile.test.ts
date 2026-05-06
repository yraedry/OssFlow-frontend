import { describe, it, expect } from 'vitest'
import { updateProfileSchema } from './schemas'

describe('Profile schemas', () => {
  it('validates a valid profile update', () => {
    const result = updateProfileSchema.safeParse({
      displayName: 'Adrian',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty displayName', () => {
    const result = updateProfileSchema.safeParse({
      displayName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid avatarUrl', () => {
    const result = updateProfileSchema.safeParse({
      displayName: 'Adrian',
      avatarUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty avatarUrl', () => {
    const result = updateProfileSchema.safeParse({
      displayName: 'Adrian',
      avatarUrl: '',
    })
    expect(result.success).toBe(true)
  })
})
