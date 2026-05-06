import { describe, it, expect } from 'vitest'
import { createNoteSchema } from './schemas'

describe('Note schema', () => {
  it('validates valid note', () => {
    expect(createNoteSchema.safeParse({ title: 'Test', bodyMarkdown: '# Content', tags: [] }).success).toBe(true)
  })
  it('rejects empty title', () => {
    expect(createNoteSchema.safeParse({ title: '', bodyMarkdown: 'body', tags: [] }).success).toBe(false)
  })
  it('rejects empty body', () => {
    expect(createNoteSchema.safeParse({ title: 'Title', bodyMarkdown: '', tags: [] }).success).toBe(false)
  })
  it('accepts tags array', () => {
    expect(createNoteSchema.safeParse({ title: 'T', bodyMarkdown: 'B', tags: ['bjj', 'guardia'] }).success).toBe(true)
  })
})
