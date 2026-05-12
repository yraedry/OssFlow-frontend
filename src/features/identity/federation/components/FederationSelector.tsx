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

  const selectedFeds = federations.filter(f => isChecked(f.id))

  return (
    <div className="space-y-3">
      {/* Chips de selección */}
      <div className="flex flex-wrap gap-2">
        {federations.map((fed) => {
          const checked = isChecked(fed.id)
          return (
            <button
              key={fed.id}
              type="button"
              onClick={() => handleCheck(fed.id, !checked)}
              className="flex items-center gap-1.5 px-3 py-1.5 border transition-all focus:outline-none cursor-pointer select-none"
              style={{
                ...MONO,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderColor: checked ? 'var(--color-foreground)' : 'var(--color-border)',
                backgroundColor: checked ? 'var(--color-foreground)' : 'transparent',
                color: checked ? 'var(--color-background)' : 'var(--color-muted-foreground)',
              }}
              aria-pressed={checked}
              title={fed.name}
            >
              {checked && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                  <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {fed.code}
            </button>
          )
        })}
      </div>

      {/* Nombres completos de seleccionados + marcar principal */}
      {selectedFeds.length > 0 && (
        <div className="border border-border divide-y divide-border">
          {selectedFeds.map((fed) => {
            const primary = isPrimary(fed.id)
            return (
              <div key={fed.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 text-[9px] font-bold uppercase tracking-widest"
                    style={{ ...MONO, color: 'var(--color-foreground)' }}
                  >
                    {fed.code}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground truncate"
                    style={MONO}
                  >
                    {fed.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetPrimary(fed.id)}
                  className="shrink-0 text-[8px] uppercase tracking-widest border px-2 py-0.5 transition-all cursor-pointer focus:outline-none"
                  style={{
                    ...MONO,
                    borderColor: primary ? 'var(--color-foreground)' : 'var(--color-border)',
                    color: primary ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                    backgroundColor: primary ? 'var(--color-foreground)' : 'transparent',
                    ...(primary ? { color: 'var(--color-background)' } : {}),
                  }}
                >
                  {primary ? '★ Principal' : 'Principal'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
