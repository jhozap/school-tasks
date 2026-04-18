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
      .channel(`tasks:workspace:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as { workspace_id?: string } | null
          if (!row || row.workspace_id === workspaceId) {
            routerRef.current.refresh()
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          // retry after brief delay
          setTimeout(() => supabase.removeChannel(channel), 2000)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [workspaceId])

  return null
}
