'use client'

import { useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => router.refresh())
  }

  const { pullDistance, isPulling, threshold } = usePullToRefresh(handleRefresh)

  // Disable browser native pull-to-refresh so our custom one takes over
  useEffect(() => {
    const prev = document.body.style.overscrollBehaviorY
    document.body.style.overscrollBehaviorY = 'none'
    return () => { document.body.style.overscrollBehaviorY = prev }
  }, [])

  const isRefreshing = isPending
  const showIndicator = isPulling || isRefreshing
  const progress = Math.min(pullDistance / threshold, 1)
  const indicatorSize = isRefreshing ? threshold : pullDistance

  return (
    <>
      {/* Pull indicator — slides in from top as user drags */}
      <div
        aria-hidden
        style={{
          overflow: 'hidden',
          height: indicatorSize,
          transition: isPulling ? 'none' : 'height 0.2s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showIndicator && (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: '2.5px solid var(--primary)',
              borderTopColor: 'transparent',
              opacity: isRefreshing ? 1 : progress,
              transform: isRefreshing ? undefined : `scale(${0.5 + progress * 0.5})`,
              animation: isRefreshing ? 'spin 0.7s linear infinite' : undefined,
            }}
          />
        )}
      </div>

      {children}
    </>
  )
}
