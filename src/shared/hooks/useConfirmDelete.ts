import { useState } from 'react'

export function useConfirmDelete() {
  const [pending, setPending] = useState<number | null>(null)
  const request = (id: number) => setPending(id)
  const confirm = () => pending
  const cancel = () => setPending(null)
  return { pending, request, confirm, cancel }
}
