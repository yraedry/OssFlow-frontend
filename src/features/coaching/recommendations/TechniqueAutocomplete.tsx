import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), 300)
    return () => clearTimeout(t)
  }, [inputValue])

  const { data: results } = useTechniqueSearch(debouncedQuery)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setInputValue(text)
    // Check if the typed value matches a result exactly
    const match = results?.find(r => r.name === text)
    if (match) {
      onChange(match)
    } else {
      if (value !== null) onChange(null)
    }
  }

  const listId = 'technique-autocomplete-list'

  return (
    <div className="relative">
      <input
        type="text"
        list={listId}
        value={inputValue}
        onChange={handleChange}
        placeholder="Buscar técnica... (mín. 2 caracteres)"
        className="w-full bg-transparent text-sm border border-border px-3 py-2 outline-none placeholder:text-muted-foreground/50 font-mono"
        autoComplete="off"
      />
      <datalist id={listId}>
        {(results ?? []).map(item => (
          <option key={item.id} value={item.name} />
        ))}
      </datalist>
    </div>
  )
}
