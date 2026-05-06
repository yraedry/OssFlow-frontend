import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, type UpdateProfileForm } from '../schemas'
import type { UserProfile } from '../types'

type Props = {
  profile?: UserProfile | null
  onSubmit: (data: UpdateProfileForm) => void
  isPending: boolean
}

export function ProfileForm({ profile, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? '',
      avatarUrl: profile?.avatarUrl ?? '',
      bio: profile?.bio ?? '',
    },
  })

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
        <label htmlFor="avatarUrl" className="text-sm font-medium">
          URL de avatar
        </label>
        <input
          id="avatarUrl"
          {...register('avatarUrl')}
          placeholder="https://example.com/avatar.png"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.avatarUrl && (
          <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="bio" className="text-sm font-medium">
          Biografía
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          rows={3}
          placeholder="Cuéntanos algo sobre ti..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
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
