import { describe, it, expect } from 'vitest'
import { createTechniqueSchema } from './schemas'

describe('Technique schemas', () => {
  it('validates a valid technique', () => {
    const result = createTechniqueSchema.safeParse({
      name: 'Armbar',
      startPositionId: 1,
      belt: 'WHITE',
      modality: 'GI',
      visibility: 'PRIVATE',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createTechniqueSchema.safeParse({
      name: '',
      startPositionId: 1,
      belt: 'BLUE',
      modality: 'NOGI',
      visibility: 'PUBLIC',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid belt value', () => {
    const result = createTechniqueSchema.safeParse({
      name: 'Kimura',
      startPositionId: 1,
      belt: 'RED',
      modality: 'GI',
      visibility: 'PRIVATE',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional youtube url', () => {
    const result = createTechniqueSchema.safeParse({
      name: 'Triangle',
      startPositionId: 2,
      belt: 'PURPLE',
      modality: 'BOTH',
      visibility: 'PUBLIC',
      youtubeUrl: 'https://youtube.com/watch?v=abc123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid youtube url', () => {
    const result = createTechniqueSchema.safeParse({
      name: 'Triangle',
      startPositionId: 2,
      belt: 'PURPLE',
      modality: 'BOTH',
      visibility: 'PUBLIC',
      youtubeUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty string youtube url', () => {
    const result = createTechniqueSchema.safeParse({
      name: 'Triangle',
      startPositionId: 2,
      belt: 'BLUE',
      modality: 'GI',
      visibility: 'PRIVATE',
      youtubeUrl: '',
    })
    expect(result.success).toBe(true)
  })
})
