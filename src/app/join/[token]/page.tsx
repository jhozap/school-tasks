import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { acceptInvitation } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: Promise<{ token: string }>
}

export default async function JoinPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inv } = await supabase
    .from('workspace_invitations')
    .select('id, workspace_id, expires_at, used_at, workspaces(name)')
    .eq('token', token)
    .single()

  const isValid = inv && !inv.used_at && new Date(inv.expires_at) >= new Date()

  if (!isValid) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl mx-auto">
            🔒
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              Invitación inválida
            </h1>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
              Este enlace expiró o ya fue usado.
            </p>
          </div>
          <a href="/login" className="text-sm text-primary font-medium hover:underline" style={{ fontFamily: 'var(--font-inter)' }}>
            Ir al inicio de sesión
          </a>
        </div>
      </main>
    )
  }

  if (!user) {
    redirect(`/register?next=/join/${token}`)
  }

  const workspaceName = (inv.workspaces as unknown as { name: string } | null)?.name ?? 'Workspace compartido'

  async function handleAccept() {
    'use server'
    await acceptInvitation(token)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
            School Tasks
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Te han invitado a un workspace
          </p>
        </div>

        <Card className="border-0 shadow-none bg-card rounded-2xl p-2">
          <CardContent className="px-6 py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mx-auto">
                📚
              </div>
              <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
                {workspaceName}
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Hola {user.email} — únete a este workspace para ver y gestionar sus tareas.
              </p>
            </div>

            <form action={handleAccept}>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, oklch(0.38 0.18 25) 100%)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Unirme al workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
