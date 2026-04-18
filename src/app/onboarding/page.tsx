'use client'

import { useState } from 'react'
import { createFirstWorkspace } from './actions'

function WorkspaceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

export default function OnboardingPage() {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.set('name', name)
    const result = await createFirstWorkspace(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    let token = inviteUrl.trim()
    // Extract token from full URL if pasted
    const match = token.match(/\/join\/([a-f0-9-]{36})/)
    if (match) token = match[1]
    if (!token) { setError('URL de invitación inválida'); return }
    window.location.href = `/join/${token}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)' }}
          >
            <WorkspaceIcon />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
            Configura tu espacio
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Para comenzar necesitas un workspace. Crea uno nuevo o únete a uno existente.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-2xl p-1"
          style={{ background: 'var(--muted)' }}
        >
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-inter)',
                background: tab === t ? 'var(--card)' : 'transparent',
                color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: tab === t ? '0 1px 4px oklch(0.05 0 0 / 10%)' : 'none',
              }}
            >
              {t === 'create' ? 'Crear workspace' : 'Tengo invitación'}
            </button>
          ))}
        </div>

        {/* Create form */}
        {tab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Nombre del workspace
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Tareas de grado 11"
                required
                className="w-full h-12 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
              />
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Puedes invitar a tus compañeros después
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full h-12 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {loading ? 'Creando...' : 'Crear y entrar'}
            </button>
          </form>
        )}

        {/* Join form */}
        {tab === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Link de invitación
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LinkIcon />
                </div>
                <input
                  value={inviteUrl}
                  onChange={e => setInviteUrl(e.target.value)}
                  placeholder="https://…/join/xxxxxxxx-xxxx-…"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
                />
              </div>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Pega el link completo que te compartió tu compañero
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={!inviteUrl.trim()}
              className="w-full h-12 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Ir a la invitación
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
          ¿Equivocaste de cuenta?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Cerrar sesión
          </a>
        </p>
      </div>
    </div>
  )
}
