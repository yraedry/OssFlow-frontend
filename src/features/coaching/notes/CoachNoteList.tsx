import { Trash2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useCoachNotes, useDeleteNote } from '../hooks'
import type { Note } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { cn } from '@/shared/lib/utils'
import { useState } from 'react'

type Props = { athleteId: number }

function NoteDetailModal({ note, onClose, onDelete }: {
  note: Note
  onClose: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background shadow-xl flex flex-col border-l-[3px] border-l-orange-500"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-orange-500">Nota al atleta</p>
            <p className="text-xs text-muted-foreground/60 font-mono">
              {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Contenido</p>
            <div className="text-sm leading-relaxed text-foreground [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground">
              <ReactMarkdown>{note.body}</ReactMarkdown>
            </div>
          </div>

          {note.techniqueFamily && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Familia técnica</p>
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted text-muted-foreground border border-border">
                {note.techniqueFamily.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {note.read && (
            <p className="text-[10px] text-muted-foreground/40 font-mono">· leída por el atleta</p>
          )}
        </div>

        {/* Actions */}
        {!note.deleted && (
          <div className="flex gap-2 px-6 pb-5 border-t border-border pt-4">
            <button
              onClick={() => { onClose(); onDelete() }}
              className="border border-destructive/40 text-destructive text-xs font-mono uppercase py-2 px-4 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              Borrar nota
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CoachNoteCard({ note, athleteId }: { note: Note; athleteId: number }) {
  const del = useDeleteNote(athleteId)
  const confirm = useConfirm()
  const [detailOpen, setDetailOpen] = useState(false)

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
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className={cn(
          'border border-border bg-card p-3 group cursor-pointer hover:bg-muted/30 transition-colors',
          note.deleted && 'opacity-50',
        )}
        style={{ borderLeft: '3px solid var(--color-orange-500, #f97316)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={cn('text-sm flex-1 leading-snug line-clamp-2 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_p]:inline', note.deleted && 'line-through text-muted-foreground')}>
            <ReactMarkdown>{note.body.substring(0, 120) + (note.body.length > 120 ? '…' : '')}</ReactMarkdown>
          </div>
          {note.deleted ? (
            <span className="shrink-0 text-[10px] font-mono uppercase tracking-wide text-muted-foreground/40 border border-dashed border-border/30 px-2 py-0.5">
              Borrada
            </span>
          ) : (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleDelete() }}
              disabled={del.isPending}
              className="shrink-0 mt-0.5 p-1 text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-20 cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Borrar nota"
            >
              {del.isPending
                ? <Spinner />
                : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              }
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {note.techniqueFamily && (
            <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
              {note.techniqueFamily.replace(/_/g, ' ')}
            </span>
          )}
          <p className="text-[10px] text-muted-foreground/60 font-mono ml-auto">
            {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          {note.read && (
            <span className="text-[10px] text-muted-foreground/40 font-mono">· leída</span>
          )}
        </div>
      </div>

      {detailOpen && (
        <NoteDetailModal
          note={note}
          onClose={() => setDetailOpen(false)}
          onDelete={handleDelete}
        />
      )}
    </>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {notes.map(note => (
        <CoachNoteCard key={note.id} note={note} athleteId={athleteId} />
      ))}
    </div>
  )
}
