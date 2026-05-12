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

type NavGroup = {
  heading: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'General',
    items: [
      { label: 'Inicio', path: '/' },
      { label: 'Análisis', path: '/analisis' },
    ],
  },
  {
    heading: 'Diario',
    items: [
      { label: 'Sesiones de entrenamiento', path: '/diario/sesiones-bjj' },
      { label: 'Sesiones físicas', path: '/diario/sesiones-fisicas' },
      { label: 'Movilidad (diario)', path: '/diario/movilidad' },
      { label: 'Flexibilidad (diario)', path: '/diario/flexibilidad' },
      { label: 'Notas', path: '/diario/notas' },
      { label: 'Competición', path: '/diario/competicion' },
    ],
  },
  {
    heading: 'Estudio',
    items: [
      { label: 'Técnicas', path: '/estudio/tecnicas' },
      { label: 'Posiciones', path: '/estudio/posiciones' },
      { label: 'Sistemas', path: '/estudio/sistemas' },
      { label: 'Físico', path: '/estudio/ejercicios' },
      { label: 'Ejercicios de movilidad', path: '/estudio/movilidad' },
      { label: 'Ejercicios de flexibilidad', path: '/estudio/flexibilidad' },
      { label: 'Reglamentos', path: '/estudio/reglamentos' },
    ],
  },
  {
    heading: 'Planificación',
    items: [
      { label: 'Planes de estudio', path: '/planificacion/planes' },
      { label: 'Plantilla semanal', path: '/planificacion/plantilla' },
      { label: 'Rutinas', path: '/planificacion/rutinas' },
    ],
  },
  {
    heading: 'Cuenta',
    items: [
      { label: 'Perfil', path: '/profile' },
      { label: 'Configuración', path: '/configuracion' },
      { label: 'Exportar datos', path: '/export' },
      { label: 'Papelera', path: '/trash' },
    ],
  },
]

const GROUP_CLASSES =
  'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'

const ITEM_CLASSES =
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

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
          <Command.List className="max-h-96 overflow-y-auto overflow-x-hidden p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron resultados.
            </Command.Empty>
            {NAV_GROUPS.map((group) => (
              <Command.Group
                key={group.heading}
                heading={group.heading}
                className={GROUP_CLASSES}
              >
                {group.items.map((item) => (
                  <Command.Item
                    key={item.path}
                    value={`${group.heading} ${item.label}`}
                    onSelect={() => handleSelect(item.path)}
                    className={ITEM_CLASSES}
                  >
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
