import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Camera, X, Eye, EyeOff, Star } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useProfile, useCreateProfile, useUpdateProfile } from '../hooks'

import { useFederations, useUpdateProfileFederations } from '@/features/identity/federation/hooks'
import { getAvatarFromStorage, saveAvatarToStorage, removeAvatarFromStorage, resizeImageToBase64 } from '@/shared/hooks/useAvatar'
import { Spinner } from '@/shared/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { updateProfileSchema, type UpdateProfileForm } from '../schemas'
import { MONO, SERIF } from '@/shared/lib/typography'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { FederationAssignment } from '@/features/identity/federation/types'

const BELTS = [
  { value: 'WHITE',  label: 'Blanco',  color: '#d1d5db', text: '#111827' },
  { value: 'BLUE',   label: 'Azul',    color: '#3b82f6', text: '#ffffff' },
  { value: 'PURPLE', label: 'Morado',  color: '#9333ea', text: '#ffffff' },
  { value: 'BROWN',  label: 'Marrón',  color: '#92400e', text: '#ffffff' },
  { value: 'BLACK',  label: 'Negro',   color: '#111827', text: '#ffffff' },
]
const BELT_ORDER = ['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'] as const

const MODALITIES = [
  { value: 'GI',   label: 'Gi (con kimono)' },
  { value: 'NOGI', label: 'No-Gi (sin kimono)' },
  { value: 'BOTH', label: 'Gi + No-Gi (ambas)' },
]

const AGE_CATEGORIES = [
  { value: 'ADULT',    label: 'Adulto' },
  { value: 'JUVENILE', label: 'Juvenil' },
  { value: 'MASTER_1', label: 'Master 1' },
  { value: 'MASTER_2', label: 'Master 2' },
  { value: 'MASTER_3', label: 'Master 3' },
  { value: 'MASTER_4', label: 'Master 4' },
]

const STRIPES_OPTIONS = [0, 1, 2, 3, 4] as const

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerido'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})
type ChangePasswordForm = z.infer<typeof changePasswordSchema>

type Tab = 'cuenta' | 'bjj' | 'federaciones'

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5" style={MONO}>
      {children}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

function Input({ error, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; hint?: string }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full border bg-input px-3 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 disabled:opacity-40 disabled:cursor-not-allowed ${
          error ? 'border-destructive' : 'border-border focus:border-foreground'
        } ${props.className ?? ''}`}
      />
      {hint && <p className="text-[9px] text-muted-foreground mt-1" style={MONO}>{hint}</p>}
      {error && <p className="text-[9px] text-destructive mt-1" style={MONO}>{error}</p>}
    </div>
  )
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border">
      <div className="px-6 py-3 border-b border-border">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function BtnRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">{children}</div>
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function ProfileEditPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useProfile()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const { data: allFederations = [] } = useFederations()
  const updateFederations = useUpdateProfileFederations()

  const [activeTab, setActiveTab] = useState<Tab>('cuenta')
  const [selectedFeds, setSelectedFeds] = useState<FederationAssignment[]>([])
  const [fedsInitialized, setFedsInitialized] = useState(false)
  const [fedSaved, setFedSaved] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())
  const [uploading, setUploading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile?.federations?.length && !fedsInitialized) {
      setSelectedFeds(profile.federations.map(f => ({ federationId: f.federationId, isPrimary: f.isPrimary })))
      setFedsInitialized(true)
    }
  }, [profile, fedsInitialized])

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      currentBelt: '',
      preferredModality: '',
      academy: '',
      beltSince: '',
      ageCategory: null,
      stripes: null,
      weight: null,
    },
  })

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, setError: setPwdError, reset: resetPwd } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const { data: accountData } = useQuery({
    queryKey: ['account-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ''}` },
      })
      if (!res.ok) return null
      return res.json() as Promise<{ id: number; email: string; provider: string }>
    },
  })

  // Rellenar el formulario cuando el perfil cargue desde la API
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        displayName: profile.alias ?? profile.displayName ?? '',
        currentBelt: profile.currentBelt ?? '',
        preferredModality: profile.preferredModality ?? '',
        academy: profile.academy ?? '',
        beltSince: profile.beltSince ?? '',
        ageCategory: profile.ageCategory ?? null,
        stripes: profile.stripes ?? null,
        weight: profile.weight ?? null,
      })
    }
  }, [profile, reset])

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedBelt = watch('currentBelt')
  const beltDef = BELTS.find(b => b.value === watchedBelt?.toUpperCase())
  const beltIdx = BELT_ORDER.indexOf(watchedBelt?.toUpperCase() as typeof BELT_ORDER[number])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImageToBase64(file, 200)
      saveAvatarToStorage(dataUrl)
      setAvatar(dataUrl)
      window.dispatchEvent(new Event('ossflow_avatar_changed'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleRemoveAvatar() {
    removeAvatarFromStorage()
    setAvatar(null)
    window.dispatchEvent(new Event('ossflow_avatar_changed'))
  }

  function onSubmitBjj(data: UpdateProfileForm) {
    const payload = {
      displayName: data.displayName,
      currentBelt: data.currentBelt,
      preferredModality: data.preferredModality,
      academy: data.academy || undefined,
      beltSince: data.beltSince || undefined,
      ageCategory: data.ageCategory || null,
      stripes: data.stripes ?? null,
      weight: data.weight ?? null,
    }
    if (profile) {
      updateProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
    } else {
      createProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
    }
  }

  function onSubmitAccount(data: UpdateProfileForm) {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
    const payload = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      alias: data.displayName || undefined,
      displayName: fullName || profile?.displayName || data.displayName,
      currentBelt: profile?.currentBelt ?? 'WHITE',
      preferredModality: profile?.preferredModality ?? 'GI',
      academy: profile?.academy || undefined,
      beltSince: profile?.beltSince || undefined,
    }
    if (profile) {
      updateProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
    } else {
      createProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
    }
  }

  async function onSubmitPassword(data: ChangePasswordForm) {
    try {
      await apiClient.post('auth/change-password', { json: data })
      resetPwd()
      toast.success('Contraseña actualizada')
    } catch {
      setPwdError('currentPassword', { message: 'Contraseña actual incorrecta' })
    }
  }

  function handleFedCheck(id: number, checked: boolean) {
    if (checked) {
      const noneSelected = selectedFeds.length === 0
      setSelectedFeds([...selectedFeds, { federationId: id, isPrimary: noneSelected }])
    } else {
      const next = selectedFeds.filter(s => s.federationId !== id)
      const hadPrimary = selectedFeds.find(s => s.federationId === id)?.isPrimary
      if (hadPrimary && next.length > 0) {
        setSelectedFeds([{ ...next[0], isPrimary: true }, ...next.slice(1)])
      } else {
        setSelectedFeds(next)
      }
    }
  }

  function handleSetPrimary(id: number) {
    setSelectedFeds(selectedFeds.map(s => ({ ...s, isPrimary: s.federationId === id })))
  }

  function handleSaveFeds() {
    updateFederations.mutate(selectedFeds, {
      onSuccess: () => { setFedSaved(true); setTimeout(() => setFedSaved(false), 2500) },
    })
  }

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  const TABS: { id: Tab; label: string }[] = [
    { id: 'cuenta',       label: 'Cuenta' },
    { id: 'bjj',          label: 'Perfil BJJ' },
    { id: 'federaciones', label: 'Federaciones' },
  ]

  return (
    <div className="space-y-4">

      {/* PAGE HEADER */}
      <div className="flex items-center gap-4 border border-border bg-card px-5 py-4">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          style={MONO}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Volver al perfil
        </button>
        <div className="h-4 w-px bg-border" />
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Perfil</div>
          <h1 className="text-xl font-black leading-none" style={SERIF}>Editar perfil</h1>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-border">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === t.id
                ? 'text-foreground border-foreground'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
            style={MONO}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: CUENTA ── */}
      {activeTab === 'cuenta' && (
        <div className="space-y-4">

          <CardSection title="Foto y datos personales">
            {/* Avatar */}
            <div className="flex items-start gap-5 mb-6">
              <div className="relative flex-shrink-0 cursor-pointer" style={{ width: 96, height: 96 }}
                onClick={() => fileRef.current?.click()}>
                <div
                  className="w-full h-full overflow-hidden flex items-center justify-center text-2xl font-black"
                  style={{
                    backgroundColor: beltDef?.color ?? '#6b7280',
                    color: beltDef?.text ?? '#fff',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile?.displayName)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-1.5 border border-border text-[9px] font-bold uppercase tracking-wide hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                  style={MONO}
                >
                  {uploading ? 'Procesando...' : avatar ? 'Cambiar foto' : 'Subir foto'}
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1 px-4 py-1.5 border border-destructive/30 text-[9px] font-bold uppercase tracking-wide text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
                    style={MONO}
                  >
                    <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                    Eliminar foto
                  </button>
                )}
                <p className="text-[9px] text-muted-foreground" style={MONO}>Max 200×200 · JPEG / PNG / WebP</p>
              </div>
            </div>

            {/* Nombre + apellidos */}
            <form onSubmit={handleSubmit(onSubmitAccount)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input {...register('firstName')} placeholder="Tu nombre" error={errors.firstName?.message} />
                </div>
                <div>
                  <Label>Apellidos</Label>
                  <Input {...register('lastName')} placeholder="Tus apellidos" error={errors.lastName?.message} />
                </div>
              </div>
              <div>
                <Label required>Alias</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground select-none" style={MONO}>@</span>
                  <Input
                    {...register('displayName')}
                    className="pl-7"
                    placeholder="tu_alias"
                    error={errors.displayName?.message}
                    hint="Visible para otros usuarios en la comunidad"
                  />
                </div>
              </div>
              <BtnRow>
                <button type="submit" disabled={createProfile.isPending || updateProfile.isPending}
                  className="px-5 py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer" style={MONO}>
                  {createProfile.isPending || updateProfile.isPending ? 'Guardando...' : 'Guardar datos'}
                </button>
                <button type="button" onClick={() => navigate('/profile')}
                  className="px-5 py-2.5 border border-border text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer" style={MONO}>
                  Cancelar
                </button>
              </BtnRow>
            </form>
          </CardSection>

          <CardSection title="Credenciales de acceso">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  disabled
                  value={accountData?.email ?? ''}
                  placeholder="email@ejemplo.com"
                  readOnly
                />
                {accountData?.provider && accountData.provider !== 'LOCAL' && (
                  <p className="text-[9px] text-muted-foreground mt-1" style={MONO}>
                    Cuenta vinculada con {accountData.provider.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
            {(!accountData?.provider || accountData.provider === 'LOCAL') && (
              <form onSubmit={handlePwd(onSubmitPassword)} className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-3 border-b border-border" style={MONO}>Cambiar contraseña</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Contraseña actual</Label>
                    <div className="relative">
                      <Input
                        {...regPwd('currentPassword')}
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={pwdErrors.currentPassword?.message}
                      />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPass ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Nueva contraseña</Label>
                    <Input
                      {...regPwd('newPassword')}
                      type="password"
                      placeholder="••••••••"
                      error={pwdErrors.newPassword?.message}
                    />
                  </div>
                </div>
                <BtnRow>
                  <button type="submit"
                    className="px-5 py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer" style={MONO}>
                    Cambiar contraseña
                  </button>
                </BtnRow>
              </form>
            )}
          </CardSection>

        </div>
      )}

      {/* ── TAB: PERFIL BJJ ── */}
      {activeTab === 'bjj' && (
        <form onSubmit={handleSubmit(onSubmitBjj)} className="space-y-4">
          <CardSection title="Datos de entrenamiento y competición">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <Label required>Cinturón actual</Label>
                <Controller control={control} name="currentBelt" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-border bg-input h-10 text-sm focus:ring-0 focus:border-foreground" style={{ borderRadius: 0 }}>
                      <SelectValue placeholder="Selecciona tu cinturón" />
                    </SelectTrigger>
                    <SelectContent style={{ borderRadius: 0 }}>
                      {BELTS.map(b => (
                        <SelectItem key={b.value} value={b.value}>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-5 shrink-0" style={{ backgroundColor: b.color }} />
                            {b.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.currentBelt && <p className="text-[9px] text-destructive mt-1" style={MONO}>{errors.currentBelt.message}</p>}
              </div>
              <div>
                <Label>Desde (opcional)</Label>
                <Controller control={control} name="beltSince" render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} placeholder="Fecha del cinturón" />
                )} />
                <p className="text-[9px] text-muted-foreground mt-1" style={MONO}>Fecha en la que recibiste este cinturón</p>
              </div>
            </div>

            {/* Belt progression visual */}
            {beltDef && (
              <div className="mb-5">
                <div className="flex gap-1">
                  {BELT_ORDER.map((b, i) => {
                    const isActive = i === beltIdx
                    const isPast = i < beltIdx
                    return (
                      <div key={b} className="flex-1 space-y-1">
                        <div className="h-2" style={{
                          backgroundColor: isActive || isPast ? BELTS[i].color : 'transparent',
                          border: isActive || isPast ? 'none' : '1px dashed var(--color-border)',
                          opacity: isPast ? 0.45 : 1,
                        }} />
                        <p className="text-[8px] text-center truncate" style={{
                          ...MONO,
                          color: isActive ? BELTS[i].color : 'var(--color-muted-foreground)',
                          fontWeight: isActive ? 700 : 400,
                        }}>
                          {BELTS[i].label}{isActive ? ' ●' : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Modalidad preferida</Label>
                <Controller control={control} name="preferredModality" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-border bg-input h-10 text-sm focus:ring-0 focus:border-foreground" style={{ borderRadius: 0 }}>
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent style={{ borderRadius: 0 }}>
                      {MODALITIES.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.preferredModality && <p className="text-[9px] text-destructive mt-1" style={MONO}>{errors.preferredModality.message}</p>}
              </div>
              <div>
                <Label>Academia (opcional)</Label>
                <Input {...register('academy')} placeholder="Nombre de tu academia" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Grados (stripes)</Label>
                <Controller
                  name="stripes"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {STRIPES_OPTIONS.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => field.onChange(field.value === n ? null : n)}
                          className={`w-12 h-10 border text-xs font-mono font-bold transition-colors flex flex-col items-center justify-center gap-1 ${
                            field.value === n
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border text-muted-foreground hover:border-foreground/50'
                          }`}
                        >
                          <span>{n}</span>
                          <span className="flex gap-[2px]">
                            {[0, 1, 2, 3].map(i => (
                              <span
                                key={i}
                                className="w-1 h-[6px] rounded-[1px]"
                                style={{
                                  background: i < n
                                    ? (field.value === n ? 'rgba(255,255,255,0.9)' : 'var(--foreground)')
                                    : 'var(--border)',
                                }}
                              />
                            ))}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
              <div>
                <Label>Categoría de edad</Label>
                <Controller
                  name="ageCategory"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
                      <SelectTrigger className="border-border bg-input h-10 text-sm focus:ring-0 focus:border-foreground" style={{ borderRadius: 0 }}>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent style={{ borderRadius: 0 }}>
                        <SelectItem value="none">Sin especificar</SelectItem>
                        {AGE_CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Peso (opcional)</Label>
                <div className="flex">
                  <Input
                    type="number"
                    min={30}
                    max={180}
                    step={0.5}
                    placeholder="ej. 76"
                    className="flex-1"
                    {...register('weight', { valueAsNumber: true })}
                  />
                  <span className="px-3 flex items-center border border-l-0 border-border text-xs text-muted-foreground bg-muted font-mono">
                    kg
                  </span>
                </div>
              </div>
            </div>

            <BtnRow>
              <button type="submit" disabled={createProfile.isPending || updateProfile.isPending}
                className="px-5 py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer" style={MONO}>
                {createProfile.isPending || updateProfile.isPending ? 'Guardando...' : 'Guardar perfil BJJ'}
              </button>
              <button type="button" onClick={() => navigate('/profile')}
                className="px-5 py-2.5 border border-border text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer" style={MONO}>
                Cancelar
              </button>
            </BtnRow>
          </CardSection>
        </form>
      )}

      {/* ── TAB: FEDERACIONES ── */}
      {activeTab === 'federaciones' && (
        <CardSection title={`Federaciones de competición — ${selectedFeds.length} seleccionada${selectedFeds.length !== 1 ? 's' : ''}`}>
          <p className="text-xs text-muted-foreground mb-4">
            Selecciona las federaciones en las que compites o estás afiliado. Marca una como principal.
          </p>

          {allFederations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center" style={MONO}>No hay federaciones disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {allFederations.map(fed => {
                const checked = selectedFeds.some(s => s.federationId === fed.id)
                const primary = selectedFeds.some(s => s.federationId === fed.id && s.isPrimary)
                return (
                  <div
                    key={fed.id}
                    onClick={() => handleFedCheck(fed.id, !checked)}
                    className={`flex flex-col gap-2 px-3 py-3 border transition-colors cursor-pointer ${
                      checked ? 'border-foreground/35 bg-foreground/[0.03]' : 'border-border hover:border-foreground/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Checkbox cuadrado */}
                      <div className="h-4 w-4 border flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          borderColor: checked ? 'var(--color-foreground)' : 'var(--color-border)',
                          backgroundColor: checked ? 'var(--color-foreground)' : 'transparent',
                        }}>
                        {checked && <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug truncate">{fed.name}</p>
                        <p className="text-[9px] text-muted-foreground" style={MONO}>{fed.code}</p>
                      </div>
                    </div>

                    {checked && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleSetPrimary(fed.id) }}
                        className={`flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2.5 py-1.5 border transition-colors cursor-pointer w-full ${
                          primary
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        }`}
                        style={MONO}
                      >
                        <Star className="h-2.5 w-2.5" strokeWidth={primary ? 3 : 1.5} />
                        {primary ? 'Principal ✓' : 'Marcar como principal'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <BtnRow>
            <button type="button" onClick={handleSaveFeds} disabled={updateFederations.isPending}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer" style={MONO}>
              {updateFederations.isPending ? <Spinner className="h-3 w-3" /> : fedSaved ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
              {updateFederations.isPending ? 'Guardando...' : fedSaved ? 'Guardado' : 'Guardar federaciones'}
            </button>
          </BtnRow>
        </CardSection>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

    </div>
  )
}
