import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useReceivedNotes } from '../hooks'
import type { Note } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'

function ReceivedNoteCard({ note, index }: { note: Note; index: number }) {
  const navigate = useNavigate()
  const isUnread = !note.read

  return (
    <button
      type="button"
      onClick={() => navigate(`/maestro/notas/${note.id}`)}
      className="w-full text-left group transition-colors hover:bg-muted/30 cursor-pointer bg-transparent border-none p-0"
    >
      <div
        className="flex border border-border"
        style={{ borderLeftWidth: isUnread ? '3px' : '1px', borderLeftColor: isUnread ? 'var(--color-foreground)' : 'var(--color-border)' }}
      >
        {/* Index column */}
        <div className="w-12 shrink-0 flex items-start justify-end px-3 pt-4 border-r border-border bg-muted/10">
          <span className="font-mono text-[9px] text-muted-foreground/40">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3.5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className={`text-sm leading-snug line-clamp-2 flex-1 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0 [&_p]:inline ${isUnread ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
              <ReactMarkdown>{note.body.substring(0, 140) + (note.body.length > 140 ? '…' : '')}</ReactMarkdown>
            </div>
            {isUnread && (
              <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.15em] border border-foreground px-1.5 py-0.5 text-foreground mt-0.5">
                Nueva
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {note.techniqueFamily && (
              <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-muted/40 text-muted-foreground border border-border">
                {note.techniqueFamily.replace(/_/g, ' ')}
              </span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="w-8 shrink-0 flex items-center justify-center border-l border-border">
          <span className="font-mono text-[11px] text-muted-foreground/30 group-hover:text-foreground transition-colors">→</span>
        </div>
      </div>
    </button>
  )
}

export function ReceivedNoteList() {
  const { data: notes, isLoading } = useReceivedNotes()

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  if (!notes?.length) {
    return (
      <div className="border border-dashed border-border px-6 py-10 text-center">
        <p className="font-serif text-base text-muted-foreground italic">Sin notas aún</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">
          Tu maestro aún no te ha enviado notas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notes.map((note, i) => (
        <ReceivedNoteCard key={note.id} note={note} index={i} />
      ))}
    </div>
  )
}
