import { useState } from 'react'
import { Building2, Calendar, Shield, Users, Pencil } from 'lucide-react'
import { useProfile, useCreateProfile, useUpdateProfile } from '../hooks'
import { useFederations, useUpdateProfileFederations } from '@/features/identity/federation/hooks'
import { ProfileForm } from '../components/ProfileForm'
import { AvatarUpload } from '../components/AvatarUpload'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import { InjurySection } from '@/features/identity/injury/InjurySection'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { getAvatarFromStorage } from '@/shared/hooks/useAvatar'
import type { UpdateProfileForm } from '../schemas'
import type { FederationAssignment } from '@/features/identity/federation/types'
import { useEffect } from 'react'

// ─── Belt config ──────────────────────────────────────────────────────────────

const BELT_CONFIG: Record<string, { label: string; className: string }> = {
  WHITE:  { label: 'Blanco',  className: 'bg-gray-100 text-gray-800 border border-gray-300' },
  BLUE:   { label: 'Azul',    className: 'bg-blue-500 text-white border-transparent' },
  PURPLE: { label: 'Morado',  className: 'bg-purple-600 text-white border-transparent' },
  BROWN:  { label: 'Marrón',  className: 'bg-amber-700 text-white border-transparent' },
  BLACK:  { label: 'Negro',   className: 'bg-gray-900 text-white border-transparent' },
}

const MODALITY_CONFIG: Record<string, { label: string }> = {
  GI:   { label: 'Gi' },
  NOGI: { label: 'No-Gi' },
  BOTH: { label: 'Gi + No-Gi' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
}

function timeAtBelt(isoSince?: string | null): string {
  if (!isoSince) return ''
  const since = new Date(isoSince)
  const now = new Date()
  const months =
    (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth())
  if (months < 1) return 'Reciente'
  if (months < 12) return `${months} mes${months > 1 ? 'es' : ''}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} año${years > 1 ? 's' : ''}`
  return `${years}a ${rem}m`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()

  const { data: allFederations = [] } = useFederations()
  const updateFederations = useUpdateProfileFederations()

  const [selectedFederations, setSelectedFederations] = useState<FederationAssignment[]>([])
  const [federationsInitialized, setFederationsInitialized] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())

  useEffect(() => {
    const handler = () => setAvatar(getAvatarFromStorage())
    window.addEventListener('ossflow_avatar_changed', handler)
    return () => window.removeEventListener('ossflow_avatar_changed', handler)
  }, [])

  if (profile?.federations && profile.federations.length > 0 && !federationsInitialized) {
    setSelectedFederations(
      profile.federations.map((pf) => ({
        federationId: pf.federationId,
        isPrimary: pf.isPrimary,
      })),
    )
    setFederationsInitialized(true)
  }

  function handleProfileSubmit(data: UpdateProfileForm) {
    const payload = {
      displayName: data.displayName,
      currentBelt: data.currentBelt,
      preferredModality: data.preferredModality,
      academy: data.academy || undefined,
    }
    if (profile) {
      updateProfile.mutate(payload, { onSuccess: () => setEditOpen(false) })
    } else {
      createProfile.mutate(payload, { onSuccess: () => setEditOpen(false) })
    }
  }

  function handleFederationsSubmit() {
    updateFederations.mutate(selectedFederations)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando perfil...</div>
  }

  // ── No profile yet ──
  if (!profile) {
    return (
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Configura tu perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completa tu perfil para empezar a usar OssFlow
          </p>
        </div>
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Foto de perfil</h2>
          <AvatarUpload displayName={null} />
        </section>
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Información personal</h2>
          <ProfileForm
            profile={null}
            onSubmit={handleProfileSubmit}
            isPending={createProfile.isPending}
          />
        </section>
      </div>
    )
  }

  // ── Profile card ──
  const belt = BELT_CONFIG[profile.currentBelt] ?? { label: profile.currentBelt, className: 'bg-muted text-muted-foreground border-border' }
  const modality = MODALITY_CONFIG[profile.preferredModality] ?? { label: profile.preferredModality }
  const initials = getInitials(profile.displayName)
  const beltTime = timeAtBelt(profile.beltSince)
  const enrolledCount = profile.federations?.length ?? 0

  // Determine avatar background color based on belt
  const avatarBg: Record<string, string> = {
    WHITE:  'bg-gray-100 text-gray-700',
    BLUE:   'bg-blue-500 text-white',
    PURPLE: 'bg-purple-600 text-white',
    BROWN:  'bg-amber-700 text-white',
    BLACK:  'bg-gray-900 text-white',
  }
  const avatarClass = avatarBg[profile.currentBelt] ?? 'bg-muted text-muted-foreground'

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Profile Hero Card ── */}
      <Card className="overflow-hidden">
        {/* Top color strip based on belt */}
        <div className={`h-2 w-full ${belt.className.split(' ').find(c => c.startsWith('bg-')) ?? 'bg-muted'}`} />

        <CardContent className="pt-6 pb-6 px-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div
              className={`shrink-0 rounded-full overflow-hidden border-4 border-background shadow-md flex items-center justify-center ${avatarClass}`}
              style={{ width: 80, height: 80, fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
            >
              {avatar
                ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                : initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1
                    className="text-2xl font-black leading-tight truncate"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {profile.displayName}
                  </h1>

                  {/* Belt badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest border mt-1 ${belt.className}`}
                  >
                    {belt.label}
                  </span>
                </div>

                {/* Edit button */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium hover:bg-accent transition-colors"
                      style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}
                    >
                      <Pencil className="h-3 w-3" strokeWidth={1.5} />
                      Editar
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-2">
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Foto de perfil</h3>
                        <AvatarUpload displayName={profile.displayName} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Información personal</h3>
                        <ProfileForm
                          profile={profile}
                          onSubmit={handleProfileSubmit}
                          isPending={createProfile.isPending || updateProfile.isPending}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Federaciones</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Selecciona las federaciones a las que perteneces.
                        </p>
                        <FederationSelector
                          federations={allFederations}
                          selected={selectedFederations}
                          onChange={setSelectedFederations}
                        />
                        <button
                          type="button"
                          onClick={handleFederationsSubmit}
                          disabled={updateFederations.isPending}
                          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {updateFederations.isPending ? 'Guardando...' : 'Guardar Federaciones'}
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                {profile.academy && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{profile.academy}</span>
                  </span>
                )}
                {profile.beltSince && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    Desde {formatDate(profile.beltSince)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {/* Modality */}
            <div className="border border-border p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                Modalidad
              </p>
              <p className="text-sm font-semibold">{modality.label}</p>
            </div>

            {/* Time at belt */}
            <div className="border border-border p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                En cinturón
              </p>
              <p className="text-sm font-semibold">{beltTime || '—'}</p>
            </div>

            {/* Federations */}
            <div className="border border-border p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                Federaciones
              </p>
              <p className="text-sm font-semibold">{enrolledCount}</p>
            </div>
          </div>

          {/* ── Federations list ── */}
          {profile.federations && profile.federations.length > 0 && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                Federaciones inscritas
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.federations.map((pf) => (
                  <div key={pf.federationId} className="flex items-center gap-1.5">
                    <Badge variant={pf.isPrimary ? 'default' : 'outline'} className="flex items-center gap-1">
                      {pf.isPrimary && <Shield className="h-2.5 w-2.5" strokeWidth={2} />}
                      Fed. #{pf.federationId}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Injuries ── */}
      <InjurySection />
    </div>
  )
}
