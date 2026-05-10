import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useProfile, useCreateProfile, useUpdateProfile } from '../hooks'
import { useFederations, useUpdateProfileFederations } from '@/features/identity/federation/hooks'
import { ProfileForm } from '../components/ProfileForm'
import { AvatarUpload } from '../components/AvatarUpload'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import { Spinner } from '@/shared/components/ui/spinner'
import type { UpdateProfileForm } from '../schemas'
import type { FederationAssignment } from '@/features/identity/federation/types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

function SectionHeader({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-border">
      <span className="text-3xl font-black text-muted-foreground/30 leading-none tabular-nums select-none" style={MONO}>
        {number}
      </span>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest" style={MONO}>{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
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

  useEffect(() => {
    if (profile?.federations?.length && !federationsInitialized) {
      setSelectedFederations(profile.federations.map(f => ({ federationId: f.federationId, isPrimary: f.isPrimary })))
      setFederationsInitialized(true)
    }
  }, [profile, federationsInitialized])

  function handleProfileSubmit(data: UpdateProfileForm) {
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

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner /></div>
  }

  return (
    <div className="space-y-0 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 border border-border bg-card px-5 py-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          style={MONO}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Volver
        </button>
        <div className="h-4 w-px bg-border" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Perfil</div>
          <h1 className="text-xl font-black leading-none" style={{ fontFamily: 'var(--font-serif)' }}>Editar perfil</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sección 1 — Foto */}
        <section className="border border-border bg-card p-6 space-y-5">
          <SectionHeader number="01" title="Foto de perfil" description="Sube una imagen que te represente" />
          <AvatarUpload displayName={profile?.displayName ?? null} />
        </section>

        {/* Sección 2 — Información básica */}
        <section className="border border-border bg-card p-6 space-y-5">
          <SectionHeader number="02" title="Información" description="Nombre, cinturón, modalidad y academia" />
          <ProfileForm
            profile={profile}
            onSubmit={handleProfileSubmit}
            isPending={createProfile.isPending || updateProfile.isPending}
          />
        </section>

        {/* Sección 3 — Federaciones */}
        <section className="border border-border bg-card p-6 space-y-5">
          <SectionHeader number="03" title="Federaciones" description="Las federaciones en las que compites o estás afiliado" />
          <FederationSelector
            federations={allFederations}
            selected={selectedFederations}
            onChange={setSelectedFederations}
          />
          <button
            type="button"
            onClick={handleSaveFederations}
            disabled={updateFederations.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
            style={MONO}
          >
            {updateFederations.isPending ? (
              <Spinner className="h-3 w-3" />
            ) : fedSaved ? (
              <Check className="h-3 w-3" strokeWidth={2.5} />
            ) : null}
            {updateFederations.isPending ? 'Guardando...' : fedSaved ? 'Guardado' : 'Guardar federaciones'}
          </button>
        </section>
      </div>
    </div>
  )
}
