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

// ─── Configuración visual de cinturones ───────────────────────────────────────

const BELT: Record<string, { label: string; bg: string; text: string; stripe: string }> = {
  WHITE:  { label: 'Blanco',  bg: '#e5e7eb', text: '#111827', stripe: '#d1d5db' },
  BLUE:   { label: 'Azul',    bg: '#3b82f6', text: '#ffffff', stripe: '#1d4ed8' },
  PURPLE: { label: 'Morado',  bg: '#9333ea', text: '#ffffff', stripe: '#6b21a8' },
  BROWN:  { label: 'Marrón',  bg: '#92400e', text: '#ffffff', stripe: '#78350f' },
  BLACK:  { label: 'Negro',   bg: '#111827', text: '#ffffff', stripe: '#374151' },
}

const MODALITY: Record<string, string> = {
  GI:   'Gi',
  NOGI: 'No-Gi',
  BOTH: 'Gi + No-Gi',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 border border-border rounded-lg bg-background">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-xl font-bold tabular-nums leading-none">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ─── Belt strip visual ────────────────────────────────────────────────────────

function BeltStrip({ belt }: { belt: typeof BELT[string] }) {
  return (
    <div className="flex h-3 rounded-sm overflow-hidden w-full max-w-[120px]">
      <div className="flex-1" style={{ backgroundColor: belt.bg }} />
      <div className="w-4" style={{ backgroundColor: belt.stripe }} />
      <div className="w-4" style={{ backgroundColor: belt.bg }} />
      <div className="w-4 bg-black" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // ── Sin perfil ──
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

  const belt = BELT[profile.currentBelt] ?? { label: profile.currentBelt, bg: '#6b7280', text: '#fff', stripe: '#4b5563' }
  const initials = getInitials(profile.displayName)
  const beltTime = timeAtBelt(profile.beltSince)
  const primaryFed = profile.federations?.find(f => f.isPrimary)
  const primaryFedName = primaryFed ? allFederations.find(f => f.id === primaryFed.federationId)?.code : null

  return (
    <div className="max-w-lg space-y-4">

      {/* ── Hero ── */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">

        {/* Banda de cinturón */}
        <div className="h-16 relative flex items-end px-5 pb-0" style={{ backgroundColor: belt.bg }}>
          {/* Franja negra del cinturón */}
          <div className="absolute right-0 top-0 bottom-0 w-12" style={{ backgroundColor: belt.stripe, opacity: 0.6 }} />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-black opacity-70" />
        </div>

        <div className="px-5 pb-5">
          {/* Avatar flotando sobre la banda */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div
              className="rounded-full border-4 border-card flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0"
              style={{
                width: 72, height: 72,
                backgroundColor: belt.bg,
                color: belt.text,
                fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)',
              }}
            >
              {avatar
                ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                : initials}
            </div>

            {/* Edit */}
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

          {/* Nombre + cinturón */}
          <div className="space-y-1.5 mb-5">
            <h1 className="text-2xl font-black leading-tight">{profile.displayName}</h1>
            <div className="flex items-center gap-3">
              <BeltStrip belt={belt} />
              <span className="text-sm font-semibold" style={{ color: belt.bg === '#e5e7eb' ? '#374151' : belt.bg }}>
                {belt.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono mt-1">
              {profile.academy && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" strokeWidth={1.5} />
                  {profile.academy}
                </span>
              )}
              {profile.beltSince && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" strokeWidth={1.5} />
                  Cinturón desde {formatDate(profile.beltSince)}
                </span>
              )}
              {primaryFedName && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" strokeWidth={1.5} />
                  {primaryFedName}
                </span>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox
              label="Modalidad"
              value={MODALITY[profile.preferredModality] ?? profile.preferredModality}
            />
            <StatBox
              label="En cinturón"
              value={beltTime ?? '—'}
              sub={profile.beltSince ? formatDate(profile.beltSince) : undefined}
            />
            <StatBox
              label="Federaciones"
              value={profile.federations?.length ?? 0}
            />
          </div>
        </div>
      </div>

      {/* ── Stats de entrenamiento ── */}
      {stats && (
        <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Esta semana</p>
          <div className="grid grid-cols-3 gap-2">
            <StatBox
              label="Racha"
              value={stats.streakDays}
              sub="días"
            />
            <StatBox
              label="BJJ"
              value={`${stats.bjjSessions}/${stats.bjjGoal}`}
              sub="sesiones"
            />
            <StatBox
              label="Físico"
              value={`${stats.physicalSessions}/${stats.physicalGoal}`}
              sub="sesiones"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 flex items-center gap-2 p-3 border border-border rounded-lg bg-background">
              <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Técnicas este mes</p>
                <p className="text-xl font-bold tabular-nums">{stats.techniquesThisMonth}</p>
              </div>
              <Flame className="h-4 w-4 flex-shrink-0" style={{ color: stats.streakDays > 0 ? '#f97316' : '#475569' }} strokeWidth={1.5} />
              <Activity className="h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      )}

      {/* ── Lesiones ── */}
      <InjurySection />
    </div>
  )
}
