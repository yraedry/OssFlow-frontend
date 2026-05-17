import { useState } from 'react'
import { useCreateObservation, useTechniqueFamilies } from '../hooks'
import { Spinner } from '@/shared/components/ui/spinner'
import type { ObservationTone } from '../types'

type Props = { athleteId: number }

const TONE_OPTIONS: { value: ObservationTone; label: string; activeClass: string }[] = [
  { value: 'POSITIVE', label: 'Positivo', activeClass: 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:bg-emerald-950/30' },
  { value: 'NEUTRAL',  label: 'Neutro',   activeClass: 'border-foreground text-foreground bg-muted' },
  { value: 'NEGATIVE', label: 'Negativo', activeClass: 'border-red-600 text-red-700 bg-red-50 dark:border-red-500 dark:text-red-400 dark:bg-red-950/30' },
]

export function ObservationForm({ athleteId }: Props) {
  const [body, setBody] = useState('')
  const [tone, setTone] = useState<ObservationTone | null>(null)
  const [family, setFamily] = useState<string>('')

  const { data: families } = useTechniqueFamilies()
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
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 mb-4">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Escribe una observación sobre el atleta..."
        rows={3}
        className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 font-mono"
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
      <div className="flex gap-2 items-center">
        <select
          value={family}
          onChange={e => setFamily(e.target.value)}
          className="flex-1 bg-transparent text-xs border border-border px-2 py-1.5 text-muted-foreground font-mono outline-none"
          disabled={create.isPending}
        >
          <option value="">Sin familia (opcional)</option>
          {families?.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
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
