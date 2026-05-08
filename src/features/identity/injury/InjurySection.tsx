import { useState } from 'react'
import { useInjuries, useCreateInjury, useDeleteInjury } from './hooks'
import {
  type InjurySeverity,
  type InjuryStatus,
  type CreateInjuryRequest,
  SEVERITY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
} from './types'

const SEVERITIES: InjurySeverity[] = ['MILD', 'MODERATE', 'SEVERE']
const STATUSES: InjuryStatus[] = ['ACTIVE', 'RECOVERED', 'CHRONIC']

const EMPTY_FORM: CreateInjuryRequest = {
  bodyPart: '',
  description: '',
  severity: 'MILD',
  status: 'ACTIVE',
  startedOn: '',
  recoveredOn: '',
}

export function InjurySection() {
  const { data: injuries = [], isLoading } = useInjuries()
  const createInjury = useCreateInjury()
  const deleteInjury = useDeleteInjury()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateInjuryRequest>(EMPTY_FORM)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CreateInjuryRequest = {
      bodyPart: form.bodyPart,
      severity: form.severity,
      status: form.status,
      description: form.description || undefined,
      startedOn: form.startedOn || undefined,
      recoveredOn: form.status === 'RECOVERED' ? form.recoveredOn || undefined : undefined,
    }
    createInjury.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM)
        setShowForm(false)
      },
    })
  }

  function handleCancel() {
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  return (
    <section className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lesiones y dolencias</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Añadir lesión
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Registra tus lesiones actuales, pasadas o crónicas para que OssFlow las tenga en cuenta.
      </p>

      {/* Lista de lesiones */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : injuries.length > 0 ? (
        <ul className="space-y-2">
          {injuries.map((injury) => (
            <li
              key={injury.id}
              className="flex items-start justify-between gap-3 rounded-md border px-4 py-3"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium">{injury.bodyPart}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[injury.status]}`}
                  >
                    {STATUS_LABELS[injury.status]}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {SEVERITY_LABELS[injury.severity]}
                  </span>
                </div>
                {injury.description && (
                  <p className="text-sm text-muted-foreground truncate max-w-sm">
                    {injury.description}
                  </p>
                )}
                {injury.startedOn && (
                  <p className="font-mono text-xs text-muted-foreground">
                    Desde: {injury.startedOn}
                    {injury.recoveredOn ? ` · Recuperado: ${injury.recoveredOn}` : ''}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Eliminar lesión"
                onClick={() => deleteInjury.mutate(injury.id)}
                disabled={deleteInjury.isPending}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !showForm && (
          <p className="text-sm text-muted-foreground italic">
            No hay lesiones registradas.
          </p>
        )
      )}

      {/* Formulario inline */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-muted/30 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Zona corporal */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="bodyPart" className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Zona corporal *
              </label>
              <input
                id="bodyPart"
                name="bodyPart"
                type="text"
                required
                maxLength={100}
                placeholder="p.ej. Rodilla derecha"
                value={form.bodyPart}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Severidad */}
            <div className="space-y-1">
              <label htmlFor="severity" className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Severidad *
              </label>
              <select
                id="severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <label htmlFor="status" className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Estado *
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha inicio */}
            <div className="space-y-1">
              <label htmlFor="startedOn" className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Fecha inicio
              </label>
              <input
                id="startedOn"
                name="startedOn"
                type="date"
                value={form.startedOn ?? ''}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Fecha recuperación — solo si status=RECOVERED */}
            {form.status === 'RECOVERED' && (
              <div className="space-y-1">
                <label htmlFor="recoveredOn" className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Fecha recuperación
                </label>
                <input
                  id="recoveredOn"
                  name="recoveredOn"
                  type="date"
                  value={form.recoveredOn ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {/* Descripción */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="description" className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={10000}
                placeholder="Detalles sobre la lesión, tratamiento, etc."
                value={form.description ?? ''}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createInjury.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createInjury.isPending ? 'Guardando...' : 'Guardar lesión'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
