import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { StudyItemKanban } from '@/features/planning/studyitem/components/StudyItemKanban'
import { useCreateStudyItem } from '@/features/planning/studyitem/hooks'
import { useUpdateStudyBlock } from '../hooks'
import { StudyItemForm } from './StudyItemForm'
import type { StudyBlock } from '../types'
import type { CreateStudyItemForm } from '@/features/planning/studyitem/schemas'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

type StudyBlockCardProps = {
  block: StudyBlock
  planId: number
  index: number
  onDelete: (blockId: number) => void
}

export function StudyBlockCard({ block, planId, index, onDelete }: StudyBlockCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(block.title)
  const [editNotes, setEditNotes] = useState(block.notesMarkdown ?? '')

  const createItem = useCreateStudyItem(planId, block.id)
  const updateBlock = useUpdateStudyBlock(planId)

  const handleAddItem = async (data: CreateStudyItemForm) => {
    await createItem.mutateAsync(data)
    setItemDialogOpen(false)
  }

  const handleSave = async () => {
    await updateBlock.mutateAsync({
      blockId: block.id,
      data: { title: editTitle, notesMarkdown: editNotes || undefined, blockOrder: block.blockOrder },
    })
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(block.title)
    setEditNotes(block.notesMarkdown ?? '')
    setEditing(false)
  }

  return (
    <div className="border border-border bg-card">
      {/* Header del bloque */}
      <div className="flex items-center gap-0 border-b border-border/50">
        {/* Toggle expand */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
        >
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          }
          <span className="text-[10px] font-bold text-muted-foreground shrink-0" style={MONO}>
            #{index}
          </span>
          {editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="flex-1 min-w-0 bg-transparent border-b border-border text-sm font-semibold focus:outline-none focus:border-foreground transition-colors"
              style={{ fontFamily: 'var(--font-serif)' }}
            />
          ) : (
            <span className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-serif)' }}>
              {block.title}
            </span>
          )}
        </button>

        {/* Acciones */}
        <div className="flex items-center shrink-0 border-l border-border/50">
          {editing ? (
            <>
              <button type="button" onClick={handleSave} disabled={updateBlock.isPending}
                className="h-10 w-10 flex items-center justify-center bg-foreground text-background hover:opacity-85 transition-opacity">
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <button type="button" onClick={handleCancelEdit}
                className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-l border-border/50">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(true)}
                className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                <DialogTrigger asChild>
                  <button type="button"
                    className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-l border-border/50">
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Añadir ítem al bloque</DialogTitle>
                  </DialogHeader>
                  <StudyItemForm onSubmit={handleAddItem} isPending={createItem.isPending} />
                </DialogContent>
              </Dialog>
              <button type="button" onClick={() => onDelete(block.id)}
                className="h-10 w-10 flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors border-l border-border/50">
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notas del bloque en modo edición */}
      {editing && (
        <div className="px-10 py-2 border-b border-border/50 bg-muted/10">
          <textarea
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            rows={2}
            placeholder="Notas del bloque (opcional)"
            className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none resize-none"
            style={MONO}
          />
        </div>
      )}

      {/* Notas visibles cuando no se está editando */}
      {!editing && block.notesMarkdown && (
        <div className="px-10 py-2 border-b border-border/50">
          <p className="text-xs text-muted-foreground" style={MONO}>{block.notesMarkdown}</p>
        </div>
      )}

      {/* Contenido expandido: kanban de ítems */}
      {expanded && (
        <div className="px-4 py-4">
          <StudyItemKanban planId={planId} blockId={block.id} />
        </div>
      )}
    </div>
  )
}
