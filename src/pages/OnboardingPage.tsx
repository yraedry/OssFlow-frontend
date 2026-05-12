import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import { useFederations } from '@/features/identity/federation/hooks'
import { useCreateProfile } from '@/features/identity/profile/hooks'
import { replaceFederations } from '@/features/identity/profile/api'
import { useSaveWeeklyTemplate } from '@/features/planning/weeklytemplate/hooks'
import { AuthLogo } from '@/features/auth/components/AuthLayout'
import { MONO, SERIF } from '@/shared/lib/typography'
import { WeeklyTemplateStep } from './onboarding/WeeklyTemplateStep'
import type { FederationAssignment } from '@/features/identity/federation/types'
import type { SaveWeeklyTemplateForm } from '@/features/planning/weeklytemplate/schemas'

const THEME_KEY = 'ossflow-theme'
const ONBOARDING_KEY = 'ossflow-onboarding'

function applyTheme(theme: 'dark' | 'light') {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
}

const BELTS = [
  { value: 'WHITE', label: 'Blanco' },
  { value: 'BLUE', label: 'Azul' },
  { value: 'PURPLE', label: 'Morado' },
  { value: 'BROWN', label: 'Marrón' },
  { value: 'BLACK', label: 'Negro' },
]

const MODALITIES = [
  { value: 'GI', label: 'Gi (con kimono)' },
  { value: 'NOGI', label: 'No-Gi (sin kimono)' },
  { value: 'BOTH', label: 'Ambas' },
]

const step1Schema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  displayName: z.string().min(1, 'El alias es requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
})

type Step1Form = z.infer<typeof step1Schema>

type OnboardingData = {
  firstName?: string
  lastName?: string
  displayName: string
  currentBelt: string
  preferredModality: string
  academy?: string
  federations: FederationAssignment[]
  weeklyTemplateSet: boolean
}

type PersistedOnboarding = { step: 1 | 2 | 3 | 4 | 5; data: OnboardingData }

function loadOnboarding(): PersistedOnboarding | null {
  try {
    const raw = sessionStorage.getItem(ONBOARDING_KEY)
    return raw ? (JSON.parse(raw) as PersistedOnboarding) : null
  } catch {
    return null
  }
}

function saveOnboarding(step: 1 | 2 | 3 | 4 | 5, data: OnboardingData) {
  sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify({ step, data }))
}

function clearOnboarding() {
  sessionStorage.removeItem(ONBOARDING_KEY)
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-px flex-1 transition-colors ${i < current ? 'bg-foreground' : 'bg-border'}`}
        />
      ))}
    </div>
  )
}

function FieldBlock({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs uppercase tracking-widest text-muted-foreground" style={MONO}>
        {label}
      </label>
      {children}
      {error && <p className="text-destructive text-xs" style={MONO}>{error}</p>}
    </div>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const persisted = loadOnboarding()
  const [step, setStepRaw] = useState<1 | 2 | 3 | 4 | 5>(persisted?.step ?? 1)
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [data, setDataRaw] = useState<OnboardingData>(persisted?.data ?? {
    firstName: undefined,
    lastName: undefined,
    displayName: '',
    currentBelt: '',
    preferredModality: '',
    academy: undefined,
    federations: [],
    weeklyTemplateSet: false,
  })

  function setStep(s: 1 | 2 | 3 | 4 | 5) {
    setStepRaw(s)
    saveOnboarding(s, data)
  }

  function setData(updater: OnboardingData | ((prev: OnboardingData) => OnboardingData)) {
    const next = typeof updater === 'function' ? updater(data) : updater
    saveOnboarding(step, next)
    setDataRaw(next)
  }

  const { data: federations, isLoading: loadingFeds } = useFederations()
  const createProfile = useCreateProfile()
  const saveWeeklyTemplate = useSaveWeeklyTemplate()

  const { register, handleSubmit, control, formState: { errors } } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName,
      currentBelt: data.currentBelt,
      preferredModality: data.preferredModality,
      academy: data.academy,
    },
  })

  const handleStep1 = (formData: Step1Form) => {
    setData((prev) => ({ ...prev, ...formData }))
    setStep(3)
  }

  const handleWeeklyTemplate = async (form: SaveWeeklyTemplateForm | null) => {
    if (form) {
      await saveWeeklyTemplate.mutateAsync(form)
      setData(prev => ({ ...prev, weeklyTemplateSet: true }))
    }
    setStep(4)
  }

  const handleFinish = async () => {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
    await createProfile.mutateAsync({
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      alias: data.displayName || undefined,
      displayName: fullName || data.displayName,
      currentBelt: data.currentBelt,
      preferredModality: data.preferredModality,
      academy: data.academy || undefined,
    })
    if (data.federations.length > 0) {
      await replaceFederations(data.federations)
    }
    clearOnboarding()
    navigate('/', { replace: true })
  }

  const stepTitles: Record<number, string> = {
    1: 'Elige tu tema',
    2: 'Tu perfil',
    3: 'Planificación semanal',
    4: 'Federaciones',
    5: 'Resumen',
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className={`w-full ${step === 3 ? 'max-w-xl' : 'max-w-sm'}`}>
        <div className="mb-8 flex flex-col items-center gap-4">
          <AuthLogo />
          <div className="text-center">
            <h1 className="text-foreground" style={{ ...SERIF, fontSize: '22px' }}>{stepTitles[step]}</h1>
            <p className="text-muted-foreground mt-1.5 text-xs uppercase tracking-widest" style={MONO}>
              Paso {step} de 5
            </p>
          </div>
          <div className="w-full">
            <StepIndicator current={step} total={5} />
          </div>
        </div>

        <div className="border border-border bg-card p-8 space-y-5">
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-xs text-muted-foreground" style={MONO}>
                OssFlow usará el tema de tu sistema por defecto. Puedes cambiarlo aquí o en cualquier momento desde Configuración.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedTheme('dark'); applyTheme('dark') }}
                  className={`flex flex-col items-center gap-3 border p-5 transition-colors ${
                    selectedTheme === 'dark'
                      ? 'border-foreground bg-[#0f0f0f]'
                      : 'border-border bg-[#0f0f0f] opacity-60 hover:opacity-100'
                  }`}
                >
                  <Moon className="h-5 w-5 text-[#f0ebe3]" strokeWidth={1.5} />
                  <span style={{ ...MONO, fontSize: '10px', color: '#f0ebe3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Oscuro
                  </span>
                  {selectedTheme === 'dark' && (
                    <span style={{ ...MONO, fontSize: '9px', color: '#f0ebe3' }}>✓ Seleccionado</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedTheme('light'); applyTheme('light') }}
                  className={`flex flex-col items-center gap-3 border p-5 transition-colors ${
                    selectedTheme === 'light'
                      ? 'border-[#1a1a1a] bg-[#fafaf8]'
                      : 'border-[#d0ccc6] bg-[#fafaf8] opacity-60 hover:opacity-100'
                  }`}
                >
                  <Sun className="h-5 w-5 text-[#1a1a1a]" strokeWidth={1.5} />
                  <span style={{ ...MONO, fontSize: '10px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Claro
                  </span>
                  {selectedTheme === 'light' && (
                    <span style={{ ...MONO, fontSize: '9px', color: '#1a1a1a' }}>✓ Seleccionado</span>
                  )}
                </button>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>Continuar</Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleStep1)} className="space-y-4" noValidate>

              {/* Nombre / Apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <FieldBlock label="Nombre">
                  <Input id="firstName" {...register('firstName')} placeholder="Juan" autoFocus />
                </FieldBlock>
                <FieldBlock label="Apellidos">
                  <Input id="lastName" {...register('lastName')} placeholder="García" />
                </FieldBlock>
              </div>

              {/* Alias */}
              <FieldBlock label="Alias *" error={errors.displayName?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none" style={MONO}>@</span>
                  <Input
                    id="displayName"
                    {...register('displayName')}
                    className="pl-6"
                    placeholder="tu_alias"
                  />
                </div>
              </FieldBlock>

              {/* Cinturón / Modalidad */}
              <div className="grid grid-cols-2 gap-3">
                <FieldBlock label="Cinturón *" error={errors.currentBelt?.message}>
                  <Controller
                    control={control}
                    name="currentBelt"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {BELTS.map((b) => (
                            <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldBlock>
                <FieldBlock label="Modalidad *" error={errors.preferredModality?.message}>
                  <Controller
                    control={control}
                    name="preferredModality"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODALITIES.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldBlock>
              </div>

              {/* Academia */}
              <FieldBlock label="Academia (opcional)">
                <Input id="academy" {...register('academy')} placeholder="Nombre de tu academia" />
              </FieldBlock>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Atrás</Button>
                <Button type="submit" className="flex-1">Siguiente</Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <WeeklyTemplateStep
              onNext={handleWeeklyTemplate}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>
                  Federaciones
                </p>
                <p className="text-xs text-muted-foreground mb-3" style={MONO}>
                  ¿Con qué federaciones compites? (opcional — puedes añadirlas más tarde desde tu perfil)
                </p>
                {loadingFeds ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <FederationSelector
                    federations={federations ?? []}
                    selected={data.federations}
                    onChange={(selected) => setData((prev) => ({ ...prev, federations: selected }))}
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)}
                  className="flex-1 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer"
                  style={MONO}>Atrás</button>
                <button type="button" onClick={() => setStep(5)}
                  className="flex-[2] py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity cursor-pointer"
                  style={MONO}>Siguiente</button>
              </div>
              <button
                type="button"
                onClick={() => { setData(prev => ({ ...prev, federations: [] })); setStep(5) }}
                className="w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
                style={MONO}
              >
                Saltar este paso
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="border border-border p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground" style={MONO}>Resumen</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground" style={MONO}>Tema</p>
                    <p className="text-sm font-medium">{selectedTheme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" style={MONO}>Alias</p>
                    <p className="text-sm font-medium">@{data.displayName}</p>
                  </div>
                  {(data.firstName || data.lastName) && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground" style={MONO}>Nombre</p>
                      <p className="text-sm font-medium">{[data.firstName, data.lastName].filter(Boolean).join(' ')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground" style={MONO}>Cinturón</p>
                    <p className="text-sm font-medium">
                      {BELTS.find((b) => b.value === data.currentBelt)?.label ?? data.currentBelt}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" style={MONO}>Modalidad</p>
                    <p className="text-sm font-medium">
                      {MODALITIES.find((m) => m.value === data.preferredModality)?.label ?? data.preferredModality}
                    </p>
                  </div>
                  {data.academy && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground" style={MONO}>Academia</p>
                      <p className="text-sm font-medium">{data.academy}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground" style={MONO}>Planificación semanal</p>
                  <p className="text-sm">{data.weeklyTemplateSet ? 'Configurada' : 'No configurada'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground" style={MONO}>Federaciones</p>
                  <p className="text-sm">
                    {data.federations.length === 0
                      ? 'Ninguna seleccionada'
                      : `${data.federations.length} seleccionada(s)`}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center" style={MONO}>
                Puedes cambiar el tema en cualquier momento desde Configuración →  Apariencia.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>Atrás</Button>
                <Button className="flex-1" onClick={handleFinish} disabled={createProfile.isPending}>
                  {createProfile.isPending ? 'Creando perfil...' : 'Empezar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
