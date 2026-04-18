'use client'

import { Suspense, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { register } from './actions'
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

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('next', next)
    const result = await register(formData)
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
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar picker */}
      <div className="flex justify-center mb-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-opacity group-hover:opacity-80"
            style={{
              background: avatarPreview
                ? 'transparent'
                : 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <div
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--background)',
              color: 'var(--muted-foreground)',
            }}
          >
            <CameraIcon />
          </div>
        </button>
        <input
          ref={fileRef}
          name="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground -mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
        Foto de perfil (opcional)
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
          Nombre completo
        </label>
        <input
          name="full_name"
          type="text"
          required
          placeholder="Ana García"
          className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
        />
      </div>

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
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
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
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
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
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
        style={{ fontFamily: 'var(--font-inter)', borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <GoogleIcon />
        {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
      </button>
    </form>
  )
}

export default function RegisterPage() {
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
            Empieza gratis
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'oklch(from white l c h / 0.8)', fontFamily: 'var(--font-inter)' }}>
            Crea tu cuenta en segundos. Invita a compañeros a tu workspace y gestionen las tareas juntos.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '🗂️', text: 'Workspaces compartidos' },
            { icon: '🔔', text: 'Alertas de urgentes' },
            { icon: '📎', text: 'Adjunta archivos a cada tarea' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-white" style={{ fontFamily: 'var(--font-inter)', color: 'oklch(from white l c h / 0.9)' }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              Crea tu cuenta
            </h2>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              Tu workspace se crea automáticamente
            </p>
          </div>

          <Suspense fallback={<div className="h-96" />}>
            <RegisterForm />
          </Suspense>

          <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
