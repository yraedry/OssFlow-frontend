import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Spinner } from '@/shared/components/ui/spinner'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import { useFederations } from '@/features/identity/federation/hooks'
import { useCreateProfile } from '@/features/identity/profile/hooks'
import type { FederationAssignment } from '@/features/identity/federation/types'

const step1Schema = z.object({
  displayName: z.string().min(1, 'El nombre es requerido').max(100),
  bio: z.string().max(500).optional(),
})

type Step1Form = z.infer<typeof step1Schema>

type OnboardingData = {
  displayName: string
  bio?: string
  federations: FederationAssignment[]
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    bio: undefined,
    federations: [],
  })

  const { data: federations, isLoading: loadingFeds } = useFederations()
  const createProfile = useCreateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { displayName: data.displayName, bio: data.bio },
  })

  const handleStep1 = (formData: Step1Form) => {
    setData((prev) => ({ ...prev, ...formData }))
    setStep(2)
  }

  const handleStep2 = () => {
    setStep(3)
  }

  const handleFinish = async () => {
    await createProfile.mutateAsync({ displayName: data.displayName, bio: data.bio })
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
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Cuéntanos un poco sobre ti y tu práctica de BJJ..."
                rows={3}
              />
              {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
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
              <Button className="flex-1" onClick={handleStep2}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h2 className="font-semibold">Resumen</h2>
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{data.displayName}</p>
              </div>
              {data.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-sm">{data.bio}</p>
                </div>
              )}
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
