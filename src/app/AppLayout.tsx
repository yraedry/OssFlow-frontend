// src/app/AppLayout.tsx
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomTabBar } from '@/shared/components/layout/BottomTabBar'
import { TopNavBar } from '@/shared/components/layout/TopNavBar'
import { FabMenu } from '@/shared/components/ui/fab-menu'
import { CommandPalette } from '@/shared/components/CommandPalette'

export function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Desktop: top nav (visible en md+) */}
      <div className="hidden md:block">
        <TopNavBar onSearchOpen={() => setCmdOpen(true)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 min-h-dvh md:min-h-0">
        <Outlet />
      </main>

      {/* Mobile: bottom tab bar + FAB (ocultos en md+) */}
      <div className="md:hidden">
        <BottomTabBar />
        <FabMenu />
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}
