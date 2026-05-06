import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'

type EdgeConditionDialogProps = {
  edgeId: string | null
  initialCondition: string
  onSave: (edgeId: string, condition: string) => void
  onClose: () => void
}

export function EdgeConditionDialog({
  edgeId,
  initialCondition,
  onSave,
  onClose,
}: EdgeConditionDialogProps) {
  const [condition, setCondition] = useState(initialCondition)

  const handleSave = () => {
    if (edgeId) {
      onSave(edgeId, condition)
    }
    onClose()
  }

  return (
    <Dialog open={edgeId !== null} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Condición del trigger</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">
            Describe cuándo se activa esta transición:
          </label>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            value={condition}
            onChange={e => setCondition(e.target.value)}
            placeholder="Ej: cuando el oponente empuja..."
            autoFocus
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
