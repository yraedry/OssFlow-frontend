import { useState, useEffect } from 'react'
import { Pencil, Building2, Calendar, Shield, Activity, Flame, BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useProfile, useCreateProfile, useUpdateProfile } from '../hooks'
import { useFederations, useUpdateProfileFederations } from '@/features/identity/federation/hooks'
import { ProfileForm } from '../components/ProfileForm'
import { AvatarUpload } from '../components/AvatarUpload'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import { InjurySection } from '@/features/identity/injury/InjurySection'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { getAvatarFromStorage } from '@/shared/hooks/useAvatar'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import type { WeeklyStats } from '@/shared/api/dashboard'
import type { UpdateProfileForm } from '../schemas'
import type { FederationAssignment } from '@/features/identity/federation/types'

const BELT: Record<string, { label: string; bg: string; bgDark: string; text: string; stripe: string }> = {
  WHITE:  { label: 'Blanco',  bg: '#e5e7eb', bgDark: '#9ca3af', text: '#111827', stripe: '#d1d5db' },
  BLUE:   { label: 'Azul',    bg: '#3b82f6', bgDark: '#1d4ed8', text: '#ffffff', stripe: '#1d4ed8' },
  PURPLE: { label: 'Morado',  bg: '#9333ea', bgDark: '#6b21a8', text: '#ffffff', stripe: '#6b21a8' },
  BROWN:  { label: 'Marrón',  bg: '#92400e', bgDark: '#451a03', text: '#ffffff', stripe: '#78350f' },
  BLACK:  { label: 'Negro',   bg: '#111827', bgDark: '#030712', text: '#ffffff', stripe: '#374151' },
}

const MODALITY: Record<string, string> = {
  GI:   'Gi',
  NOGI: 'No-Gi',
  BOTH: 'Gi + No-Gi',
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso?: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
}

function timeAtBelt(iso?: string | null) {
  if (!iso) return null
  const months = (new Date().getFullYear() - new Date(iso).getFullYear()) * 12
    + (new Date().getMonth() - new Date(iso).getMonth())
  if (months < 1) return 'Reciente'
  if (months < 12) return `${months}m`
  const y = Math.floor(months / 12), m = months % 12
  return m === 0 ? `${y}a` : `${y}a ${m}m`
}

function ColorStatBox({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 bg-background rounded-sm" style={{ borderLeft: `3px solid ${color}` }}>
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-xl font-bold tabular-nums leading-none">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  )
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const { data: allFederations = [] } = useFederations()
  const updateFederations = useUpdateProfileFederations()
  const { data: stats } = useQuery<WeeklyStats>({ queryKey: ['weekly-stats'], queryFn: fetchWeeklyStats })

  const [selectedFederations, setSelectedFederations] = useState<FederationAssignment[]>([])
  const [federationsInitialized, setFederationsInitialized] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())

  useEffect(() => {
    const handler = () => setAvatar(getAvatarFromStorage())
    window.addEventListener('ossflow_avatar_changed', handler)
    return () => window.removeEventListener('ossflow_avatar_changed', handler)
  }, [])

  if (profile?.federations?.length && !federationsInitialized) {
    setSelectedFederations(profile.federations.map(f => ({ federationId: f.federationId, isPrimary: f.isPrimary })))
    setFederationsInitialized(true)
  }

  function handleProfileSubmit(data: UpdateProfileForm) {
    const payload = { displayName: data.displayName, currentBelt: data.currentBelt, preferredModality: data.preferredModality, academy: data.academy || undefined }
    if (profile) {
      updateProfile.mutate(payload, { onSuccess: () => setEditOpen(false) })
    } else {
      createProfile.mutate(payload, { onSuccess: () => setEditOpen(false) })
    }
  }

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Cargando...</div>

  if (!profile) {
    return (
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configura tu perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">Completa tu perfil para empezar a usar OssFlow</p>
        </div>
        <section className="rounded-lg border p-5 space-y-4">
          <h2 className="text-sm font-semibold font-mono uppercase tracking-wider">Foto</h2>
          <AvatarUpload displayName={null} />
        </section>
        <section className="rounded-lg border p-5 space-y-4">
          <h2 className="text-sm font-semibold font-mono uppercase tracking-wider">Información</h2>
          <ProfileForm profile={null} onSubmit={handleProfileSubmit} isPending={createProfile.isPending} />
        </section>
      </div>
    )
  }

  const belt = BELT[profile.currentBelt] ?? { label: profile.currentBelt, bg: '#6b7280', bgDark: '#374151', text: '#fff', stripe: '#4b5563' }
  const initials = getInitials(profile.displayName)
  const beltTime = timeAtBelt(profile.beltSince)
  const primaryFed = profile.federations?.find(f => f.isPrimary)
  const primaryFedName = primaryFed ? allFederations.find(f => f.id === primaryFed.federationId)?.code : null

  return (
    <div className="max-w-lg space-y-4">

      <div className="rounded-xl border border-border overflow-hidden bg-card">

        {/* Banda gradiente con nombre encima */}
        <div
          className="h-[120px] relative"
          style={{ background: `linear-gradient(135deg, ${belt.bgDark}, ${belt.bg})` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-black opacity-60" />
          <div className="absolute bottom-3 left-5 right-14">
            <p className="text-white font-black text-xl leading-tight drop-shadow-sm">{profile.displayName}</p>
            <p className="text-white/80 text-xs font-mono mt-0.5">
              Cinturón {belt.label} · {MODALITY[profile.preferredModality] ?? profile.preferredModality}
            </p>
          </div>
        </div>

        <div className="px-5 pb-5">

          {/* Avatar flotando + botón editar */}
          <div className="flex items-center justify-between -mt-9 mb-4">
            <div
              className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                width: 72,
                height: 72,
                backgroundColor: belt.bg,
                color: belt.text,
                fontSize: 22,
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                border: '3px solid #111',
                boxShadow: `0 0 0 3px ${belt.bg}, 0 0 0 6px #111`,
              }}
            >
              {avatar
                ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                : initials}
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-mono uppercase tracking-wide hover:bg-muted transition-colors rounded-md">
                  <Pencil className="h-3 w-3" strokeWidth={1.5} />
                  Editar
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Editar perfil</DialogTitle></DialogHeader>
                <div className="space-y-6 pt-2">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Foto</h3>
                    <AvatarUpload displayName={profile.displayName} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Información</h3>
                    <ProfileForm profile={profile} onSubmit={handleProfileSubmit} isPending={createProfile.isPending || updateProfile.isPending} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Federaciones</h3>
                    <FederationSelector federations={allFederations} selected={selectedFederations} onChange={setSelectedFederations} />
                    <button
                      type="button"
                      onClick={() => updateFederations.mutate(selectedFederations)}
                      disabled={updateFederations.isPending}
                      className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {updateFederations.isPending ? 'Guardando...' : 'Guardar federaciones'}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info compacta: academia, fecha cinturón, federación */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono mb-5">
            {profile.academy && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" strokeWidth={1.5} />
                {profile.academy}
              </span>
            )}
            {profile.beltSince && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                {beltTime ? `${beltTime} en cinturón` : formatDate(profile.beltSince)}
              </span>
            )}
            {primaryFedName && (
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" strokeWidth={1.5} />
                {primaryFedName}
              </span>
            )}
          </div>

          {/* Stats 2×2 con barra de color lateral */}
          <div className="grid grid-cols-2 gap-2">
            <ColorStatBox
              label="Racha"
              value={stats?.streakDays ?? '—'}
              sub="días"
              color="#f97316"
            />
            <ColorStatBox
              label="BJJ semana"
              value={stats ? `${stats.bjjSessions}/${stats.bjjGoal}` : '—'}
              sub="sesiones"
              color="#3b82f6"
            />
            <ColorStatBox
              label="Físico semana"
              value={stats ? `${stats.physicalSessions}/${stats.physicalGoal}` : '—'}
              sub="sesiones"
              color="#10b981"
            />
            <ColorStatBox
              label="Técnicas mes"
              value={stats?.techniquesThisMonth ?? '—'}
              sub="este mes"
              color="#a855f7"
            />
          </div>

          {/* Iconos decorativos de actividad */}
          {stats && (
            <div className="flex items-center gap-2 mt-3 px-1">
              <Flame className="h-3.5 w-3.5" style={{ color: stats.streakDays > 0 ? '#f97316' : '#475569' }} strokeWidth={1.5} />
              <Activity className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>

      <InjurySection />
    </div>
  )
}
