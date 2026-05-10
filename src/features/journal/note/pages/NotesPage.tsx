import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, FileText, Tag, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { NoteForm } from '../components/NoteForm'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks'
import type { Note } from '../types'
import type { CreateNoteForm } from '../schemas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function NotesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [detailNote, setDetailNote] = useState<Note | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const { data, isLoading, error } = useNotes({ page: currentPage, size: 20 })
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()
  const deleteMutation = useDeleteNote()

  const handleSubmit = async (formData: CreateNoteForm & { tags: string[] }) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setOpen(false)
    setEditing(null)
  }

  const confirm = useConfirm()
  const handleOpenChange = (o: boolean) => { setOpen(o); if (!o) setEditing(null) }
  const handleDeleteNote = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar esta nota? Esta acción no se puede deshacer.' })
    if (ok) deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            Diario
          </div>
          <h1 className="text-2xl font-black leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            Notas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.totalElements ?? 0} notas en tu diario</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Nueva
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar nota' : 'Nueva nota'}</DialogTitle>
            </DialogHeader>
            <NoteForm
              defaultValues={editing ?? undefined}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar notas</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay notas todavía</p>
          <p className="text-xs mt-1">Escribe tu primera nota de entrenamiento</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {(data?.content ?? []).map((note) => (
              <div
                key={note.id}
                className="group relative flex flex-col bg-card border border-border hover:border-foreground/40 transition-colors cursor-pointer self-start"
                onClick={() => setDetailNote(note)}
              >
                {/* Acciones hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    type="button"
                    aria-label="Editar nota"
                    onClick={(e) => { e.stopPropagation(); setEditing(note); setOpen(true) }}
                    className="h-7 w-7 flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar nota"
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id) }}
                    className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="text-sm font-semibold leading-snug pr-16 line-clamp-1">{note.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{note.bodyMarkdown}</p>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {note.tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border px-1.5 py-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                          <Tag className="h-2 w-2" strokeWidth={1.5} />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    {format(new Date(note.createdAt), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}
      <Dialog open={!!detailNote} onOpenChange={v => { if (!v) setDetailNote(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Detalle de nota</DialogTitle>
          </DialogHeader>
          {detailNote && (
            <div className="space-y-4">
              <p className="text-base font-semibold leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>{detailNote.title}</p>
              {detailNote.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {detailNote.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border px-1.5 py-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                      <Tag className="h-2 w-2" strokeWidth={1.5} />
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                {format(new Date(detailNote.createdAt), "d MMM yyyy", { locale: es })}
              </p>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Contenido</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailNote.bodyMarkdown}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
