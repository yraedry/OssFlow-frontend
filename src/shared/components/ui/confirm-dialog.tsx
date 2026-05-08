import { useCallback, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { ConfirmContext, type ConfirmFn, type ConfirmOptions } from '@/shared/context/confirm-context'

interface ConfirmState extends ConfirmOptions {
  open: boolean
}

export function ConfirmDialogProvider({ children }: { children?: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)
  const resolveRef = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({ ...opts, open: true })
    })
  }, [])

  const handleAnswer = (answer: boolean) => {
    setState(null)
    resolveRef.current?.(answer)
    resolveRef.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
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
      )}
    </ConfirmContext.Provider>
  )
}
