import { describe, it, expect } from 'vitest'
import { buildNoteGraph } from './lib/graphBuilder'

describe('buildNoteGraph', () => {
  it('creates nodes for each note', () => {
    const notes = [
      { id: 1, title: 'A', tags: ['bjj'] },
      { id: 2, title: 'B', tags: ['bjj', 'guardia'] },
    ]
    const { nodes } = buildNoteGraph(notes)
    expect(nodes).toHaveLength(2)
  })

  it('creates link for notes with shared tags', () => {
    const notes = [
      { id: 1, title: 'A', tags: ['bjj'] },
      { id: 2, title: 'B', tags: ['bjj'] },
    ]
    const { links } = buildNoteGraph(notes)
    expect(links).toHaveLength(1)
  })

  it('no link for notes without shared tags', () => {
    const notes = [
      { id: 1, title: 'A', tags: ['bjj'] },
      { id: 2, title: 'B', tags: ['wrestling'] },
    ]
    const { links } = buildNoteGraph(notes)
    expect(links).toHaveLength(0)
  })
})
