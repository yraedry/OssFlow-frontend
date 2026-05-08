import { useRef, useState, useEffect } from 'react'
import { getAvatarFromStorage, saveAvatarToStorage, removeAvatarFromStorage, resizeImageToBase64 } from '@/shared/hooks/useAvatar'

type Props = {
  displayName?: string | null
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

export function AvatarUpload({ displayName }: Props) {
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const handler = () => setAvatar(getAvatarFromStorage())
    window.addEventListener('ossflow_avatar_changed', handler)
    return () => window.removeEventListener('ossflow_avatar_changed', handler)
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImageToBase64(file, 200)
      saveAvatarToStorage(dataUrl)
      setAvatar(dataUrl)
    } catch {
      // silently ignore resize errors
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    removeAvatarFromStorage()
    setAvatar(null)
  }

  return (
    <div className="flex items-center gap-6">
      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative shrink-0 rounded-full overflow-hidden border-2 border-border hover:border-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        style={{ width: 80, height: 80 }}
        aria-label="Subir foto de perfil"
        disabled={uploading}
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground" style={{ ...MONO, fontSize: '22px', fontWeight: 700 }}>
            {getInitials(displayName)}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-full">
          <span style={{ ...LABEL, color: 'white', fontSize: '8px' }}>{uploading ? '...' : 'Cambiar'}</span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 border border-border text-sm hover:bg-accent transition-colors disabled:opacity-50"
          style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {uploading ? 'Procesando...' : avatar ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {avatar && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 border border-border text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
            style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Eliminar foto
          </button>
        )}
        <span style={{ ...LABEL, color: 'var(--color-muted-foreground)', fontSize: '8px' }}>
          Max 200×200 — JPEG/PNG/WebP
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
