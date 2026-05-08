import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { useEffect } from 'react'

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
}

type NavItem = {
  label: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Posiciones', path: '/estudio/posiciones' },
  { label: 'Técnicas', path: '/estudio/tecnicas' },
  { label: 'Sistemas', path: '/estudio/sistemas' },
  { label: 'Notas', path: '/diario/notas' },
  { label: 'Sesiones de entrenamiento', path: '/diario/sesiones-bjj' },
  { label: 'Competencias', path: '/diario/competicion' },
  { label: 'Planes de estudio', path: '/planificacion/planes' },
  { label: 'Perfil', path: '/profile' },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border bg-popover shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Navegación global">
          <div className="flex items-center border-b px-3">
            <Command.Input
              placeholder="Buscar página..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto overflow-x-hidden p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron resultados.
            </Command.Empty>
            <Command.Group
              heading="Navegación"
              className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => handleSelect(item.path)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
