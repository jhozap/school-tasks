'use client'

import { createPortal } from 'react-dom'

interface Props {
  onClose: () => void
}

export function AIUpgradeBanner({ onClose }: Props) {
  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(8px)' }} />
      <div
        className="relative w-full rounded-t-3xl p-6 space-y-4"
        style={{ background: 'var(--card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-muted mx-auto" />

        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
              Función premium
            </p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              Crea tareas desde fotos y notas de voz usando inteligencia artificial.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-colors"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
