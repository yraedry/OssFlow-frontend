import { useState } from 'react'
import { ChevronDown, ChevronUp, X, Plus } from 'lucide-react'
import { useTechniques } from '@/features/catalog/technique/hooks'
import { useUpsertWorkedTechnique, useRemoveWorkedTechnique } from '../hooks'
import type { TrainingSession } from '../types'

interface Props {
  session: TrainingSession
}

export function WorkedTechniquePanel({ session }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const { data: techniquesData } = useTechniques({ size: 200 })
  const upsert = useUpsertWorkedTechnique(session.id)
  const remove = useRemoveWorkedTechnique(session.id)

  const techniques = techniquesData?.content ?? []
  const workedTechniques = session.workedTechniques ?? []

  const handleAdd = async () => {
    if (!selectedTechniqueId) return
    await upsert.mutateAsync({
      techniqueId: Number(selectedTechniqueId),
      data: {
        notesMarkdown: notes || undefined,
      },
    })
    setSelectedTechniqueId('')
    setNotes('')
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        <span>Técnicas trabajadas</span>
        {workedTechniques.length > 0 && (
          <span className="ml-1 rounded-full bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[10px] font-semibold">
            {workedTechniques.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {workedTechniques.length === 0 ? (
            <p className="text-xs text-muted-foreground font-mono">Sin técnicas registradas</p>
          ) : (
            <ul className="space-y-1.5">
              {workedTechniques.map((wt) => {
                const tech = techniques.find((t) => t.id === wt.techniqueId)
                const displayName = wt.techniqueName ?? tech?.name ?? `Técnica #${wt.techniqueId}`
                return (
                  <li
                    key={wt.techniqueId}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium truncate block">{displayName}</span>
                      {wt.notesMarkdown && (
                        <span className="text-[10px] font-mono text-muted-foreground">{wt.notesMarkdown}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove.mutate(wt.techniqueId)}
                      disabled={remove.isPending}
                      className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Eliminar técnica"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">Añadir técnica</p>
            <select
              value={selectedTechniqueId}
              onChange={(e) => setSelectedTechniqueId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— Seleccionar técnica —</option>
              {techniques.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (#{t.id})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas (opcional)"
                rows={1}
                className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedTechniqueId || upsert.isPending}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
              {upsert.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
