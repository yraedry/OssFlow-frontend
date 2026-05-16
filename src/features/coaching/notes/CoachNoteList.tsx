import { Trash2 } from 'lucide-react'
import { useCoachNotes, useDeleteNote } from '../hooks'
import type { Note } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'
import { cn } from '@/shared/lib/utils'

type Props = { athleteId: number }

function CoachNoteCard({ note, athleteId }: { note: Note; athleteId: number }) {
  const del = useDeleteNote(athleteId)

  return (
    <div className={cn('border border-border bg-card p-4 group relative', note.deleted && 'opacity-50')}>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-sm flex-1 whitespace-pre-wrap', note.deleted && 'line-through text-muted-foreground')}>
          {note.body.substring(0, 200)}{note.body.length > 200 ? '...' : ''}
        </p>
        {!note.deleted && (
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Borrar esta nota?')) del.mutate(note.id)
            }}
            disabled={del.isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 disabled:opacity-20"
            aria-label="Borrar nota"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
        {note.deleted && (
          <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50 border border-dashed border-border/30 px-2 py-0.5">
            Borrada
          </span>
        )}
      </div>
      {note.techniqueFamily && (
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border">
          {note.techniqueFamily.replace(/_/g, ' ')}
        </span>
      )}
      <div className="flex items-center gap-2 mt-2">
        <p className="text-[10px] text-muted-foreground font-mono">
          {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        {note.read && (
          <span className="text-[10px] text-muted-foreground/50 font-mono">• leída</span>
        )}
      </div>
    </div>
  )
}

export function CoachNoteList({ athleteId }: Props) {
  const { data: notes, isLoading } = useCoachNotes(athleteId)

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
        <p className="text-sm text-muted-foreground font-mono">Sin notas enviadas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notes.map(note => (
        <CoachNoteCard key={note.id} note={note} athleteId={athleteId} />
      ))}
    </div>
  )
}
