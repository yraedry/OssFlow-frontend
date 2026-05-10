import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Camera, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile, useCreateProfile, useUpdateProfile } from '../hooks'
import { useFederations, useUpdateProfileFederations } from '@/features/identity/federation/hooks'
import { getAvatarFromStorage, saveAvatarToStorage, removeAvatarFromStorage, resizeImageToBase64 } from '@/shared/hooks/useAvatar'
import { Spinner } from '@/shared/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { updateProfileSchema, type UpdateProfileForm } from '../schemas'
import type { FederationAssignment } from '@/features/identity/federation/types'
import { useRef } from 'react'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }

const BELTS = [
  { value: 'WHITE',  label: 'Blanco',  color: '#d1d5db' },
  { value: 'BLUE',   label: 'Azul',    color: '#3b82f6' },
  { value: 'PURPLE', label: 'Morado',  color: '#9333ea' },
  { value: 'BROWN',  label: 'Marrón',  color: '#92400e' },
  { value: 'BLACK',  label: 'Negro',   color: '#111827' },
]

const MODALITIES = [
  { value: 'GI',   label: 'Gi (con kimono)' },
  { value: 'NOGI', label: 'No-Gi (sin kimono)' },
  { value: 'BOTH', label: 'Gi + No-Gi (ambas)' },
]

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5" style={MONO}>
      {children}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
      />
      {error && <p className="text-[10px] text-destructive mt-1" style={MONO}>{error}</p>}
    </div>
  )
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

  const [selectedFederations, setSelectedFederations] = useState<FederationAssignment[]>([])
  const [federationsInitialized, setFederationsInitialized] = useState(false)
  const [fedSaved, setFedSaved] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile?.federations?.length && !federationsInitialized) {
      setSelectedFederations(profile.federations.map(f => ({ federationId: f.federationId, isPrimary: f.isPrimary })))
      setFederationsInitialized(true)
    }
  }, [profile, federationsInitialized])

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? '',
      currentBelt: profile?.currentBelt ?? '',
      preferredModality: profile?.preferredModality ?? '',
      academy: profile?.academy ?? '',
    },
  })

  const watchedBelt = watch('currentBelt')
  const beltDef = BELTS.find(b => b.value === watchedBelt?.toUpperCase())

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
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveAvatar() {
    removeAvatarFromStorage()
    setAvatar(null)
    window.dispatchEvent(new Event('ossflow_avatar_changed'))
  }

  function onSubmit(data: UpdateProfileForm) {
    const payload = {
      displayName: data.displayName,
      currentBelt: data.currentBelt,
      preferredModality: data.preferredModality,
      academy: data.academy || undefined,
    }
    if (profile) {
      updateProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
    } else {
      createProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
    }
  }

  function handleSaveFederations() {
    updateFederations.mutate(selectedFederations, {
      onSuccess: () => {
        setFedSaved(true)
        setTimeout(() => setFedSaved(false), 2000)
      },
    })
  }

  function handleFedCheck(id: number, checked: boolean) {
    if (checked) {
      const noneSelected = selectedFederations.length === 0
      setSelectedFederations([...selectedFederations, { federationId: id, isPrimary: noneSelected }])
    } else {
      const next = selectedFederations.filter(s => s.federationId !== id)
      const hadPrimary = selectedFederations.find(s => s.federationId === id)?.isPrimary
      if (hadPrimary && next.length > 0) {
        setSelectedFederations([{ ...next[0], isPrimary: true }, ...next.slice(1)])
      } else {
        setSelectedFederations(next)
      }
    }
  }

  function handleSetPrimary(id: number) {
    setSelectedFederations(selectedFederations.map(s => ({ ...s, isPrimary: s.federationId === id })))
  }

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  const initials = getInitials(profile?.displayName)

  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-4 border border-border bg-card px-5 py-4">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          style={MONO}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Volver al perfil
        </button>
        <div className="h-4 w-px bg-border" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Perfil</div>
          <h1 className="text-xl font-black leading-none" style={SERIF}>Editar perfil</h1>
        </div>
      </div>

      {/* ── LAYOUT DOS COLUMNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ── COLUMNA IZQUIERDA: Avatar + vista previa ── */}
        <div className="space-y-3">

          {/* Avatar */}
          <div className="bg-card border border-border p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Foto de perfil</p>

            {/* Avatar grande cuadrado con overlay */}
            <div className="relative mx-auto" style={{ width: 120, height: 120 }}>
              <div
                className="w-full h-full overflow-hidden flex items-center justify-center text-2xl font-black"
                style={{
                  backgroundColor: beltDef?.color ?? '#6b7280',
                  color: ['WHITE'].includes(watchedBelt?.toUpperCase()) ? '#111827' : '#fff',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {avatar
                  ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Cambiar foto"
              >
                <Camera className="h-6 w-6 text-white" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-2 border border-border text-[10px] font-bold uppercase tracking-wide hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                style={MONO}
              >
                {uploading ? 'Procesando...' : avatar ? 'Cambiar foto' : 'Subir foto'}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="w-full py-2 border border-destructive/40 text-[10px] font-bold uppercase tracking-wide text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  style={MONO}
                >
                  <X className="h-3 w-3 inline mr-1" strokeWidth={2} />
                  Eliminar foto
                </button>
              )}
              <p className="text-[9px] text-muted-foreground text-center" style={MONO}>
                Max 200×200 · JPEG / PNG / WebP
              </p>
            </div>
          </div>

          {/* Vista previa cinturón */}
          {beltDef && (
            <div className="bg-card border border-border p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Vista previa</p>
              <div className="flex items-center gap-3 py-2">
                <div
                  className="h-3 flex-1"
                  style={{ backgroundColor: beltDef.color }}
                />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ ...MONO, color: beltDef.color }}>
                  {beltDef.label}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ── COLUMNA DERECHA: Formulario ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Información básica */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border p-6 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Información</p>

            {/* Nombre */}
            <div>
              <FieldLabel required>Nombre visible</FieldLabel>
              <TextInput
                {...register('displayName')}
                placeholder="Tu nombre en la comunidad"
                error={errors.displayName?.message}
              />
            </div>

            {/* Cinturón + Modalidad en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Cinturón</FieldLabel>
                <Controller
                  control={control}
                  name="currentBelt"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-border bg-background h-10 text-sm focus:ring-0 focus:border-foreground transition-colors" style={{ borderRadius: 0 }}>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent style={{ borderRadius: 0 }}>
                        {BELTS.map(b => (
                          <SelectItem key={b.value} value={b.value}>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-4 shrink-0" style={{ backgroundColor: b.color }} />
                              {b.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currentBelt && <p className="text-[10px] text-destructive mt-1" style={MONO}>{errors.currentBelt.message}</p>}
              </div>

              <div>
                <FieldLabel required>Modalidad</FieldLabel>
                <Controller
                  control={control}
                  name="preferredModality"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-border bg-background h-10 text-sm focus:ring-0 focus:border-foreground transition-colors" style={{ borderRadius: 0 }}>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent style={{ borderRadius: 0 }}>
                        {MODALITIES.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.preferredModality && <p className="text-[10px] text-destructive mt-1" style={MONO}>{errors.preferredModality.message}</p>}
              </div>
            </div>

            {/* Academia */}
            <div>
              <FieldLabel>Academia</FieldLabel>
              <TextInput
                {...register('academy')}
                placeholder="Nombre de tu academia (opcional)"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button
                type="submit"
                disabled={createProfile.isPending || updateProfile.isPending}
                className="px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
                style={MONO}
              >
                {createProfile.isPending || updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-5 py-2.5 border border-border text-xs font-bold uppercase tracking-wide hover:bg-muted transition-colors cursor-pointer"
                style={MONO}
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Federaciones */}
          <div className="bg-card border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Federaciones</p>
              <p className="text-[9px] text-muted-foreground" style={MONO}>{selectedFederations.length} seleccionadas</p>
            </div>

            {allFederations.length === 0 ? (
              <p className="text-xs text-muted-foreground" style={MONO}>No hay federaciones disponibles.</p>
            ) : (
              <div className="space-y-1">
                {allFederations.map(fed => {
                  const checked = selectedFederations.some(s => s.federationId === fed.id)
                  const primary = selectedFederations.some(s => s.federationId === fed.id && s.isPrimary)
                  return (
                    <div
                      key={fed.id}
                      className={`flex items-center gap-3 px-3 py-2.5 border transition-colors cursor-pointer ${
                        checked ? 'border-foreground/40 bg-foreground/[0.03]' : 'border-border hover:border-border/80'
                      }`}
                      onClick={() => handleFedCheck(fed.id, !checked)}
                    >
                      <div
                        className="h-4 w-4 border flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          borderColor: checked ? 'var(--color-foreground)' : 'var(--color-border)',
                          backgroundColor: checked ? 'var(--color-foreground)' : 'transparent',
                        }}
                      >
                        {checked && <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{fed.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2" style={MONO}>{fed.code}</span>
                      </div>
                      {checked && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleSetPrimary(fed.id) }}
                          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 border transition-colors cursor-pointer shrink-0 ${
                            primary
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border text-muted-foreground hover:border-foreground/40'
                          }`}
                          style={MONO}
                        >
                          {primary ? '★ Principal' : 'Principal'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <button
                type="button"
                onClick={handleSaveFederations}
                disabled={updateFederations.isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
                style={MONO}
              >
                {updateFederations.isPending ? <Spinner className="h-3 w-3" /> : fedSaved ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                {updateFederations.isPending ? 'Guardando...' : fedSaved ? 'Guardado' : 'Guardar federaciones'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
