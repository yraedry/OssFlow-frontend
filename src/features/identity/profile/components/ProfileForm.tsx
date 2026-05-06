import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, type UpdateProfileForm } from '../schemas'
import type { UserProfile } from '../types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

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

type Props = {
  profile?: UserProfile | null
  onSubmit: (data: UpdateProfileForm) => void
  isPending: boolean
}

export function ProfileForm({ profile, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? '',
      currentBelt: profile?.currentBelt ?? '',
      preferredModality: profile?.preferredModality ?? '',
      academy: profile?.academy ?? '',
    },
  })

  const beltValue = watch('currentBelt')
  const modalityValue = watch('preferredModality')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium">
          Nombre visible
        </label>
        <input
          id="displayName"
          {...register('displayName')}
          placeholder="Tu nombre visible"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Cinturón actual</label>
        <Select
          value={beltValue}
          onValueChange={(v) => setValue('currentBelt', v, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu cinturón" />
          </SelectTrigger>
          <SelectContent>
            {BELTS.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.currentBelt && (
          <p className="text-xs text-destructive">{errors.currentBelt.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Modalidad preferida</label>
        <Select
          value={modalityValue}
          onValueChange={(v) => setValue('preferredModality', v, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Gi, No-Gi o ambas" />
          </SelectTrigger>
          <SelectContent>
            {MODALITIES.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.preferredModality && (
          <p className="text-xs text-destructive">{errors.preferredModality.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="academy" className="text-sm font-medium">
          Academia (opcional)
        </label>
        <input
          id="academy"
          {...register('academy')}
          placeholder="Nombre de tu academia"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar Perfil'}
      </button>
    </form>
  )
}
