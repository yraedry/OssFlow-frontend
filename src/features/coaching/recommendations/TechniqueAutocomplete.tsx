import { useState, useEffect, useRef } from 'react'
import { useTechniqueSearch } from '../hooks'

type TechniqueOption = {
  id: number
  name: string
  family: string | null
}

interface Props {
  value: TechniqueOption | null
  onChange: (value: TechniqueOption | null) => void
}

export function TechniqueAutocomplete({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState(value?.name ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selectingRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(inputValue.trim())
    }, 300)
    return () => clearTimeout(t)
  }, [inputValue])

  const { data: results } = useTechniqueSearch(debouncedQuery)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setInputValue(text)
    setOpen(true)
    if (value !== null) {
      onChange(null)
    }
  }

  function handleInputBlur() {
    // Delay close to let item click fire first
    setTimeout(() => {
      if (!selectingRef.current) setOpen(false)
      selectingRef.current = false
    }, 150)
  }

  function handleSelect(item: TechniqueOption) {
    selectingRef.current = true
    onChange(item)
    setInputValue(item.name)
    setOpen(false)
  }

  const showDropdown = open && debouncedQuery.length >= 2 && results && results.length > 0

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (debouncedQuery.length >= 2) setOpen(true)
        }}
        onBlur={handleInputBlur}
        placeholder="Buscar técnica... (mín. 2 caracteres)"
        className="w-full bg-transparent text-sm border border-border px-3 py-2 outline-none placeholder:text-muted-foreground/50 font-mono"
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute z-50 top-full left-0 right-0 border border-border bg-background shadow-lg max-h-48 overflow-y-auto">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <span className="font-mono">{item.name}</span>
                {item.family && (
                  <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
                    {item.family.replace(/_/g, ' ')}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && debouncedQuery.length >= 2 && results && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 border border-border bg-background px-3 py-2">
          <p className="text-xs text-muted-foreground font-mono">Sin resultados para "{debouncedQuery}"</p>
        </div>
      )}
    </div>
  )
}
