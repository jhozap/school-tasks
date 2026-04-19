'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Refreshes the current route on window focus and every 60 seconds.
// With Suspense boundaries, only the TaskFeed re-streams — shell stays painted.
export function AutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => router.refresh()
    window.addEventListener('focus', refresh)
    const interval = setInterval(refresh, 60_000)
    return () => {
      window.removeEventListener('focus', refresh)
      clearInterval(interval)
    }
  }, [router])

  return null
}
