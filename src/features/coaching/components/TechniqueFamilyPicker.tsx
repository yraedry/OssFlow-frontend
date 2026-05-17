import { useState, useRef, useEffect } from 'react'
import { useTechniqueSearch } from '../hooks'

// Agrupación de TechniqueFamilies en 4 grupos de alto nivel
const GROUPS = [
  {
    id: 'submission',
    label: 'Sumisión',
    families: ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS'],
  },
  {
    id: 'pass',
    label: 'Pasaje',
    families: ['GUARD_PASSES'],
  },
  {
    id: 'takedown',
    label: 'Derribo',
    families: ['TAKEDOWNS', 'SWEEPS', 'BACK_TAKES', 'ESCAPES'],
  },
  {
    id: 'guard',
    label: 'Guardia',
    families: ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'DLR_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT'],
  },
] as const

const FAMILY_LABELS: Record<string, string> = {
  CLOSED_GUARD:     'Guardia Cerrada',
  HALF_GUARD:       'Media Guardia',
  OPEN_GUARD:       'Guardia Abierta',
  DLR_GUARD:        'De La Riva',
  BUTTERFLY_GUARD:  'Guardia Mariposa',
  LEG_ENTANGLEMENT: 'Entrelazados',
  GUARD_PASSES:     'Pasajes de Guardia',
  CHOKES:           'Estrangulaciones',
  GUILLOTINES:      'Guillotinas',
  TRIANGLES:        'Triángulos',
  ARMBARS:          'Armbars',
  SHOULDER_LOCKS:   'Kimuras / Americanas',
  LEG_LOCKS:        'Leg Locks',
  TAKEDOWNS:        'Derribos',
  SWEEPS:           'Barridas',
  BACK_TAKES:       'Tomas de Espalda',
  ESCAPES:          'Escapadas',
  OTHER:            'Otro',
}

type Props = {
  value: string        // TechniqueFamily value (e.g. 'ARMBARS')
  onChange: (family: string) => void
  disabled?: boolean
}

export function TechniqueFamilyPicker({ value, onChange, disabled }: Props) {
  const [activeGroup, setActiveGroup] = useState<string | null>(() => {
    if (!value) return null
    return GROUPS.find(g => g.families.includes(value as never))?.id ?? null
  })
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Debounced query for the API
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const { data: searchResults } = useTechniqueSearch(debouncedQuery.length >= 2 ? debouncedQuery : '')

  // Filter results by the active group's families
  const filteredResults = (searchResults ?? []).filter(r => {
    if (!activeGroup) return true
    const group = GROUPS.find(g => g.id === activeGroup)
    return group?.families.includes(r.family as never) ?? true
  })

  // Also show all families from the active group (static options when no query)
  const staticFamilies = activeGroup
    ? GROUPS.find(g => g.id === activeGroup)?.families ?? []
    : []

  const showStatic = query.length < 2
  const options = showStatic
    ? staticFamilies.map(f => ({ id: null, name: FAMILY_LABELS[f] ?? f, family: f }))
    : filteredResults

  const selectedLabel = value ? (FAMILY_LABELS[value] ?? value) : ''

  function selectOption(family: string) {
    onChange(family)
    setQuery('')
    setOpen(false)
    setHighlighted(-1)
  }

  function handleGroupClick(groupId: string) {
    const next = activeGroup === groupId ? null : groupId
    setActiveGroup(next)
    setQuery('')
    onChange('')
    setOpen(next !== null)
    if (next) setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, options.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    }
    if (e.key === 'Enter' && highlighted >= 0 && options[highlighted]) {
      e.preventDefault()
      selectOption(options[highlighted].family)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest('[data-technique-picker]')
      if (!el) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div data-technique-picker className="space-y-2">
      {/* Group buttons */}
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map(g => (
          <button
            key={g.id}
            type="button"
            disabled={disabled}
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
        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => { onChange(''); setActiveGroup(null); setQuery('') }}
            className="px-2 py-1 text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/40 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search + dropdown */}
      {activeGroup && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(-1) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleInputKey}
            placeholder={selectedLabel || 'Buscar técnica...'}
            disabled={disabled}
            className="w-full bg-transparent text-xs border border-border px-2.5 py-1.5 outline-none placeholder:text-muted-foreground/50 font-mono"
          />
          {open && options.length > 0 && (
            <ul
              ref={listRef}
              className="absolute z-20 top-full left-0 right-0 bg-card border border-border shadow-lg max-h-48 overflow-y-auto"
            >
              {options.map((opt, i) => (
                <li key={`${opt.family}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); selectOption(opt.family) }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between gap-2 transition-colors ${
                      i === highlighted ? 'bg-muted' : 'hover:bg-muted/50'
                    } ${value === opt.family ? 'text-orange-500' : 'text-foreground'}`}
                  >
                    <span>{opt.name}</span>
                    {value === opt.family && <span className="text-[9px] opacity-60">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected value chip */}
      {value && (
        <p className="text-[10px] font-mono text-muted-foreground/60">
          <span className="text-orange-500/80">·</span> {selectedLabel}
        </p>
      )}
    </div>
  )
}
