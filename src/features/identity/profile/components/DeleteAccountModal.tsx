import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteAccount, useExportBackup } from '../hooks'
import { useAuthStore } from '@/features/auth/store/authStore'
import { MONO } from '@/shared/lib/typography'

type Props = {
  open: boolean
  onClose: () => void
}

function ModalInner({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const deleteAccount = useDeleteAccount()
  const exportBackup = useExportBackup()
  const [step, setStep] = useState<'confirm' | 'deleting'>('confirm')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleteAccount.isPending) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, deleteAccount.isPending])

  async function handleExport() {
    await exportBackup.mutateAsync()
  }

  async function handleDelete() {
    setStep('deleting')
    await deleteAccount.mutateAsync()
    useAuthStore.getState().clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => { if (e.target === overlayRef.current && !deleteAccount.isPending) onClose() }}
    >
      <div className="w-full max-w-sm mx-4 bg-background border border-border" style={MONO}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-[9px] font-bold uppercase tracking-widest text-destructive" style={MONO}>
            Eliminar cuenta
          </span>
          {!deleteAccount.isPending && (
            <button type="button" onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-none cursor-pointer">
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {step === 'confirm' && (
            <>
              <p className="text-sm leading-relaxed">
                Esta acción es <strong>permanente e irreversible</strong>. Se borrarán tu perfil, sesiones, técnicas, plantillas y todos los datos asociados.
              </p>

              {/* Export section */}
              <div className="border border-border p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wide" style={MONO}>
                  ¿Quieres exportar tus datos antes?
                </p>
                <p className="text-xs text-muted-foreground">
                  Descarga un JSON con toda tu información para conservarla o importarla en el futuro.
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exportBackup.isPending}
                  className="w-full px-3 py-2 border border-border text-[10px] font-bold uppercase tracking-wide hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
                  style={MONO}
                >
                  {exportBackup.isPending ? 'Descargando…' : exportBackup.isSuccess ? '✓ Datos descargados' : 'Exportar mis datos (JSON)'}
                </button>
              </div>
            </>
          )}

          {step === 'deleting' && (
            <p className="text-sm text-muted-foreground py-2 text-center">
              Eliminando cuenta…
            </p>
          )}
        </div>

        {/* Footer */}
        {step === 'confirm' && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-border text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              style={MONO}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteAccount.isPending}
              className="flex-1 px-3 py-2 border border-destructive text-[10px] font-bold uppercase tracking-wide text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
              style={MONO}
            >
              Eliminar cuenta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DeleteAccountModal({ open, onClose }: Props) {
  if (!open) return null
  return <ModalInner key={String(open)} onClose={onClose} />
}
