import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft } from 'lucide-react'
import { useNoteDetail, useMarkNoteRead } from '@/features/coaching/hooks'
import { Spinner } from '@/shared/components/ui/spinner'

export function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const id = Number(noteId)
  const { data: note, isLoading } = useNoteDetail(id)
  const markRead = useMarkNoteRead()

  useEffect(() => {
    if (!id || isNaN(id) || !note || note.read) return
    markRead.mutate(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, note?.read])

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="space-y-4 max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/maestro')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wide"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver a maestro
      </button>

      <div className="border border-border bg-card p-6 space-y-4">
        {note.techniqueFamily && (
          <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border">
            {note.techniqueFamily.replace(/_/g, ' ')}
          </span>
        )}
        <div className="text-sm leading-relaxed space-y-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic [&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted/30 [&_code]:px-1 [&_code]:py-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground">
          <ReactMarkdown>{note.body}</ReactMarkdown>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          {new Date(note.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
