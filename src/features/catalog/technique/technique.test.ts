import { describe, it, expect } from 'vitest'
import { createTechniqueSchema } from './schemas'

const validTechnique = {
  name: 'Armbar',
  category: 'SUBMISSION' as const,
  startPositionId: 1,
  minimumBelt: 'WHITE' as const,
  modality: 'GI' as const,
  visibility: 'PRIVATE' as const,
}

describe('Technique schemas', () => {
  it('validates a valid technique', () => {
    expect(createTechniqueSchema.safeParse(validTechnique).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(createTechniqueSchema.safeParse({ ...validTechnique, name: '' }).success).toBe(false)
  })

  it('rejects missing category', () => {
    expect(createTechniqueSchema.safeParse({
      name: 'Armbar', startPositionId: 1, minimumBelt: 'WHITE', modality: 'GI', visibility: 'PRIVATE',
    }).success).toBe(false)
  })

  it('rejects invalid minimumBelt value', () => {
    expect(createTechniqueSchema.safeParse({ ...validTechnique, minimumBelt: 'RED' }).success).toBe(false)
  })

  it('accepts optional youtube url', () => {
    expect(createTechniqueSchema.safeParse({
      ...validTechnique,
      youtubeUrl: 'https://youtube.com/watch?v=abc123',
    }).success).toBe(true)
  })

  it('rejects invalid youtube url', () => {
    expect(createTechniqueSchema.safeParse({
      ...validTechnique,
      youtubeUrl: 'not-a-url',
    }).success).toBe(false)
  })

  it('accepts empty string youtube url', () => {
    expect(createTechniqueSchema.safeParse({
      ...validTechnique,
      youtubeUrl: '',
    }).success).toBe(true)
  })
})
