# Plan A — Layout y Navegación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el sidebar lateral por bottom tabs + FAB en móvil y top nav en escritorio, eliminando completamente el `<aside>` actual.

**Architecture:** `AppLayout.tsx` se refactoriza para renderizar condicionalmente `BottomTabBar` (móvil) o `TopNavBar` (escritorio) usando un breakpoint Tailwind. El FAB abre un `FabMenu` bottom sheet. Todos los componentes son nuevos y están en `src/shared/components/layout/`.

**Tech Stack:** React 19, React Router v6, Lucide React, Tailwind v4, TypeScript.

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `src/shared/components/layout/BottomTabBar.tsx` |
| Crear | `src/shared/components/layout/TopNavBar.tsx` |
| Crear | `src/shared/components/ui/fab-menu.tsx` |
| Modificar | `src/app/AppLayout.tsx` |
| Modificar | `src/app/router.tsx` — añadir ruta `/journal/physical-sessions` (placeholder) |

---

### Task 1: BottomTabBar component

**Files:**
- Create: `src/shared/components/layout/BottomTabBar.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
// src/shared/components/layout/BottomTabBar.tsx
import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Calendar, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const tabs = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/catalog/techniques', label: 'Técnicas', icon: BookOpen },
  { to: '/journal/training-sessions', label: 'Sesiones', icon: Calendar },
  { to: '/profile', label: 'Perfil', icon: User },
] as const

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.slice(0, 2).map(({ to, label, icon: Icon, end }) => (
        <TabItem key={to} to={to} label={label} icon={Icon} end={end} />
      ))}

      {/* FAB placeholder slot — filled by AppLayout */}
      <div className="flex-none w-14" />

      {tabs.slice(2).map(({ to, label, icon: Icon }) => (
        <TabItem key={to} to={to} label={label} icon={Icon} />
      ))}
    </nav>
  )
}

function TabItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] min-w-[44px]',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )
      }
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      <span
        style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '0.06em' }}
        className="uppercase"
      >
        {label}
      </span>
    </NavLink>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores relacionados con `BottomTabBar.tsx`

---

### Task 2: FabMenu component (bottom sheet con 5 acciones)

**Files:**
- Create: `src/shared/components/ui/fab-menu.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// src/shared/components/ui/fab-menu.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Dumbbell, Zap, BookOpen, FileText, CalendarPlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const ACTIONS = [
  {
    label: 'Sesión BJJ',
    icon: Dumbbell,
    to: '/journal/training-sessions?new=bjj',
  },
  {
    label: 'Sesión física',
    icon: Zap,
    to: '/journal/physical-sessions?new=1',
  },
  {
    label: 'Técnica',
    icon: BookOpen,
    to: '/catalog/techniques?new=1',
  },
  {
    label: 'Nota',
    icon: FileText,
    to: '/journal/notes?new=1',
  },
  {
    label: 'Programar',
    icon: CalendarPlus,
    to: '/planning/study-plans?new=1',
  },
] as const

export function FabMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleAction = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      {open && (
        <div
          className="fixed bottom-20 left-0 right-0 z-50 mx-4 border border-border bg-background"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {ACTIONS.map(({ label, icon: Icon, to }) => (
            <button
              key={to}
              onClick={() => handleAction(to)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-foreground hover:bg-accent transition-colors min-h-[48px] last:border-b-0"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-widest">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB button — sits in the center slot of BottomTabBar */}
      <div className="flex flex-none w-14 flex-col items-center justify-center" style={{ marginTop: '-14px' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Añadir'}
          className={cn(
            'flex h-11 w-11 items-center justify-center border-[3px] border-background rounded-full transition-transform duration-150',
            open ? 'bg-foreground scale-95' : 'bg-foreground scale-100',
          )}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          {open ? (
            <X className="h-5 w-5 text-background" strokeWidth={2.5} />
          ) : (
            <Plus className="h-5 w-5 text-background" strokeWidth={2.5} />
          )}
        </button>
        <span
          style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '0.06em' }}
          className="uppercase text-muted-foreground mt-0.5"
        >
          Añadir
        </span>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

---

### Task 3: TopNavBar component (escritorio)

**Files:**
- Create: `src/shared/components/layout/TopNavBar.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// src/shared/components/layout/TopNavBar.tsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import { useProfile } from '@/features/identity/profile/hooks'

const PRIMARY_NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog/techniques', label: 'Técnicas' },
  { to: '/journal/training-sessions', label: 'Sesiones' },
  { to: '/planning/study-plans', label: 'Planes' },
]

const SECONDARY_NAV = [
  { to: '/catalog/positions', label: 'Posiciones' },
  { to: '/catalog/rulesets', label: 'Reglamentos' },
  { to: '/catalog/systems', label: 'Sistemas' },
  { to: '/competition/logs', label: 'Competencias' },
  { to: '/journal/notes', label: 'Notas' },
  { to: '/journal/physical-sessions', label: 'Físico' },
  { to: '/export', label: 'Exportar' },
  { to: '/trash', label: 'Papelera' },
]

type TopNavBarProps = {
  onSearchOpen: () => void
}

export function TopNavBar({ onSearchOpen }: TopNavBarProps) {
  const { theme, toggleTheme } = useTheme()
  const { data: profile } = useProfile()
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <header className="sticky top-0 z-30 flex h-12 items-stretch border-b border-border bg-background">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center px-5 border-r border-border"
        style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 900, letterSpacing: '-0.03em' }}
      >
        OSSFLOW
      </NavLink>

      {/* Primary nav */}
      <nav className="flex items-stretch flex-1">
        {PRIMARY_NAV.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 border-b-2 transition-colors h-full',
                'text-muted-foreground hover:text-foreground',
                isActive
                  ? 'border-foreground text-foreground'
                  : 'border-transparent',
              )
            }
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {label}
          </NavLink>
        ))}

        {/* More dropdown */}
        <div className="relative flex items-center">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'flex items-center gap-1 px-3 h-full border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors',
              moreOpen && 'text-foreground',
            )}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px' }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          {moreOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
              <div className="absolute top-full left-0 z-20 w-44 border border-border bg-background shadow-lg">
                {SECONDARY_NAV.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-b border-border last:border-b-0',
                        isActive && 'text-foreground bg-accent',
                      )
                    }
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 border-l border-border">
        <button
          onClick={onSearchOpen}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
        </button>
        <button
          onClick={() => navigate('/journal/training-sessions?new=bjj')}
          className="flex items-center gap-1.5 px-3 h-8 border border-foreground bg-foreground text-background hover:opacity-85 transition-opacity ml-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
          Registrar
        </button>
        <NavLink
          to="/profile"
          className="flex h-7 w-7 items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground transition-colors ml-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
          aria-label="Perfil"
        >
          {initials}
        </NavLink>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

---

### Task 4: Refactorizar AppLayout

**Files:**
- Modify: `src/app/AppLayout.tsx`

- [ ] **Step 1: Reemplazar AppLayout completo**

```tsx
// src/app/AppLayout.tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomTabBar } from '@/shared/components/layout/BottomTabBar'
import { TopNavBar } from '@/shared/components/layout/TopNavBar'
import { FabMenu } from '@/shared/components/ui/fab-menu'
import { CommandPalette } from '@/shared/components/CommandPalette'

export function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false)

  return (
    <>
      {/* Desktop: top nav (visible en md+) */}
      <div className="hidden md:block">
        <TopNavBar onSearchOpen={() => setCmdOpen(true)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 min-h-dvh md:min-h-0">
        <Outlet />
      </main>

      {/* Mobile: bottom tab bar + FAB (ocultos en md+) */}
      <div className="md:hidden">
        <BottomTabBar />
        <FabMenu />
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

- [ ] **Step 3: Ejecutar tests**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run 2>&1 | tail -20
```

Expected: todos los tests pasan (el layout no tiene tests unitarios propios, pero los existentes no deben romperse)

- [ ] **Step 4: Añadir ruta placeholder para physical-sessions en router.tsx**

En `src/app/router.tsx`, añadir después de la ruta `journal/training-sessions`:

```tsx
import { TrainingSessionsPage } from '@/features/journal/trainingsession/pages/TrainingSessionsPage'
// añadir esta línea de import al bloque de imports existente:
// (se usará en Plan C — por ahora redirige a training-sessions)
```

En el array de rutas dentro del children de AppLayout, añadir:

```tsx
{ path: 'journal/physical-sessions', element: <TrainingSessionsPage /> },
```

(Es un placeholder temporal — Plan C lo reemplazará con `PhysicalSessionsPage`)

- [ ] **Step 5: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git add src/shared/components/layout/BottomTabBar.tsx \
        src/shared/components/layout/TopNavBar.tsx \
        src/shared/components/ui/fab-menu.tsx \
        src/app/AppLayout.tsx \
        src/app/router.tsx
git commit -m "feat: reemplazar sidebar por bottom tabs + top nav + FAB"
```

---

### Task 5: Test de humo visual en navegador

- [ ] **Step 1: Arrancar el servidor de desarrollo**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

- [ ] **Step 2: Verificar en móvil (DevTools → viewport 375px)**
  - La bottom tab bar aparece fija en la parte inferior
  - El FAB (+) aparece centrado elevado
  - Al pulsar el FAB, se abre el bottom sheet con 5 acciones
  - Al pulsar fuera del sheet, se cierra
  - La navegación entre tabs funciona
  - El contenido no queda tapado por la tab bar (tiene `pb-24`)

- [ ] **Step 3: Verificar en escritorio (viewport > 768px)**
  - El top nav aparece con logo OSSFLOW, 4 tabs primarios, botón "···", búsqueda, toggle tema, "+ Registrar", avatar
  - Las rutas primarias (Inicio, Técnicas, Sesiones, Planes) tienen underline activo
  - El "···" despliega dropdown con rutas secundarias
  - La bottom tab bar está oculta

- [ ] **Step 4: Verificar ⌘K**
  - En desktop, el botón de búsqueda abre CommandPalette
  - El shortcut ⌘K sigue funcionando

**Nota:** El shortcut de teclado ⌘K se ha movido de AppLayout a TopNavBar. Si falla, añadir el `useEffect` del keydown en `AppLayout.tsx`:

```tsx
// En AppLayout.tsx, añadir dentro del componente:
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen(true)
    }
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [])
```

Y el import:
```tsx
import { useState, useEffect } from 'react'
```
