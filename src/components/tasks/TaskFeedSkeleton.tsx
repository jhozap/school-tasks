function CardSkeleton() {
  return (
    <div
      className="bg-card rounded-2xl flex overflow-hidden"
      style={{ boxShadow: '0 2px 16px oklch(0.05 0 0 / 8%)', border: '1px solid var(--border)' }}
    >
      {/* Accent bar */}
      <div className="w-1 flex-shrink-0 rounded-l-2xl animate-pulse" style={{ background: 'var(--muted)' }} />

      <div className="flex-1 px-4 pt-2.5 pb-3.5 space-y-2.5">
        {/* Badge row */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
        </div>
        {/* Title row */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded animate-pulse" style={{ background: 'var(--muted)', width: '65%' }} />
            <div className="h-3 rounded animate-pulse" style={{ background: 'var(--muted)', width: '40%' }} />
          </div>
        </div>
        {/* Date row */}
        <div className="pl-8">
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
        </div>
      </div>
    </div>
  )
}

export function TaskFeedSkeleton() {
  return (
    <div className="space-y-10">
      {/* Section label */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
