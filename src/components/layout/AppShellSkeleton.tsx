import { TaskFeedSkeleton } from '@/components/tasks/TaskFeedSkeleton'

interface Props {
  showTaskSkeleton?: boolean
}

export function AppShellSkeleton({ showTaskSkeleton = true }: Props) {
  return (
    <>
      {/* Sidebar placeholder (desktop only) */}
      <div
        className="hidden lg:flex flex-col w-72 flex-shrink-0 h-screen sticky top-0"
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        <div className="px-5 pt-6 pb-4">
          <div className="h-5 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="px-3 pb-4">
          <div className="h-9 rounded-xl bg-muted animate-pulse" />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar placeholder (desktop only) */}
        <div
          className="hidden lg:flex items-center justify-between px-8 py-4 sticky top-0"
          style={{ borderBottom: '1px solid var(--border)', minHeight: '65px' }}
        >
          <div className="space-y-1.5">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
            <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
            <div className="w-28 h-9 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>

        <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-28 lg:pb-10">
          {/* Mobile header placeholder */}
          <div className="lg:hidden flex items-center justify-between mb-10">
            <div className="h-8 w-36 rounded-xl bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>

          {showTaskSkeleton && (
            <div className="min-h-[560px]">
              <TaskFeedSkeleton />
            </div>
          )}
        </main>
      </div>

      {/* BottomNav placeholder (mobile only) — fixed height prevents CLS */}
      <div
        className="fixed bottom-0 left-0 right-0 h-16 lg:hidden"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      />
    </>
  )
}
