'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const THRESHOLD = 70
const RESISTANCE = 0.45

export function usePullToRefresh(onRefresh: () => void) {
  const startYRef = useRef(0)
  const activeRef = useRef(false)
  const distRef = useRef(0)

  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const stableRefresh = useCallback(onRefresh, [onRefresh])

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return
      startYRef.current = e.touches[0].clientY
      activeRef.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!activeRef.current) return
      if (window.scrollY > 0) {
        activeRef.current = false
        distRef.current = 0
        setPullDistance(0)
        setIsPulling(false)
        return
      }
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0) {
        distRef.current = 0
        setPullDistance(0)
        setIsPulling(false)
        return
      }
      e.preventDefault()
      const clamped = Math.min(delta * RESISTANCE, THRESHOLD * 1.3)
      distRef.current = clamped
      setPullDistance(clamped)
      setIsPulling(true)
    }

    function onTouchEnd() {
      if (!activeRef.current) return
      const dist = distRef.current
      activeRef.current = false
      distRef.current = 0
      setPullDistance(0)
      setIsPulling(false)
      if (dist >= THRESHOLD * RESISTANCE) {
        if (navigator.onLine) {
          stableRefresh()
        }
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [stableRefresh])

  return { pullDistance, isPulling, threshold: THRESHOLD * RESISTANCE }
}
