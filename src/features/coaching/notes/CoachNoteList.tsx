import { Trash2 } from 'lucide-react'
import { useCoachNotes, useDeleteNote } from '../hooks'
import type { Note } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { cn } from '@/shared/lib/utils'

type Props = { athleteId: number }

function CoachNoteCard({ note, athleteId }: { note: Note; athleteId: number }) {
  const del = useDeleteNote(athleteId)
  const confirm = useConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: 'Borrar nota',
      description: 'La nota se marcará como borrada y el atleta ya no la verá. ¿Continuar?',
      confirmLabel: 'Borrar',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
    if (ok) del.mutate(note.id)
  }

  return (
    <div className={cn('border border-border bg-card p-4 group', note.deleted && 'opacity-50')}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn('text-sm flex-1 leading-relaxed whitespace-pre-wrap', note.deleted && 'line-through text-muted-foreground')}>
          {note.body.substring(0, 200)}{note.body.length > 200 ? '...' : ''}
        </p>
        {note.deleted ? (
          <span className="shrink-0 text-[10px] font-mono uppercase tracking-wide text-muted-foreground/40 border border-dashed border-border/30 px-2 py-0.5">
            Borrada
          </span>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            disabled={del.isPending}
            className="shrink-0 mt-0.5 p-1 text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-20 cursor-pointer"
            aria-label="Borrar nota"
          >
            {del.isPending
              ? <Spinner />
              : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            }
          </button>
        )}
      </div>

      {note.techniqueFamily && (
        <span className="mt-2.5 inline-block text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
          {note.techniqueFamily.replace(/_/g, ' ')}
        </span>
      )}

      <div className="flex items-center gap-2 mt-2">
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        {note.read && (
          <span className="text-[10px] text-muted-foreground/40 font-mono">· leída</span>
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
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Sin notas enviadas aún</p>
        <p className="text-xs text-muted-foreground/50 font-mono mt-1">
          Usa el formulario de arriba para enviar tu primera nota.
        </p>
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
