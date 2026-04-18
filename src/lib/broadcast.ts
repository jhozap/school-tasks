export async function broadcastTaskChange(workspaceId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !workspaceId) return

  await fetch(`${url}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      messages: [{
        topic: `workspace:${workspaceId}`,
        event: 'task-change',
        payload: {},
      }],
    }),
  }).catch(() => {})
}
