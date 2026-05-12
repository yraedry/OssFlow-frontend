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
import { AuthLogo } from '@/features/auth/components/AuthLayout'
import { MONO, SERIF } from '@/shared/lib/typography'
import type { FederationAssignment } from '@/features/identity/federation/types'

const THEME_KEY = 'ossflow-theme'

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
  displayName: z.string().min(1, 'El nombre es requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
})

type Step1Form = z.infer<typeof step1Schema>

type OnboardingData = {
  displayName: string
  currentBelt: string
  preferredModality: string
  academy?: string
  federations: FederationAssignment[]
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    currentBelt: '',
    preferredModality: '',
    academy: undefined,
    federations: [],
  })

  const { data: federations, isLoading: loadingFeds } = useFederations()
  const createProfile = useCreateProfile()

  const { register, handleSubmit, control, formState: { errors } } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
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

  const handleFinish = async () => {
    await createProfile.mutateAsync({
      displayName: data.displayName,
      currentBelt: data.currentBelt,
      preferredModality: data.preferredModality,
      academy: data.academy || undefined,
    })
    if (data.federations.length > 0) {
      await replaceFederations(data.federations)
    }
    navigate('/', { replace: true })
  }

  const stepTitles: Record<number, string> = {
    1: 'Elige tu tema',
    2: 'Tu perfil',
    3: 'Federaciones',
    4: 'Resumen',
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <AuthLogo />
          <div className="text-center">
            <h1 className="text-foreground" style={{ ...SERIF, fontSize: '22px' }}>{stepTitles[step]}</h1>
            <p className="text-muted-foreground mt-1.5 text-xs uppercase tracking-widest" style={MONO}>
              Paso {step} de 4
            </p>
          </div>
          <div className="w-full">
            <StepIndicator current={step} total={4} />
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
              <FieldBlock label="Tu nombre" error={errors.displayName?.message}>
                <Input id="displayName" {...register('displayName')} placeholder="Ej: Juan García" autoFocus />
              </FieldBlock>

              <FieldBlock label="Cinturón actual" error={errors.currentBelt?.message}>
                <Controller
                  control={control}
                  name="currentBelt"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu cinturón" />
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

              <FieldBlock label="Modalidad preferida" error={errors.preferredModality?.message}>
                <Controller
                  control={control}
                  name="preferredModality"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Gi, No-Gi o ambas" />
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
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Atrás</Button>
                <Button className="flex-1" onClick={() => setStep(4)}>Siguiente</Button>
              </div>
              <button
                type="button"
                onClick={() => { setData(prev => ({ ...prev, federations: [] })); setStep(4) }}
                className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
                style={MONO}
              >
                Saltar este paso
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="border border-border p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground" style={MONO}>Resumen</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground" style={MONO}>Tema</p>
                    <p className="text-sm font-medium">{selectedTheme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" style={MONO}>Nombre</p>
                    <p className="text-sm font-medium">{data.displayName}</p>
                  </div>
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
                    <div>
                      <p className="text-xs text-muted-foreground" style={MONO}>Academia</p>
                      <p className="text-sm font-medium">{data.academy}</p>
                    </div>
                  )}
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
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Atrás</Button>
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
