import { MONO } from '@/shared/lib/typography'
import type { Federation, FederationAssignment } from '../types'

type Props = {
  federations: Federation[]
  selected: FederationAssignment[]
  onChange: (selected: FederationAssignment[]) => void
}

export function FederationSelector({ federations, selected, onChange }: Props) {
  const isChecked = (id: number) => selected.some((s) => s.federationId === id)
  const isPrimary = (id: number) => selected.some((s) => s.federationId === id && s.isPrimary)

  function handleCheck(id: number, checked: boolean) {
    if (checked) {
      onChange([...selected, { federationId: id, isPrimary: selected.length === 0 }])
    } else {
      const next = selected.filter((s) => s.federationId !== id)
      const hadPrimary = selected.find((s) => s.federationId === id)?.isPrimary
      if (hadPrimary && next.length > 0) {
        onChange([{ ...next[0], isPrimary: true }, ...next.slice(1)])
      } else {
        onChange(next)
      }
    }
  }

  function handleSetPrimary(id: number) {
    onChange(selected.map((s) => ({ ...s, isPrimary: s.federationId === id })))
  }

  if (federations.length === 0) {
    return <p className="text-xs text-muted-foreground" style={MONO}>No hay federaciones disponibles.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {federations.map((fed) => {
        const checked = isChecked(fed.id)
        const primary = isPrimary(fed.id)
        return (
          <button
            key={fed.id}
            type="button"
            onClick={() => handleCheck(fed.id, !checked)}
            className="relative text-left border p-2.5 transition-colors hover:bg-accent/20 focus:outline-none"
            style={{
              borderColor: checked ? 'var(--color-foreground)' : 'var(--color-border)',
              backgroundColor: checked ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}
          >
            {/* Checkmark */}
            <span
              className="absolute top-2 right-2 w-3 h-3 border flex items-center justify-center transition-colors"
              style={{
                borderColor: checked ? 'var(--color-foreground)' : 'rgba(255,255,255,0.2)',
                backgroundColor: checked ? 'var(--color-foreground)' : 'transparent',
              }}
            >
              {checked && (
                <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                  <path d="M1 2.5L2.8 4.5L6 1" stroke="var(--color-background)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>

            {/* Código */}
            <span
              className="block text-[9px] font-bold uppercase tracking-widest mb-0.5"
              style={{ ...MONO, color: checked ? 'var(--color-foreground)' : 'var(--color-muted-foreground)' }}
            >
              {fed.code}
            </span>
            {/* Nombre */}
            <span
              className="block text-[10px] leading-tight pr-4"
              style={{ ...MONO, color: checked ? 'var(--color-foreground)' : 'var(--color-muted-foreground)' }}
            >
              {fed.name}
            </span>

            {/* Botón principal */}
            {checked && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSetPrimary(fed.id) }}
                className="mt-2 text-[8px] uppercase tracking-widest border px-1.5 py-0.5 transition-colors"
                style={{
                  ...MONO,
                  borderColor: primary ? 'var(--color-foreground)' : 'rgba(255,255,255,0.15)',
                  color: primary ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  backgroundColor: primary ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                {primary ? '★ Principal' : 'Marcar principal'}
              </button>
            )}
          </button>
        )
      })}
    </div>
  )
}
