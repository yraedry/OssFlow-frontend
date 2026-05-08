import { useContext } from 'react'
import { ConfirmContext } from '@/shared/context/confirm-context'

export function useConfirm() {
  return useContext(ConfirmContext)
}
