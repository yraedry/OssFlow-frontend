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

const GROUPS = [
  { id: 'submission', label: 'Sumisión', families: ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS'] },
  { id: 'pass',       label: 'Pasaje',   families: ['GUARD_PASSES'] },
  { id: 'takedown',   label: 'Derribo',  families: ['TAKEDOWNS', 'SWEEPS', 'BACK_TAKES', 'ESCAPES'] },
  { id: 'guard',      label: 'Guardia',  families: ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'DLR_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT'] },
] as const

export function RecommendationForm({ athleteId }: Props) {
  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateRecommendation(athleteId)
  const queryClient = useQueryClient()

  const { data: rawResults } = useTechniqueSearch(query.length >= 2 ? query : '')

  // Filter by active group if set
  const results = (rawResults ?? []).filter(r => {
    if (!activeGroup) return true
    const group = GROUPS.find(g => g.id === activeGroup)
    return group?.families.includes(r.family as never) ?? true
  })

  const matchedTechnique = query.length >= 2
    ? results.find(r => r.name.toLowerCase() === query.toLowerCase()) ?? null
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inputVal = inputRef.current?.value.trim() ?? query.trim()
    if (!inputVal || inputVal.length < 2) return

    setSubmitting(true)
    try {
      let technique = results.find(r => r.name.toLowerCase() === inputVal.toLowerCase()) ?? null
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
            setActiveGroup(null)
          },
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleGroupClick(groupId: string) {
    const next = activeGroup === groupId ? null : groupId
    setActiveGroup(next)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && highlighted >= 0 && results[highlighted]) {
      e.preventDefault()
      const r = results[highlighted]
      setQuery(r.name)
      setOpen(false)
    }
  }

  const isPending = submitting || create.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 mb-4">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Enviar recomendación de técnica
      </p>

      {/* Group filter */}
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map(g => (
          <button
            key={g.id}
            type="button"
            disabled={isPending}
            onClick={() => handleGroupClick(g.id)}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide border transition-colors disabled:opacity-40 ${
              activeGroup === g.id
                ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                : 'border-border text-muted-foreground hover:border-foreground/40'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Technique search */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKey}
          placeholder={activeGroup ? `Buscar en ${GROUPS.find(g => g.id === activeGroup)?.label ?? ''}...` : 'Buscar técnica... (mín. 2 caracteres)'}
          className="w-full bg-transparent text-sm border border-border px-3 py-2 outline-none placeholder:text-muted-foreground/50 font-mono"
          autoComplete="off"
          disabled={isPending}
        />
        {open && results.length > 0 && query.length >= 2 && (
          <ul className="absolute z-20 top-full left-0 right-0 bg-card border border-border shadow-lg max-h-48 overflow-y-auto">
            {results.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); setQuery(item.name); setOpen(false) }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                    i === highlighted ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                >
                  {item.name}
                  {item.family && (
                    <span className="ml-2 text-[10px] text-muted-foreground/60">
                      {item.family.replace(/_/g, ' ')}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
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
