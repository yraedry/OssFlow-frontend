import { useNavigate } from 'react-router-dom'
import { useReceivedNotes } from '../hooks'
import type { Note } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'

function ReceivedNoteCard({ note }: { note: Note }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className={`w-full text-left border border-border bg-card p-4 hover:border-muted-foreground transition-colors ${!note.read ? 'border-l-2 border-l-purple-500' : ''}`}
      onClick={() => navigate(`/maestro/notas/${note.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm line-clamp-2 flex-1">
          {note.body.substring(0, 120)}{note.body.length > 120 ? '...' : ''}
        </p>
        {!note.read && (
          <span className="shrink-0 h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
        )}
      </div>
      {note.techniqueFamily && (
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border">
          {note.techniqueFamily.replace(/_/g, ' ')}
        </span>
      )}
      <p className="text-[10px] text-muted-foreground font-mono mt-2">
        {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </button>
  )
}

export function ReceivedNoteList() {
  const { data: notes, isLoading } = useReceivedNotes()

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (!notes?.length) {
    return (
      <div className="border border-dashed border-border/50 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground font-mono">Sin notas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notes.map(note => (
        <ReceivedNoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}
