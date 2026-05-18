import { useState, useRef, useEffect } from 'react'
import { useTechniqueSearch } from '../hooks'
import { useQuery } from '@tanstack/react-query'
import { techniqueApi } from '@/features/catalog/technique/api'
import { GROUPS, FAMILY_LABELS } from './techniqueFamilyGroups'
import type { GroupId } from './techniqueFamilyGroups'

type TechniqueOption = { id: number | null; name: string; family: string }

function useTechniquesByGroup(groupId: GroupId | null) {
  const families = groupId ? GROUPS.find(g => g.id === groupId)?.families ?? [] : []
  return useQuery({
    queryKey: ['techniques-by-group', groupId],
    queryFn: async () => {
      const data = await techniqueApi.list({ size: 100 })
      return data.content
        .filter(t => families.includes((t.family ?? '') as never))
        .map(t => ({
          id: t.id,
          name: t.name,
          family: t.family ?? '',
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled: families.length > 0,
    staleTime: 5 * 60_000,
  })
}

type Props = {
  value: string        // TechniqueFamily value (e.g. 'ARMBARS')
  onChange: (family: string) => void
  disabled?: boolean
  // For recommendation forms that need a concrete technique
  onTechniqueSelect?: (technique: TechniqueOption) => void
  selectedTechniqueName?: string
}

export function TechniqueFamilyPicker({ value, onChange, disabled, onTechniqueSelect, selectedTechniqueName }: Props) {
  const [activeGroup, setActiveGroup] = useState<GroupId | null>(() => {
    if (!value) return null
    return (GROUPS.find(g => g.families.includes(value as never))?.id ?? null) as GroupId | null
  })
  const [query, setQuery] = useState(selectedTechniqueName ?? '')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: groupTechniques = [] } = useTechniquesByGroup(activeGroup)

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  const { data: searchResults = [] } = useTechniqueSearch(debouncedQuery.length >= 2 ? debouncedQuery : '')

  // When searching: use search results filtered by group; otherwise show group catalog
  const isSearching = query.length >= 2
  const rawOptions: TechniqueOption[] = isSearching
    ? searchResults.filter(r => {
        if (!activeGroup) return true
        const group = GROUPS.find(g => g.id === activeGroup)
        return group?.families.includes(r.family as never) ?? true
      })
    : groupTechniques

  // Check if query matches an existing option exactly
  const exactMatch = rawOptions.find(o => o.name.toLowerCase() === query.trim().toLowerCase())
  const showFreeOption = isSearching && !exactMatch && query.trim().length >= 2

  // Build final options list — append "free text" option at the bottom if no exact match
  const options: (TechniqueOption & { isFree?: boolean })[] = showFreeOption
    ? [...rawOptions, { id: null, name: query.trim(), family: activeGroup ? (GROUPS.find(g => g.id === activeGroup)?.families[0] ?? 'OTHER') : 'OTHER', isFree: true }]
    : rawOptions

  function selectOption(opt: TechniqueOption & { isFree?: boolean }) {
    onChange(opt.family)
    if (onTechniqueSelect) onTechniqueSelect(opt)
    setQuery(opt.name)
    setOpen(false)
    setHighlighted(-1)
  }

  function handleGroupClick(groupId: GroupId) {
    const next = activeGroup === groupId ? null : groupId
    setActiveGroup(next)
    setQuery('')
    onChange('')
    if (onTechniqueSelect) onTechniqueSelect({ id: null, name: '', family: '' })
    setOpen(next !== null)
    if (next) setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClear() {
    onChange('')
    setActiveGroup(null)
    setQuery('')
    if (onTechniqueSelect) onTechniqueSelect({ id: null, name: '', family: '' })
    setOpen(false)
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, options.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && highlighted >= 0 && options[highlighted]) {
      e.preventDefault()
      selectOption(options[highlighted])
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('[data-technique-picker]')) setOpen(false)
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
        {(value || query) && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="px-2 py-1 text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/40 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search input + dropdown */}
      {activeGroup && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(-1) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleInputKey}
            placeholder="Buscar o escribir técnica..."
            disabled={disabled}
            className="w-full bg-transparent text-xs border border-border px-2.5 py-1.5 outline-none placeholder:text-muted-foreground/50 font-mono"
          />
          {open && options.length > 0 && (
            <ul className="absolute z-20 top-full left-0 right-0 bg-card border border-border shadow-lg max-h-52 overflow-y-auto">
              {options.map((opt, i) => (
                <li key={`${opt.family}-${opt.name}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); selectOption(opt) }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between gap-2 transition-colors ${
                      i === highlighted ? 'bg-muted' : 'hover:bg-muted/50'
                    } ${value === opt.family && query === opt.name ? 'text-orange-500' : 'text-foreground'}`}
                  >
                    <span>{opt.name}</span>
                    {opt.isFree ? (
                      <span className="text-[9px] text-orange-500/70 border border-orange-500/30 px-1.5 py-0.5 shrink-0">
                        + Añadir
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/40 shrink-0">
                        {FAMILY_LABELS[opt.family] ?? opt.family}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected chip */}
      {value && query && (
        <p className="text-[10px] font-mono text-muted-foreground/60">
          <span className="text-orange-500/70">·</span> {query}
          <span className="ml-1 text-muted-foreground/40">({FAMILY_LABELS[value] ?? value})</span>
        </p>
      )}
    </div>
  )
}
