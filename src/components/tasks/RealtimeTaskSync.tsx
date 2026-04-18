'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  workspaceId: string
}

export function RealtimeTaskSync({ workspaceId }: Props) {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router

  useEffect(() => {
    if (!workspaceId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`workspace:${workspaceId}`)
      .on('broadcast', { event: 'task-change' }, () => {
        routerRef.current.refresh()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [workspaceId])

  return null
}
