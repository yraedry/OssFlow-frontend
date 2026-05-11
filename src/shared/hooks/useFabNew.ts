import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

// Abre el diálogo de "nuevo" si:
//   - se navega con ?new=1 en la URL (desde el FAB de otra sección)
//   - se dispara el evento fab:new (FAB desde la misma sección)
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
