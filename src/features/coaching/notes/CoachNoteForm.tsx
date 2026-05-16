import { useState } from 'react'
import { useCreateNote, useTechniqueFamilies } from '../hooks'
import { Spinner } from '@/shared/components/ui/spinner'

type Props = { athleteId: number }

export function CoachNoteForm({ athleteId }: Props) {
  const [body, setBody] = useState('')
  const [family, setFamily] = useState('')
  const { data: families } = useTechniqueFamilies()
  const create = useCreateNote()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    create.mutate(
      { athleteId, body: body.trim(), techniqueFamily: family || undefined },
      { onSuccess: () => { setBody(''); setFamily('') } },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 mb-4">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Escribe una nota para el atleta... (soporta markdown)"
        rows={4}
        className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 font-mono"
        disabled={create.isPending}
      />
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
          disabled={!body.trim() || create.isPending}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {create.isPending ? <Spinner /> : null}
          Enviar nota
        </button>
      </div>
    </form>
  )
}
