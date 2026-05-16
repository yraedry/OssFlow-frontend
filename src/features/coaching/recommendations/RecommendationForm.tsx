import { useRef, useState } from 'react'
import { useCreateRecommendation, useTechniqueSearch } from '../hooks'
import { Spinner } from '@/shared/components/ui/spinner'

interface Props {
  athleteId: number
}

const MAX_NOTE_CHARS = 1000
const DEBOUNCE_MS = 300

export function RecommendationForm({ athleteId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [query, setQuery] = useState('')
  const create = useCreateRecommendation(athleteId)
  const [noteLen, setNoteLen] = useState(0)

  const { data: results } = useTechniqueSearch(query)
  const technique = results?.find(r => r.name === (inputRef.current?.value ?? '')) ?? null

  function handleInput() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setQuery(inputRef.current?.value.trim() ?? '')
    }, DEBOUNCE_MS)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!technique) return
    const note = noteRef.current?.value.trim() || undefined
    create.mutate(
      { athleteId, techniqueId: technique.id, note },
      {
        onSuccess: () => {
          if (inputRef.current) inputRef.current.value = ''
          if (noteRef.current) noteRef.current.value = ''
          setQuery('')
          setNoteLen(0)
        },
      },
    )
  }

  const listId = 'technique-autocomplete-list'
  const canSubmit = !!technique && !create.isPending

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
          onInput={handleInput}
          onChange={handleInput}
          defaultValue=""
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
          ref={noteRef}
          onInput={e => setNoteLen((e.target as HTMLTextAreaElement).value.length)}
          defaultValue=""
          placeholder="Nota opcional para el atleta..."
          rows={3}
          maxLength={MAX_NOTE_CHARS}
          className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 font-mono border border-border px-3 py-2"
          disabled={create.isPending}
        />
        <p className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50 font-mono">
          {noteLen}/{MAX_NOTE_CHARS}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {create.isPending && <Spinner />}
          Enviar recomendación
        </button>
      </div>
    </form>
  )
}
