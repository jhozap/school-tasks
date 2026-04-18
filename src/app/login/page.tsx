'use client'

import { useState } from 'react'
import { login } from './actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
            School Tasks
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Inicia sesión para ver las tareas
          </p>
        </div>

        <Card className="border-0 shadow-none bg-card rounded-2xl p-2">
          <CardHeader className="pb-4 pt-6 px-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)' }}>
              Acceso
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
                  Correo
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-11"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
                  Contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-11"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-primary font-medium hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  )
}
