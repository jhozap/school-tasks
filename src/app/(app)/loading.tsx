import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'

export default function AppLoading() {
  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      <AppShellSkeleton />
    </div>
  )
}
