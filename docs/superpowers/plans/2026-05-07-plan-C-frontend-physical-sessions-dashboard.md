# Plan C — Frontend PhysicalSession + Dashboard Rediseño Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el módulo frontend de sesiones físicas (CRUD completo) y rediseñar `HomePage` con week strip, stats, anillos de actividad y plan del día, consumiendo el endpoint `dashboard/weekly-stats`.

**Architecture:** El módulo `src/features/journal/physicalsession/` sigue exactamente el mismo patrón que `trainingsession/`. `HomePage.tsx` se reescribe completamente usando los nuevos hooks. `DashboardStats.tsx` queda obsoleto y se elimina.

**Tech Stack:** React 19, TanStack Query v5, React Hook Form, Zod v4, ky v2, Tailwind v4, Lucide React, date-fns.

**Prerequisito:** Plan B debe estar completo (los endpoints backend deben existir).

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `src/features/journal/physicalsession/types.ts` |
| Crear | `src/features/journal/physicalsession/schemas.ts` |
| Crear | `src/features/journal/physicalsession/api.ts` |
| Crear | `src/features/journal/physicalsession/hooks.ts` |
| Crear | `src/features/journal/physicalsession/physicalsession.test.ts` |
| Crear | `src/features/journal/physicalsession/components/PhysicalSessionCard.tsx` |
| Crear | `src/features/journal/physicalsession/components/PhysicalSessionForm.tsx` |
| Crear | `src/features/journal/physicalsession/pages/PhysicalSessionsPage.tsx` |
| Crear | `src/shared/api/dashboard.ts` |
| Modificar | `src/pages/HomePage.tsx` (reescritura completa) |
| Eliminar | `src/pages/DashboardStats.tsx` |
| Modificar | `src/app/router.tsx` (reemplazar placeholder) |

---

### Task 1: Types + Schemas del módulo PhysicalSession

**Files:**
- Create: `src/features/journal/physicalsession/types.ts`
- Create: `src/features/journal/physicalsession/schemas.ts`

- [ ] **Step 1: Crear types.ts**

```ts
// src/features/journal/physicalsession/types.ts
export type PhysicalSessionType = 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'HIIT' | 'OTHER'

export const PHYSICAL_SESSION_TYPE_LABELS: Record<PhysicalSessionType, string> = {
  STRENGTH: 'Fuerza',
  CARDIO: 'Cardio',
  FLEXIBILITY: 'Flexibilidad',
  HIIT: 'HIIT',
  OTHER: 'Otro',
}

export interface PhysicalSession {
  id: number
  sessionDate: string
  sessionType: PhysicalSessionType
  title: string
  durationMinutes?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePhysicalSessionRequest {
  sessionDate: string
  sessionType: PhysicalSessionType
  title: string
  durationMinutes?: number
  notes?: string
}
```

- [ ] **Step 2: Crear schemas.ts**

```ts
// src/features/journal/physicalsession/schemas.ts
import { z } from 'zod'

export const createPhysicalSessionSchema = z.object({
  sessionDate: z.string().min(1, 'Fecha requerida'),
  sessionType: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'OTHER']),
  title: z.string().min(1, 'Título requerido').max(200),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().max(5000).optional(),
})

export type CreatePhysicalSessionForm = z.infer<typeof createPhysicalSessionSchema>
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

---

### Task 2: API + Hooks

**Files:**
- Create: `src/features/journal/physicalsession/api.ts`
- Create: `src/features/journal/physicalsession/hooks.ts`

- [ ] **Step 1: Crear api.ts**

```ts
// src/features/journal/physicalsession/api.ts
import { apiClient } from '@/shared/api/client'
import type { PhysicalSession, CreatePhysicalSessionRequest } from './types'

interface PageResponse<T> { content: T[]; totalElements: number }

export const physicalSessionApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('journal/physical-sessions', { searchParams: params as Record<string, string | number> })
      .json<PageResponse<PhysicalSession>>(),
  get: (id: number) =>
    apiClient.get(`journal/physical-sessions/${id}`).json<PhysicalSession>(),
  create: (data: CreatePhysicalSessionRequest) =>
    apiClient.post('journal/physical-sessions', { json: data }).json<PhysicalSession>(),
  update: (id: number, data: CreatePhysicalSessionRequest) =>
    apiClient.put(`journal/physical-sessions/${id}`, { json: data }).json<PhysicalSession>(),
  delete: (id: number) =>
    apiClient.delete(`journal/physical-sessions/${id}`),
}
```

- [ ] **Step 2: Crear hooks.ts**

```ts
// src/features/journal/physicalsession/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { physicalSessionApi } from './api'
import type { CreatePhysicalSessionRequest } from './types'

export const PHYSICAL_SESSIONS_KEY = ['physical-sessions'] as const

export function usePhysicalSessions(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...PHYSICAL_SESSIONS_KEY, params],
    queryFn: () => physicalSessionApi.list(params),
  })
}

export function useCreatePhysicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePhysicalSessionRequest) => physicalSessionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PHYSICAL_SESSIONS_KEY })
      qc.invalidateQueries({ queryKey: ['weekly-stats'] })
      toast.success('Sesión física creada')
    },
    onError: () => toast.error('Error al crear la sesión'),
  })
}

export function useDeletePhysicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => physicalSessionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PHYSICAL_SESSIONS_KEY })
      qc.invalidateQueries({ queryKey: ['weekly-stats'] })
      toast.success('Sesión eliminada')
    },
    onError: () => toast.error('Error al eliminar'),
  })
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

---

### Task 3: Test de schemas

**Files:**
- Create: `src/features/journal/physicalsession/physicalsession.test.ts`

- [ ] **Step 1: Escribir el test**

```ts
// src/features/journal/physicalsession/physicalsession.test.ts
import { describe, it, expect } from 'vitest'
import { createPhysicalSessionSchema } from './schemas'

describe('createPhysicalSessionSchema', () => {
  it('acepta un registro válido', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionDate: '2026-05-07',
      sessionType: 'STRENGTH',
      title: 'Fuerza — Empuje',
      durationMinutes: 60,
    })
    expect(result.success).toBe(true)
  })

  it('falla si falta sessionDate', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionType: 'CARDIO',
      title: 'Cardio',
    })
    expect(result.success).toBe(false)
  })

  it('falla si sessionType no es válido', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionDate: '2026-05-07',
      sessionType: 'YOGA',
      title: 'Yoga',
    })
    expect(result.success).toBe(false)
  })

  it('acepta sin durationMinutes (opcional)', () => {
    const result = createPhysicalSessionSchema.safeParse({
      sessionDate: '2026-05-07',
      sessionType: 'OTHER',
      title: 'Caminata',
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Ejecutar el test**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run src/features/journal/physicalsession/physicalsession.test.ts
```

Expected: `4 tests passed`

---

### Task 4: Componentes PhysicalSessionForm + PhysicalSessionCard

**Files:**
- Create: `src/features/journal/physicalsession/components/PhysicalSessionForm.tsx`
- Create: `src/features/journal/physicalsession/components/PhysicalSessionCard.tsx`

- [ ] **Step 1: Crear PhysicalSessionForm.tsx**

```tsx
// src/features/journal/physicalsession/components/PhysicalSessionForm.tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { createPhysicalSessionSchema, type CreatePhysicalSessionForm } from '../schemas'
import { PHYSICAL_SESSION_TYPE_LABELS } from '../types'

type Props = {
  onSubmit: (data: CreatePhysicalSessionForm) => Promise<void>
  isPending: boolean
}

const SESSION_TYPES = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'OTHER'] as const

export function PhysicalSessionForm({ onSubmit, isPending }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreatePhysicalSessionForm>({
    resolver: zodResolver(createPhysicalSessionSchema),
    defaultValues: { sessionType: 'STRENGTH' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="sessionDate">Fecha</Label>
        <Controller
          control={control}
          name="sessionDate"
          render={({ field }) => (
            <DatePicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.sessionDate && <p className="text-xs text-destructive mt-1">{errors.sessionDate.message}</p>}
      </div>

      <div>
        <Label htmlFor="sessionType">Tipo</Label>
        <Controller
          control={control}
          name="sessionType"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{PHYSICAL_SESSION_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sessionType && <p className="text-xs text-destructive mt-1">{errors.sessionType.message}</p>}
      </div>

      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register('title')} placeholder="Ej: Fuerza — Empuje" />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="durationMinutes">Duración (minutos)</Label>
        <Input
          id="durationMinutes"
          type="number"
          {...register('durationMinutes', { valueAsNumber: true })}
          placeholder="60"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Observaciones..." />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Guardar sesión'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Crear PhysicalSessionCard.tsx**

```tsx
// src/features/journal/physicalsession/components/PhysicalSessionCard.tsx
import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import type { PhysicalSession } from '../types'
import { PHYSICAL_SESSION_TYPE_LABELS } from '../types'

type Props = {
  session: PhysicalSession
  onDelete: (id: number) => void
}

export function PhysicalSessionCard({ session, onDelete }: Props) {
  return (
    <div className="border border-border p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{PHYSICAL_SESSION_TYPE_LABELS[session.sessionType]}</Badge>
          <span
            className="text-sm font-medium text-foreground"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {session.title}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(session.id)}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Eliminar sesión"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        <span>{session.sessionDate}</span>
        {session.durationMinutes && <span>{session.durationMinutes} min</span>}
      </div>
      {session.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{session.notes}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

---

### Task 5: PhysicalSessionsPage

**Files:**
- Create: `src/features/journal/physicalsession/pages/PhysicalSessionsPage.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// src/features/journal/physicalsession/pages/PhysicalSessionsPage.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PhysicalSessionCard } from '../components/PhysicalSessionCard'
import { PhysicalSessionForm } from '../components/PhysicalSessionForm'
import { usePhysicalSessions, useCreatePhysicalSession, useDeletePhysicalSession } from '../hooks'
import type { CreatePhysicalSessionForm } from '../schemas'

export function PhysicalSessionsPage() {
  const [open, setOpen] = useState(false)
  const { data, isLoading, error } = usePhysicalSessions()
  const createMutation = useCreatePhysicalSession()
  const deleteMutation = useDeletePhysicalSession()

  const handleSubmit = async (formData: CreatePhysicalSessionForm) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta sesión?')) return
    await deleteMutation.mutateAsync(id)
  }

  const sessions = (data?.content ?? []).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
            Sesiones físicas
          </h1>
          <p className="text-muted-foreground text-sm">{data?.totalElements ?? 0} sesiones en total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva sesión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva sesión física</DialogTitle>
            </DialogHeader>
            <PhysicalSessionForm onSubmit={handleSubmit} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar las sesiones</AlertDescription>
        </Alert>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay sesiones físicas todavía.</p>
          <p className="text-sm">Registra tu primera sesión con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <PhysicalSessionCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Registrar la ruta en router.tsx**

En `src/app/router.tsx`, añadir el import:

```tsx
import { PhysicalSessionsPage } from '@/features/journal/physicalsession/pages/PhysicalSessionsPage'
```

Y reemplazar el placeholder de la ruta:

```tsx
// Cambiar esta línea:
{ path: 'journal/physical-sessions', element: <TrainingSessionsPage /> },
// Por:
{ path: 'journal/physical-sessions', element: <PhysicalSessionsPage /> },
```

- [ ] **Step 3: Verificar tipos y ejecutar tests**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20 && npm test -- --run 2>&1 | tail -10
```

Expected: sin errores TypeScript, todos los tests pasan

---

### Task 6: Hook de weekly-stats

**Files:**
- Create: `src/shared/api/dashboard.ts`

- [ ] **Step 1: Crear el archivo dashboard.ts**

```ts
// src/shared/api/dashboard.ts
import { apiClient } from './client'

export interface WeeklyStats {
  weekNumber: number
  weekStart: string   // ISO date "2026-05-04"
  weekEnd: string
  bjjSessions: number
  physicalSessions: number
  bjjGoal: number
  physicalGoal: number
  streakDays: number
  techniquesThisMonth: number
}

export function fetchWeeklyStats(): Promise<WeeklyStats> {
  return apiClient.get('dashboard/weekly-stats').json<WeeklyStats>()
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores

---

### Task 7: Rediseño completo de HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx` (reescritura completa)
- Delete: referencia a `DashboardStats` (el archivo queda obsoleto pero no borrar — puede reutilizarse)

- [ ] **Step 1: Reescribir HomePage.tsx completo**

```tsx
// src/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import { useTrainingSessions } from '@/features/journal/trainingsession/hooks'
import { usePhysicalSessions } from '@/features/journal/physicalsession/hooks'
import { Spinner } from '@/shared/components/ui/spinner'
import { cn } from '@/shared/lib/utils'

export function HomePage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['weekly-stats'],
    queryFn: fetchWeeklyStats,
  })

  const { data: bjjData } = useTrainingSessions()
  const { data: physData } = usePhysicalSessions({ page: 0, size: 5 })

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const bjjSessions = bjjData?.content?.filter(Boolean) ?? []
  const physSessions = physData?.content?.filter(Boolean) ?? []

  const hasBjjOnDay = (day: Date) =>
    bjjSessions.some((s) => isSameDay(new Date(s.sessionDate), day))
  const hasPhysOnDay = (day: Date) =>
    physSessions.some((s) => isSameDay(new Date(s.sessionDate), day))

  const bjjPct = stats ? Math.min((stats.bjjSessions / stats.bjjGoal) * 100, 100) : 0
  const physPct = stats ? Math.min((stats.physicalSessions / stats.physicalGoal) * 100, 100) : 0

  // SVG ring helpers
  const BJJ_R = 34
  const GYM_R = 23
  const circumference = (r: number) => 2 * Math.PI * r
  const dashArray = (pct: number, r: number) => {
    const c = circumference(r)
    return `${(pct / 100) * c} ${c - (pct / 100) * c}`
  }
  const dashOffset = (r: number) => circumference(r) * 0.25  // start at top

  return (
    <div className="space-y-0 max-w-2xl mx-auto">
      {/* Greeting */}
      <div className="pb-4 border-b border-border mb-4">
        <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Buenas.
        </h1>
        <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {format(today, "EEEE d 'de' MMMM", { locale: es })} · Semana {stats?.weekNumber ?? '—'}
        </p>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today)
          const bjj = hasBjjOnDay(day)
          const phys = hasPhysOnDay(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border flex flex-col items-center py-1.5 px-0',
                isToday ? 'border-foreground bg-foreground' : 'border-border bg-card',
              )}
            >
              <span
                className={cn('text-[7px] uppercase', isToday ? 'text-background' : 'text-muted-foreground')}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
              >
                {format(day, 'EEE', { locale: es }).slice(0, 2)}
              </span>
              <span
                className={cn('font-bold leading-tight', isToday ? 'text-background' : 'text-foreground')}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              >
                {format(day, 'd')}
              </span>
              <div className="flex gap-0.5 mt-1 min-h-[5px]">
                {bjj && (
                  <div className={cn('w-1 h-1 rounded-full', isToday ? 'bg-background' : 'bg-foreground')} />
                )}
                {phys && (
                  <div className={cn('w-1 h-1 rounded-full', isToday ? 'bg-background/60' : 'bg-muted-foreground')} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BJJ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Físico</span>
        </div>
      </div>

      {/* Stats band */}
      {statsLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 border border-border mb-4">
            {[
              { val: stats?.bjjSessions ?? 0, label: 'BJJ', sub: 'esta semana' },
              { val: stats?.physicalSessions ?? 0, label: 'Físico', sub: 'esta semana' },
              { val: stats?.streakDays ?? 0, label: 'Racha', sub: 'días' },
            ].map(({ val, label, sub }, i) => (
              <div key={label} className={cn('py-3 text-center', i < 2 && 'border-r border-border')}>
                <div className="leading-none" style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 900 }}>
                  {val}
                </div>
                <div className="mt-1 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--color-muted-foreground)', opacity: 0.5 }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {/* Activity rings */}
          <div className="flex items-center gap-4 p-3 border border-border mb-4">
            <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
              {/* BJJ outer ring */}
              <circle cx="40" cy="40" r={BJJ_R} fill="none" stroke="var(--color-border)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r={BJJ_R}
                fill="none"
                stroke="var(--color-foreground)"
                strokeWidth="7"
                strokeDasharray={dashArray(bjjPct, BJJ_R)}
                strokeDashoffset={dashOffset(BJJ_R)}
                strokeLinecap="butt"
              />
              {/* Gym inner ring */}
              <circle cx="40" cy="40" r={GYM_R} fill="none" stroke="var(--color-border)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r={GYM_R}
                fill="none"
                stroke="var(--color-muted-foreground)"
                strokeWidth="7"
                strokeDasharray={dashArray(physPct, GYM_R)}
                strokeDashoffset={dashOffset(GYM_R)}
                strokeLinecap="butt"
              />
              <text x="40" y="37" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', fill: 'var(--color-muted-foreground)', fontWeight: 700 }}>METAS</text>
              <text x="40" y="47" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fill: 'var(--color-foreground)', fontWeight: 700 }}>
                {(stats?.bjjSessions ?? 0) + (stats?.physicalSessions ?? 0)}/{(stats?.bjjGoal ?? 4) + (stats?.physicalGoal ?? 3)}
              </text>
            </svg>
            <div className="flex-1 space-y-2">
              {[
                { dot: 'bg-foreground', label: 'BJJ semanal', val: `${stats?.bjjSessions ?? 0}`, sub: `/ ${stats?.bjjGoal ?? 4}` },
                { dot: 'bg-muted-foreground', label: 'Físico semanal', val: `${stats?.physicalSessions ?? 0}`, sub: `/ ${stats?.physicalGoal ?? 3}` },
                { dot: 'bg-border border border-muted-foreground', label: 'Racha activa', val: `${stats?.streakDays ?? 0}d`, sub: '' },
              ].map(({ dot, label, val, sub }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
                  <span className="flex-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {label}
                  </span>
                  <span className="font-bold text-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>{val}</span>
                  {sub && <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px' }}>{sub}</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Últimas sesiones */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            Últimas sesiones
          </h2>
          <div className="flex gap-3">
            <Link to="/journal/training-sessions" className="text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              BJJ →
            </Link>
            <Link to="/journal/physical-sessions" className="text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Físico →
            </Link>
          </div>
        </div>

        {[
          ...bjjSessions.slice(0, 3).map((s) => ({ type: 'BJJ' as const, date: s.sessionDate, name: `Sesión BJJ · ${s.intensity ?? ''}`, id: s.id, to: '/journal/training-sessions' })),
          ...physSessions.slice(0, 2).map((s) => ({ type: 'GYM' as const, date: s.sessionDate, name: s.title, id: s.id, to: '/journal/physical-sessions' })),
        ]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5)
          .map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.to}
              className="flex items-center gap-2 py-2 border-b border-border hover:bg-accent transition-colors px-1"
            >
              <span
                className={cn(
                  'border px-1.5 py-0.5 shrink-0',
                  item.type === 'BJJ' ? 'border-foreground text-foreground' : 'border-muted-foreground text-muted-foreground',
                )}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                {item.type}
              </span>
              <span className="flex-1 text-sm text-foreground truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                {item.name}
              </span>
              <span className="text-muted-foreground shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '8px' }}>
                {item.date}
              </span>
            </Link>
          ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores TypeScript

- [ ] **Step 3: Ejecutar todos los tests**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run 2>&1 | tail -15
```

Expected: todos los tests pasan

---

### Task 8: Verificación visual + commit

- [ ] **Step 1: Arrancar el backend (en otra terminal)**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
./mvnw spring-boot:run -q
```

- [ ] **Step 2: Arrancar el frontend**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm run dev
```

- [ ] **Step 3: Verificar en `http://localhost:5173`**
  - La página de inicio muestra el saludo, week strip con días de la semana actual
  - Las stats muestran los valores del endpoint `weekly-stats`
  - Los anillos SVG se renderizan correctamente (2 anillos concéntricos)
  - Las últimas sesiones (BJJ y físico) aparecen ordenadas por fecha
  - La ruta `/journal/physical-sessions` muestra la nueva página con el formulario

- [ ] **Step 4: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git add src/features/journal/physicalsession/ \
        src/shared/api/dashboard.ts \
        src/pages/HomePage.tsx \
        src/app/router.tsx
git commit -m "feat: módulo físico + dashboard rediseñado con stats semanales y anillos"
```
