import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 bg-background border border-input pl-9 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        style={{ fontFamily: 'var(--font-mono)' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 flex items-center justify-center h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
