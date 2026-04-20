export default function TaskDetailLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8"
        style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="h-5 w-16 rounded-lg bg-muted animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-xl bg-muted animate-pulse" />
          <div className="h-8 w-20 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-1.5 w-6 h-6 rounded-full border-2 flex-shrink-0 bg-muted animate-pulse"
              style={{ borderColor: 'var(--border)' }}
            />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-3/4 rounded-lg bg-muted animate-pulse" />
              <div className="h-8 w-1/2 rounded-lg bg-muted/60 animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-32 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-muted/60 animate-pulse" />
        </div>
        <div className="h-4 w-24 rounded bg-muted/50 animate-pulse" />
      </div>
    </div>
  )
}
