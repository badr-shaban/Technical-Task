import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
