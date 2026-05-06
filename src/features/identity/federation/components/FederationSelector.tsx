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
      const noneSelected = selected.length === 0
      onChange([...selected, { federationId: id, isPrimary: noneSelected }])
    } else {
      const next = selected.filter((s) => s.federationId !== id)
      // If removed primary and there are others, make first one primary
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

  return (
    <div className="space-y-2">
      {federations.map((fed) => (
        <div key={fed.id} className="flex items-center gap-3 rounded-md border p-3">
          <input
            type="checkbox"
            id={`fed-${fed.id}`}
            checked={isChecked(fed.id)}
            onChange={(e) => handleCheck(fed.id, e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <label htmlFor={`fed-${fed.id}`} className="flex-1 cursor-pointer">
            <span className="font-medium">{fed.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {fed.code}
            </span>
          </label>
          {isChecked(fed.id) && (
            <button
              type="button"
              onClick={() => handleSetPrimary(fed.id)}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                isPrimary(fed.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Principal
            </button>
          )}
        </div>
      ))}
      {federations.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay federaciones disponibles.</p>
      )}
    </div>
  )
}
