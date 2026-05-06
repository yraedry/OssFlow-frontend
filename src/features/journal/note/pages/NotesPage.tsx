import { useState } from 'react'
import { Plus, FileText, Tag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { NoteForm } from '../components/NoteForm'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks'
import type { Note } from '../types'
import type { CreateNoteForm } from '../schemas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function NotesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)

  const { data, isLoading, error } = useNotes()
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

  const handleOpenChange = (o: boolean) => { setOpen(o); if (!o) setEditing(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notas</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} notas en tu diario</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2" />Nueva nota</Button>
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
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No hay notas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.content ?? []).map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(note); setOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm('¿Eliminar esta nota?')) deleteMutation.mutate(note.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{note.bodyMarkdown}</p>
                {note.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs gap-1">
                        <Tag className="h-2.5 w-2.5" />{t}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(note.createdAt), "d MMM yyyy", { locale: es })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
