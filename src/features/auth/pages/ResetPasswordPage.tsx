import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { useResetPassword } from '../hooks'
import { AuthLayout, AuthCard, AuthField, AuthLink } from '../components/AuthLayout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { MONO } from '@/shared/lib/typography'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPasswordMutation = useResetPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    resetPasswordMutation.mutate({ token, newPassword: data.newPassword })
  }

  if (!token) {
    return (
      <AuthLayout title="Enlace inválido">
        <AuthCard>
          <p className="text-sm text-muted-foreground text-center" style={MONO}>
            Este enlace de recuperación no es válido. Solicita uno nuevo.
          </p>
          <AuthLink to="/forgot-password">Solicitar nuevo enlace</AuthLink>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura">
      <AuthCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthField label="Nueva contraseña" error={errors.newPassword?.message}>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
              {...register('newPassword')}
            />
          </AuthField>
          <AuthField label="Confirmar contraseña" error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu nueva contraseña"
              {...register('confirmPassword')}
            />
          </AuthField>
          <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
