'use client'

import { useState } from 'react'
import { login } from './actions'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
        style={{ background: 'linear-gradient(145deg, var(--primary) 0%, var(--cta-gradient-end) 100%)' }}
      >
        <div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-12"
            style={{ background: 'oklch(from var(--primary-foreground) l c h / 0.2)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            School Tasks
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'oklch(from white l c h / 0.8)', fontFamily: 'var(--font-inter)' }}>
            Organiza tus tareas escolares, comparte workspaces con compañeros y nunca pierdas una entrega.
          </p>
        </div>

        <div className="space-y-3">
          {['Urgentes hoy', 'Próximas esta semana', 'Completadas este mes'].map((label, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'oklch(from white l c h / 0.12)' }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: i === 0 ? '#ff6b67' : i === 1 ? '#eac32b' : '#78dc77' }}
              />
              <span className="text-sm text-white" style={{ fontFamily: 'var(--font-inter)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              Inicia sesión para continuar
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
              style={{ fontFamily: 'var(--font-inter)', borderColor: 'var(--border)', background: 'var(--card)' }}
            >
              <GoogleIcon />
              {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>o con correo</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
                  Correo
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-inter)',
                    border: 'none',
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
                  Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-inter)',
                    border: 'none',
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
