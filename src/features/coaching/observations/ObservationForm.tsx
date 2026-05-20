import { useState } from 'react'
import { MarkdownEditor } from '@/shared/components/ui/MarkdownEditor'
import { useCreateObservation } from '../hooks'
import { TechniqueFamilyPicker } from '../components/TechniqueFamilyPicker'
import { Spinner } from '@/shared/components/ui/spinner'
import type { ObservationTone } from '../types'

type Props = { athleteId: number }

const TONE_OPTIONS: { value: ObservationTone; label: string; activeClass: string }[] = [
  { value: 'POSITIVE', label: 'Positivo', activeClass: 'border-emerald-500 text-emerald-600 bg-emerald-500/10 dark:border-emerald-400 dark:text-emerald-400 dark:bg-emerald-400/10' },
  { value: 'NEUTRAL',  label: 'Neutro',   activeClass: 'border-foreground text-foreground bg-foreground/10' },
  { value: 'NEGATIVE', label: 'Negativo', activeClass: 'border-red-500 text-red-600 bg-red-500/10 dark:border-red-400 dark:text-red-400 dark:bg-red-400/10' },
]

export function ObservationForm({ athleteId }: Props) {
  const [body, setBody] = useState('')
  const [tone, setTone] = useState<ObservationTone | null>(null)
  const [family, setFamily] = useState<string>('')

  const create = useCreateObservation(athleteId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !tone) return
    create.mutate(
      { athleteId, body: body.trim(), tone, techniqueFamily: family || undefined },
      { onSuccess: () => { setBody(''); setTone(null); setFamily('') } },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <MarkdownEditor
        value={body}
        onChange={setBody}
        placeholder="Escribe una observación sobre el atleta..."
        rows={3}
        disabled={create.isPending}
      />
      <div className="flex flex-wrap gap-2">
        {TONE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTone(opt.value)}
            className={`px-3 py-1 text-xs border font-mono uppercase tracking-wide transition-colors ${
              tone === opt.value ? opt.activeClass : 'text-muted-foreground border-border hover:border-foreground/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <TechniqueFamilyPicker
        value={family}
        onChange={setFamily}
        disabled={create.isPending}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!body.trim() || !tone || create.isPending}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {create.isPending ? <Spinner /> : null}
          Añadir
        </button>
      </div>
    </form>
  )
}
