import { useState } from 'react'
import { Settings, Palette, Bell, Database, Sun, Moon, Monitor, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useTheme } from '@/shared/hooks/useTheme'

// ─── localStorage keys ────────────────────────────────────────────────────────

const KEY_MODALITY = 'ossflow-default-modality'
const KEY_WEIGHT   = 'ossflow-weight-unit'
const KEY_DURATION = 'ossflow-default-duration'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLocal(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {icon}
      {label}
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center transition-colors border ${
        checked ? 'bg-foreground border-foreground' : 'bg-transparent border-border'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform transition-transform ${
          checked ? 'translate-x-5 bg-background' : 'translate-x-1 bg-muted-foreground'
        }`}
      />
    </button>
  )
}

function DisabledToggle() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-[9px]">Próximamente</Badge>
      <div className="relative inline-flex h-5 w-9 items-center opacity-30 border border-border bg-transparent">
        <span className="inline-block h-3 w-3 translate-x-1 bg-muted-foreground" />
      </div>
    </div>
  )
}

// ─── Theme toggle (3-way: light / dark / system) ─────────────────────────────

const THEMES = [
  { value: 'light',  label: 'Claro',   icon: <Sun className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { value: 'dark',   label: 'Oscuro',  icon: <Moon className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { value: 'system', label: 'Sistema', icon: <Monitor className="h-3.5 w-3.5" strokeWidth={1.5} /> },
] as const

type ThemeValue = 'light' | 'dark' | 'system'

function ThemeSelector() {
  const { theme, toggleTheme } = useTheme()

  // Map the binary toggle to a 3-way value stored separately
  const [selected, setSelected] = useState<ThemeValue>(() => {
    const stored = localStorage.getItem('ossflow-theme-mode') as ThemeValue | null
    return stored ?? (theme as ThemeValue)
  })

  function handleSelect(value: ThemeValue) {
    setSelected(value)
    localStorage.setItem('ossflow-theme-mode', value)
    const root = window.document.documentElement
    if (value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.remove('light', 'dark')
      root.classList.add(prefersDark ? 'dark' : 'light')
      localStorage.setItem('ossflow-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.classList.remove('light', 'dark')
      root.classList.add(value)
      localStorage.setItem('ossflow-theme', value)
      // sync useTheme internal state by calling toggle only if different
      if (theme !== value) toggleTheme()
    }
  }

  return (
    <div className="flex border border-border overflow-hidden">
      {THEMES.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleSelect(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium transition-colors border-r border-border last:border-r-0 ${
            selected === value
              ? 'bg-foreground text-background'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
          style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Inline select ────────────────────────────────────────────────────────────

function InlineSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-border bg-background text-sm px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ─── Delete Account Dialog ────────────────────────────────────────────────────

function DeleteAccountButton() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle')

  if (step === 'done') {
    return (
      <div className="text-xs text-muted-foreground border border-border px-3 py-2">
        Esta funcionalidad estará disponible próximamente.
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-destructive">¿Confirmar eliminación?</span>
        <button
          type="button"
          onClick={() => setStep('done')}
          className="px-3 py-1 text-[10px] border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
          style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Sí, eliminar
        </button>
        <button
          type="button"
          onClick={() => setStep('idle')}
          className="px-3 py-1 text-[10px] border border-border text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setStep('confirm')}
      className="px-4 py-1.5 text-[10px] border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
      style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
    >
      Eliminar cuenta
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ConfiguracionPage() {
  const [modality, setModality] = useState(() => readLocal(KEY_MODALITY, 'BOTH'))
  const [weightUnit, setWeightUnit] = useState(() => readLocal(KEY_WEIGHT, 'kg') === 'kg')
  const [duration, setDuration] = useState(() => readLocal(KEY_DURATION, '60'))

  function handleModality(v: string) {
    setModality(v)
    localStorage.setItem(KEY_MODALITY, v)
  }

  function handleWeightUnit(checked: boolean) {
    setWeightUnit(checked)
    localStorage.setItem(KEY_WEIGHT, checked ? 'kg' : 'lbs')
  }

  function handleDuration(v: string) {
    setDuration(v)
    localStorage.setItem(KEY_DURATION, v)
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Page header */}
      <div>
        <h1
          className="text-2xl font-black"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza tu experiencia en OssFlow
        </p>
      </div>

      {/* ── Apariencia ── */}
      <section>
        <SectionTitle icon={<Palette className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Apariencia" />
        <Card>
          <CardContent className="py-0">
            <SettingRow
              label="Tema"
              description="Elige entre claro, oscuro o el tema del sistema"
            >
              <ThemeSelector />
            </SettingRow>
          </CardContent>
        </Card>
      </section>

      {/* ── Preferencias de entrenamiento ── */}
      <section>
        <SectionTitle icon={<Settings className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Preferencias de entrenamiento" />
        <Card>
          <CardContent className="py-0">
            <SettingRow
              label="Modalidad por defecto"
              description="Modalidad que se seleccionará al crear una sesión"
            >
              <InlineSelect
                value={modality}
                onChange={handleModality}
                options={[
                  { value: 'GI',   label: 'Gi' },
                  { value: 'NOGI', label: 'No-Gi' },
                  { value: 'BOTH', label: 'Ambas' },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Unidades de peso"
              description={`Actualmente: ${weightUnit ? 'kilogramos (kg)' : 'libras (lbs)'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>lbs</span>
                <Toggle checked={weightUnit} onChange={handleWeightUnit} />
                <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>kg</span>
              </div>
            </SettingRow>

            <SettingRow
              label="Duración por defecto de sesión"
              description="Minutos que se usarán al crear una sesión nueva"
            >
              <InlineSelect
                value={duration}
                onChange={handleDuration}
                options={[
                  { value: '30',  label: '30 min' },
                  { value: '60',  label: '60 min' },
                  { value: '90',  label: '90 min' },
                  { value: '120', label: '120 min' },
                ]}
              />
            </SettingRow>
          </CardContent>
        </Card>
      </section>

      {/* ── Notificaciones ── */}
      <section>
        <SectionTitle icon={<Bell className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Notificaciones" />
        <Card>
          <CardContent className="py-0">
            <SettingRow
              label="Recordatorio diario de entrenamiento"
              description="Recibe un aviso diario para no saltarte el entreno"
            >
              <DisabledToggle />
            </SettingRow>
            <SettingRow
              label="Resumen semanal por email"
              description="Un resumen de tu actividad cada semana"
            >
              <DisabledToggle />
            </SettingRow>
          </CardContent>
        </Card>
      </section>

      {/* ── Datos ── */}
      <section>
        <SectionTitle icon={<Database className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Datos" />
        <Card>
          <CardContent className="py-0">
            <SettingRow
              label="Exportar mis datos"
              description="Descarga toda tu información en formato JSON"
            >
              <Link
                to="/export"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:bg-accent transition-colors"
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Exportar
                <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </SettingRow>

            <SettingRow
              label="Eliminar cuenta"
              description="Elimina permanentemente tu cuenta y todos tus datos"
            >
              <DeleteAccountButton />
            </SettingRow>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
