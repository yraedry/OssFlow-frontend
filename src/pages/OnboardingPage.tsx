import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import { useFederations } from '@/features/identity/federation/hooks'
import { useCreateProfile } from '@/features/identity/profile/hooks'
import { replaceFederations } from '@/features/identity/profile/api'
import type { FederationAssignment } from '@/features/identity/federation/types'

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

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    currentBelt: '',
    preferredModality: '',
    academy: undefined,
    federations: [],
  })

  const { data: federations, isLoading: loadingFeds } = useFederations()
  const createProfile = useCreateProfile()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1Form>({
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
    setStep(2)
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bienvenido a OssFlow</h1>
          <p className="text-muted-foreground">Paso {step} de 3</p>
          <div className="flex gap-1 justify-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit(handleStep1)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Tu nombre</Label>
              <Input
                id="displayName"
                {...register('displayName')}
                placeholder="Ej: Juan García"
                autoFocus
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cinturón actual</Label>
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
              {errors.currentBelt && (
                <p className="text-sm text-destructive">{errors.currentBelt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Modalidad preferida</Label>
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
              {errors.preferredModality && (
                <p className="text-sm text-destructive">{errors.preferredModality.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="academy">Academia (opcional)</Label>
              <Input
                id="academy"
                {...register('academy')}
                placeholder="Nombre de tu academia"
              />
            </div>

            <Button type="submit" className="w-full">
              Siguiente
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-1">Selecciona tus federaciones</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Puedes seleccionar una o más federaciones con las que compites o entrenas.
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
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h2 className="font-semibold">Resumen</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p className="font-medium">{data.displayName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cinturón</p>
                  <p className="font-medium">
                    {BELTS.find((b) => b.value === data.currentBelt)?.label ?? data.currentBelt}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modalidad</p>
                  <p className="font-medium">
                    {MODALITIES.find((m) => m.value === data.preferredModality)?.label ?? data.preferredModality}
                  </p>
                </div>
                {data.academy && (
                  <div>
                    <p className="text-muted-foreground">Academia</p>
                    <p className="font-medium">{data.academy}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Federaciones</p>
                <p className="text-sm">
                  {data.federations.length === 0
                    ? 'Ninguna seleccionada'
                    : `${data.federations.length} seleccionada(s)`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button
                className="flex-1"
                onClick={handleFinish}
                disabled={createProfile.isPending}
              >
                {createProfile.isPending ? 'Creando perfil...' : 'Empezar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
