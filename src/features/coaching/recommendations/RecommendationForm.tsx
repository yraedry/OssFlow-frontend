import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCreateRecommendation, useTechniqueSearch } from '../hooks'
import { techniqueApi } from '@/features/catalog/technique/api'
import { Spinner } from '@/shared/components/ui/spinner'

interface Props {
  athleteId: number
}

const MAX_NOTE_CHARS = 1000

export function RecommendationForm({ athleteId }: Props) {
  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateRecommendation(athleteId)
  const queryClient = useQueryClient()

  const { data: results } = useTechniqueSearch(query)
  const matchedTechnique = query.length >= 2
    ? results?.find(r => r.name.toLowerCase() === query.toLowerCase()) ?? null
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inputVal = inputRef.current?.value.trim() ?? query.trim()
    if (!inputVal || inputVal.length < 2) return

    setSubmitting(true)
    try {
      // Try cached results first, then fetch if needed
      let technique = results?.find(r => r.name.toLowerCase() === inputVal.toLowerCase()) ?? null
      if (!technique) {
        const data = await queryClient.fetchQuery({
          queryKey: ['technique-search', inputVal],
          queryFn: () => techniqueApi.list({ search: inputVal, size: 10 }),
          staleTime: 30_000,
        })
        technique = data.content
          .map(t => ({ id: t.id, name: t.name, family: t.category }))
          .find(r => r.name.toLowerCase() === inputVal.toLowerCase()) ?? null
      }
      if (!technique) {
        toast.error('Técnica no encontrada. Selecciona una opción de la lista.')
        return
      }

      create.mutate(
        { athleteId, techniqueId: technique.id, note: note.trim() || undefined },
        {
          onSuccess: () => {
            if (inputRef.current) inputRef.current.value = ''
            setQuery('')
            setNote('')
          },
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  const listId = 'technique-autocomplete-list'
  const isPending = submitting || create.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 mb-4">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Enviar recomendación de técnica
      </p>

      <div>
        <input
          ref={inputRef}
          type="text"
          list={listId}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onInput={e => setQuery((e.target as HTMLInputElement).value)}
          placeholder="Buscar técnica... (mín. 2 caracteres)"
          className="w-full bg-transparent text-sm border border-border px-3 py-2 outline-none placeholder:text-muted-foreground/50 font-mono"
          autoComplete="off"
          disabled={isPending}
        />
        <datalist id={listId}>
          {(results ?? []).map(item => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        {matchedTechnique && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            ✓ {matchedTechnique.name}{matchedTechnique.family ? ` · ${matchedTechnique.family.replace(/_/g, ' ')}` : ''}
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
          disabled={isPending}
        />
        <p className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50 font-mono">
          {note.length}/{MAX_NOTE_CHARS}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!query || query.length < 2 || isPending}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {isPending && <Spinner />}
          Enviar recomendación
        </button>
      </div>
    </form>
  )
}
