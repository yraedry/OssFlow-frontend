import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '@/features/planning/weeklytemplate/types'
import type { DayOfWeek, SessionType } from '@/features/planning/weeklytemplate/types'
import type { SaveWeeklyTemplateForm } from '@/features/planning/weeklytemplate/schemas'
import { MONO } from '@/shared/lib/typography'

const SESSION_TYPES: { key: SessionType; label: string; color: string }[] = [
  { key: 'BJJ',         label: 'BJJ',      color: '#4a7cff' },
  { key: 'STRENGTH',    label: 'Fuerza',   color: '#f59e0b' },
  { key: 'CARDIO',      label: 'Cardio',   color: '#10b981' },
  { key: 'MOBILITY',    label: 'Movil.',   color: '#a855f7' },
  { key: 'FLEXIBILITY', label: 'Flexib.',  color: '#06b6d4' },
]

type Slot = { type: SessionType; time?: string }
type State = Record<DayOfWeek, Slot[]>

function buildEmpty(): State {
  return ALL_DAYS.reduce<State>((acc, d) => { acc[d] = []; return acc }, {} as State)
}

type Props = {
  onNext: (data: SaveWeeklyTemplateForm | null) => void
  onBack: () => void
}

export function WeeklyTemplateStep({ onNext, onBack }: Props) {
  const [state, setState] = useState<State>(buildEmpty)

  function isActive(day: DayOfWeek, type: SessionType) {
    return state[day].some(s => s.type === type)
  }

  function toggleType(day: DayOfWeek, type: SessionType) {
    setState(prev => {
      const slots = prev[day]
      if (slots.some(s => s.type === type)) {
        return { ...prev, [day]: slots.filter(s => s.type !== type) }
      }
      return { ...prev, [day]: [...slots, { type }] }
    })
  }

  function setTime(day: DayOfWeek, type: SessionType, slotIdx: number, value: string) {
    setState(prev => {
      const slots = [...prev[day]]
      const positions = prev[day].reduce<number[]>((acc, s, i) => s.type === type ? [...acc, i] : acc, [])
      slots[positions[slotIdx]] = { ...slots[positions[slotIdx]], time: value || undefined }
      return { ...prev, [day]: slots }
    })
  }

  function addSlot(day: DayOfWeek, type: SessionType) {
    setState(prev => ({ ...prev, [day]: [...prev[day], { type }] }))
  }

  function removeSlot(day: DayOfWeek, type: SessionType, slotIdx: number) {
    setState(prev => {
      let count = -1
      return {
        ...prev,
        [day]: prev[day].filter(s => {
          if (s.type !== type) return true
          count++
          return count !== slotIdx
        }),
      }
    })
  }

  function handleNext() {
    const anyActive = ALL_DAYS.some(d => state[d].length > 0)
    if (!anyActive) { onNext(null); return }
    onNext({
      days: ALL_DAYS
        .filter(day => state[day].length > 0)
        .map(day => ({ dayOfWeek: day, sessions: state[day].map(s => ({ type: s.type, time: s.time })) })),
    })
  }

  return (
    <div className="space-y-4">
      <div className="border border-border divide-y divide-border">
        {ALL_DAYS.map(day => {
          const activeSlots = state[day]
          const hasActive = activeSlots.length > 0

          return (
            <div key={day}>
              {/* Fila principal: día + chips de tipo */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className="w-[58px] shrink-0"
                  style={{
                    ...MONO, fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: hasActive ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  }}
                >
                  {DAY_LABELS[day]}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {SESSION_TYPES.map(({ key, label, color }) => {
                    const active = isActive(day, key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleType(day, key)}
                        className="px-2.5 py-1 border transition-all focus:outline-none cursor-pointer select-none"
                        style={{
                          ...MONO, fontSize: '9px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          backgroundColor: active ? color : 'transparent',
                          borderColor: active ? color : 'var(--color-border)',
                          color: active ? '#fff' : 'var(--color-muted-foreground)',
                        }}
                        aria-pressed={active}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Zona de detalle: hora + doble sesión, solo si hay activos */}
              {hasActive && (
                <div className="flex flex-wrap gap-2 px-3 pb-2.5 pl-[82px]">
                  {SESSION_TYPES.map(({ key, label, color }) => {
                    const slots = activeSlots.filter(s => s.type === key)
                    if (slots.length === 0) return null
                    return slots.map((slot, i) => (
                      <div key={`${key}-${i}`} className="flex items-center gap-0.5">
                        {/* Badge del tipo */}
                        <span
                          className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide shrink-0"
                          style={{ ...MONO, backgroundColor: `${color}22`, color, borderLeft: `2px solid ${color}` }}
                        >
                          {label}{slots.length > 1 ? ` ${i + 1}` : ''}
                        </span>
                        {/* Input hora */}
                        <input
                          type="time"
                          value={slot.time ?? ''}
                          onChange={e => setTime(day, key, i, e.target.value)}
                          aria-label={`Hora ${label}`}
                          className="focus:outline-none cursor-pointer bg-transparent"
                          style={{
                            ...MONO, fontSize: '9px', width: '54px', padding: '2px 4px',
                            border: `1px solid ${slot.time ? color : 'var(--color-border)'}`,
                            color: slot.time ? color : 'var(--color-muted-foreground)',
                          }}
                        />
                        {/* Botón eliminar slot extra */}
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(day, key, i)}
                            aria-label={`Eliminar sesión ${label}`}
                            className="w-4 h-4 flex items-center justify-center border border-border hover:border-destructive hover:text-destructive transition-colors cursor-pointer bg-transparent"
                            style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}
                          >×</button>
                        )}
                      </div>
                    ))
                  })}
                  {/* Botón añadir sesión extra para tipos activos */}
                  {SESSION_TYPES.filter(({ key }) => isActive(day, key)).map(({ key, label, color }) => (
                    <button
                      key={`add-${key}`}
                      type="button"
                      onClick={() => addSlot(day, key)}
                      aria-label={`Añadir otra sesión de ${label}`}
                      className="px-1.5 py-0.5 border border-dashed hover:border-solid transition-all cursor-pointer bg-transparent"
                      style={{
                        ...MONO, fontSize: '8px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        borderColor: color, color,
                        opacity: 0.6,
                      }}
                    >+{label}</button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p
        className="text-center text-muted-foreground"
        style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        Pulsa un tipo para activarlo · la hora es opcional
      </p>

      <div className="flex gap-3">
        <button
          type="button" onClick={onBack}
          className="flex-1 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer"
          style={MONO}
        >Atrás</button>
        <button
          type="button" onClick={handleNext}
          className="flex-[2] py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity cursor-pointer"
          style={MONO}
        >Siguiente</button>
      </div>
      <button
        type="button" onClick={() => onNext(null)}
        className="w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
        style={MONO}
      >Saltar este paso</button>
    </div>
  )
}
