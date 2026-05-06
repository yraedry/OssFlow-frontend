import { useState } from 'react'
import { useProfile, useCreateProfile, useUpdateProfile } from '../hooks'
import { useProfileFederations, useFederations, useUpdateProfileFederations } from '@/features/identity/federation/hooks'
import { ProfileForm } from '../components/ProfileForm'
import { FederationSelector } from '@/features/identity/federation/components/FederationSelector'
import type { UpdateProfileForm } from '../schemas'
import type { FederationAssignment } from '@/features/identity/federation/types'

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()

  const profileId = profile?.id ?? 0
  const { data: allFederations = [] } = useFederations()
  const { data: profileFederations = [] } = useProfileFederations(profileId)
  const updateFederations = useUpdateProfileFederations(profileId)

  const [selectedFederations, setSelectedFederations] = useState<FederationAssignment[]>([])
  const [federationsInitialized, setFederationsInitialized] = useState(false)

  // Initialize selected federations from profile data once loaded
  if (profileFederations.length > 0 && !federationsInitialized) {
    setSelectedFederations(
      profileFederations.map((pf) => ({
        federationId: pf.federationId,
        isPrimary: pf.isPrimary,
      })),
    )
    setFederationsInitialized(true)
  }

  function handleProfileSubmit(data: UpdateProfileForm) {
    const payload = {
      displayName: data.displayName,
      avatarUrl: data.avatarUrl || undefined,
      bio: data.bio || undefined,
    }
    if (profile) {
      updateProfile.mutate(payload)
    } else {
      createProfile.mutate(payload)
    }
  }

  function handleFederationsSubmit() {
    updateFederations.mutate(selectedFederations)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando perfil...</div>
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">
          {profile ? 'Mi Perfil' : 'Configura tu perfil'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profile
            ? 'Actualiza tu información de perfil'
            : 'Completa tu perfil para empezar a usar OssFlow'}
        </p>
      </div>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Información personal</h2>
        <ProfileForm
          profile={profile}
          onSubmit={handleProfileSubmit}
          isPending={createProfile.isPending || updateProfile.isPending}
        />
      </section>

      {profile && (
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Federaciones</h2>
          <p className="text-sm text-muted-foreground">
            Selecciona las federaciones a las que perteneces. Marca una como principal.
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
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {updateFederations.isPending ? 'Guardando...' : 'Guardar Federaciones'}
          </button>
        </section>
      )}
    </div>
  )
}
