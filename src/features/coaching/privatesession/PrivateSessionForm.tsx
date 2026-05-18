import { useState, useRef, useEffect } from 'react'
import { useCreatePrivateSession, useUpdatePrivateSession } from './hooks'
import { TechniqueFamilyPicker } from '@/features/coaching/components/TechniqueFamilyPicker'
import type { PrivateSession, CreatePrivateSessionPayload, UpdatePrivateSessionPayload } from './types'

type Mode =
  | { kind: 'create'; athleteId: number }
  | { kind: 'edit'; session: PrivateSession }

type Props = {
  mode: Mode
  onClose: () => void
}

// ─── Custom Date Picker ───────────────────────────────────────────────────────

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES = ['Lu','Ma','Mi','Ju','Vi','Sá','Do']

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplay(iso: string): string {
  const d = parseDate(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

function DatePicker({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => parseDate(value || formatIso(new Date())))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const offset = (firstDay + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const selected = value ? parseDate(value) : null

  function selectDay(day: number) {
    const d = new Date(year, month, day)
    onChange(formatIso(d))
    setOpen(false)
  }

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCursor(new Date(year, month + 1, 1))
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
      >
        {value ? formatDisplay(value) : <span className="text-muted-foreground">— Seleccionar —</span>}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border border-border shadow-xl w-64 p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="font-mono text-xs text-muted-foreground hover:text-foreground px-1 cursor-pointer">←</button>
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
              {MONTHS_ES[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} className="font-mono text-xs text-muted-foreground hover:text-foreground px-1 cursor-pointer">→</button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-px">
            {DAYS_ES.map(d => (
              <div key={d} className="text-center font-mono text-[8px] uppercase tracking-widest text-muted-foreground/50 py-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-px">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />
              const isSelected = selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`text-center font-mono text-[11px] py-1 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted/50 text-foreground/80'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Technique Family Multi-Select ────────────────────────────────────────────

function TechniqueMultiSelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [pickerValue, setPickerValue] = useState('')

  function handlePickerChange(family: string) {
    if (!family) return
    setPickerValue(family)
  }

  function handleTechniqueSelect(technique: { id: number | null; name: string; family: string }) {
    if (!technique.family) return
    // Use technique name if available, otherwise fall back to family label
    const value = technique.name || technique.family
    if (!selected.includes(value)) {
      onChange([...selected, value])
    }
    // Reset picker after adding
    setPickerValue('')
  }

  function remove(value: string) {
    onChange(selected.filter(v => v !== value))
  }

  return (
    <div className="space-y-2">
      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Técnicas practicadas (opcional)
      </label>
      <TechniqueFamilyPicker
        value={pickerValue}
        onChange={handlePickerChange}
        onTechniqueSelect={handleTechniqueSelect}
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map(val => (
            <span
              key={val}
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide px-2 py-1 border border-foreground bg-foreground/5 text-foreground"
            >
              {val}
              <button
                type="button"
                onClick={() => remove(val)}
                aria-label={`Eliminar ${val}`}
                className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function PrivateSessionForm({ mode, onClose }: Props) {
  const athleteId = mode.kind === 'create' ? mode.athleteId : mode.session.athleteId

  const initial = mode.kind === 'edit' ? mode.session : null
  const [sessionDate, setSessionDate] = useState(initial?.sessionDate ?? formatIso(new Date()))
  const [startTime, setStartTime] = useState(initial?.startTime?.slice(0, 5) ?? '')
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes?.toString() ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [techniquesWorked, setTechniquesWorked] = useState<string[]>(initial?.techniquesWorked ?? [])

  const create = useCreatePrivateSession(athleteId)
  const update = useUpdatePrivateSession(athleteId)
  const isPending = create.isPending || update.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const common = {
      sessionDate,
      startTime: startTime || null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      title: title || null,
      notes: notes || null,
      techniquesWorked: techniquesWorked.length ? techniquesWorked : [],
    }

    if (mode.kind === 'create') {
      const payload: CreatePrivateSessionPayload = { athleteId, ...common }
      create.mutate(payload, { onSuccess: onClose })
    } else {
      const payload: UpdatePrivateSessionPayload = common
      update.mutate({ id: mode.session.id, payload }, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">
            {mode.kind === 'create' ? 'Registrar sesión' : 'Editar sesión'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Fecha *
            </label>
            <DatePicker value={sessionDate} onChange={setSessionDate} required />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Hora (opcional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="flex-1">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="60"
                className="w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Título (opcional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Single leg X — entrada desde guard"
              className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Notas (opcional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Qué se trabajó, puntos a mejorar..."
              className="w-full border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <TechniqueMultiSelect selected={techniquesWorked} onChange={setTechniquesWorked} />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
