import { useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

interface ConfirmOptions {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: (value: boolean) => void
}

let _openConfirm: ((opts: ConfirmOptions) => Promise<boolean>) | null = null

export function useConfirm() {
  return useCallback((opts: ConfirmOptions) => {
    if (!_openConfirm) return Promise.resolve(false)
    return _openConfirm(opts)
  }, [])
}

export function ConfirmDialogProvider() {
  const [state, setState] = useState<ConfirmState | null>(null)
  const resolveRef = useRef<((v: boolean) => void) | null>(null)

  _openConfirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({ ...opts, open: true, resolve })
    })
  }, [])

  const handleAnswer = (answer: boolean) => {
    setState(null)
    resolveRef.current?.(answer)
    resolveRef.current = null
  }

  if (!state) return null

  return (
    <Dialog open={state.open} onOpenChange={(o) => { if (!o) handleAnswer(false) }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{state.title ?? 'Confirmar acción'}</DialogTitle>
          <DialogDescription>{state.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleAnswer(false)}>
            {state.cancelLabel ?? 'Cancelar'}
          </Button>
          <Button
            variant={state.variant ?? 'destructive'}
            onClick={() => handleAnswer(true)}
          >
            {state.confirmLabel ?? 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
