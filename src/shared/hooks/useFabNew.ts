import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export function dispatchFabNew() {
  window.dispatchEvent(new CustomEvent('fab:new'))
}

export function useFabNew(openFn: () => void) {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new')) {
      openFn()
      setSearchParams({}, { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.addEventListener('fab:new', openFn)
    return () => window.removeEventListener('fab:new', openFn)
  }, [openFn])
}
