import { useState } from 'react'
import { useCreateRecommendation, useTechniqueSearch } from '../hooks'
import { Spinner } from '@/shared/components/ui/spinner'

interface Props {
  athleteId: number
}

const MAX_NOTE_CHARS = 1000

export function RecommendationForm({ athleteId }: Props) {
  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')
  const create = useCreateRecommendation(athleteId)

  const { data: results } = useTechniqueSearch(query)
  const technique = results?.find(r => r.name === query) ?? null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!technique) return
    create.mutate(
      { athleteId, techniqueId: technique.id, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setQuery('')
          setNote('')
        },
      },
    )
  }

  const listId = 'technique-autocomplete-list'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 mb-4">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Enviar recomendación de técnica
      </p>

      <div>
        <input
          type="text"
          list={listId}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar técnica... (mín. 2 caracteres)"
          className="w-full bg-transparent text-sm border border-border px-3 py-2 outline-none placeholder:text-muted-foreground/50 font-mono"
          autoComplete="off"
          disabled={create.isPending}
        />
        <datalist id={listId}>
          {(results ?? []).map(item => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        {technique && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            ✓ {technique.name}{technique.family ? ` · ${technique.family.replace(/_/g, ' ')}` : ''}
          </p>
        )}
      </div>

      <div className="relative">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value.slice(0, MAX_NOTE_CHARS))}
          placeholder="Nota opcional para el atleta..."
          rows={3}
          className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 font-mono border border-border px-3 py-2"
          disabled={create.isPending}
        />
        <p className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50 font-mono">
          {note.length}/{MAX_NOTE_CHARS}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!technique || create.isPending}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {create.isPending && <Spinner />}
          Enviar recomendación
        </button>
      </div>
    </form>
  )
}
