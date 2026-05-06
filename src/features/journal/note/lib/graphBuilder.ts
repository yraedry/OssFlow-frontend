type NoteNode = { id: string; name: string; val: number; color?: string }
type NoteLink = { source: string; target: string; label?: string }
export type GraphData = { nodes: NoteNode[]; links: NoteLink[] }

export function buildNoteGraph(
  notes: Array<{ id: number; title: string; tags: string[] }>,
): GraphData {
  const nodes: NoteNode[] = notes.map((n) => ({
    id: String(n.id),
    name: n.title,
    val: Math.max(1, n.tags.length),
    color: n.tags.length > 3 ? '#6366f1' : n.tags.length > 1 ? '#3b82f6' : '#94a3b8',
  }))

  const links: NoteLink[] = []
  const seen = new Set<string>()

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const shared = notes[i].tags.filter((t) => notes[j].tags.includes(t))
      if (shared.length > 0) {
        const key = `${notes[i].id}-${notes[j].id}`
        if (!seen.has(key)) {
          seen.add(key)
          links.push({
            source: String(notes[i].id),
            target: String(notes[j].id),
            label: shared.join(', '),
          })
        }
      }
    }
  }

  return { nodes, links }
}
