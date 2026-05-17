import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateRecommendation } from '../hooks'
import { TechniqueFamilyPicker } from '../components/TechniqueFamilyPicker'
import { techniqueApi } from '@/features/catalog/technique/api'
import { Spinner } from '@/shared/components/ui/spinner'

interface Props {
  athleteId: number
}

const MAX_NOTE_CHARS = 1000

type SelectedTechnique = { id: number | null; name: string; family: string }

export function RecommendationForm({ athleteId }: Props) {
  const [selectedFamily, setSelectedFamily] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState<SelectedTechnique | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const create = useCreateRecommendation(athleteId)

  const isPending = submitting || create.isPending

  function handleFamilyChange(family: string) {
    setSelectedFamily(family)
    if (!family) setSelectedTechnique(null)
  }

  function handleTechniqueSelect(opt: SelectedTechnique) {
    if (!opt.name) {
      setSelectedTechnique(null)
    } else {
      setSelectedTechnique(opt)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTechnique?.name) {
      toast.error('Selecciona o escribe una técnica.')
      return
    }

    setSubmitting(true)
    try {
      let techniqueId = selectedTechnique.id

      // If free-text entry (no id), create the technique first
      if (!techniqueId) {
        const familyToCategory: Record<string, 'SUBMISSION' | 'PASS' | 'TAKEDOWN' | 'ESCAPE' | 'SWEEP' | 'TRANSITION'> = {
          CHOKES: 'SUBMISSION', GUILLOTINES: 'SUBMISSION', TRIANGLES: 'SUBMISSION',
          ARMBARS: 'SUBMISSION', SHOULDER_LOCKS: 'SUBMISSION', LEG_LOCKS: 'SUBMISSION',
          GUARD_PASSES: 'PASS',
          TAKEDOWNS: 'TAKEDOWN', SWEEPS: 'SWEEP', BACK_TAKES: 'TRANSITION',
          CLOSED_GUARD: 'TRANSITION', HALF_GUARD: 'TRANSITION', OPEN_GUARD: 'TRANSITION',
          DLR_GUARD: 'TRANSITION', BUTTERFLY_GUARD: 'TRANSITION', LEG_ENTANGLEMENT: 'TRANSITION',
          ESCAPES: 'ESCAPE',
        }
        const category = familyToCategory[selectedTechnique.family] ?? 'SUBMISSION'
        try {
          const created = await techniqueApi.create({
            name: selectedTechnique.name,
            category,
            startPositionId: 1,
            minimumBelt: 'WHITE',
            modality: 'BOTH',
            visibility: 'PUBLIC',
          })
          techniqueId = created.id
        } catch {
          toast.error('No se pudo crear la técnica. Inténtalo de nuevo.')
          return
        }
      }

      create.mutate(
        { athleteId, techniqueId: techniqueId!, note: note.trim() || undefined },
        {
          onSuccess: () => {
            setSelectedFamily('')
            setSelectedTechnique(null)
            setNote('')
          },
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 mb-4">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Enviar recomendación de técnica
      </p>

      <TechniqueFamilyPicker
        value={selectedFamily}
        onChange={handleFamilyChange}
        disabled={isPending}
        onTechniqueSelect={handleTechniqueSelect}
        selectedTechniqueName={selectedTechnique?.name ?? ''}
      />

      {selectedTechnique?.name && (
        <div className="relative">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, MAX_NOTE_CHARS))}
            placeholder="Nota opcional para el atleta..."
            rows={3}
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 font-mono border border-border px-3 py-2"
            disabled={isPending}
          />
          <p className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50 font-mono">
            {note.length}/{MAX_NOTE_CHARS}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!selectedTechnique?.name || isPending}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {isPending && <Spinner />}
          Enviar recomendación
        </button>
      </div>
    </form>
  )
}
