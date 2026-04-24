'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AIImageCapture } from './AIImageCapture'
import { AIAudioCapture } from './AIAudioCapture'
import type { ExtractedFields } from '@/app/api/ai/analyze/schema'

const ANALYZING_MESSAGES = ['Analizando contenido...', 'Extrayendo información...', 'Casi listo...']

interface Props {
  onExtracted: (fields: ExtractedFields) => void
  onClose: () => void
}

export function AICreateModal({ onExtracted, onClose }: Props) {
  const [tab, setTab] = useState<'image' | 'audio'>('image')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!analyzing) return
    const id = setInterval(() => setMsgIdx(i => (i + 1) % ANALYZING_MESSAGES.length), 2000)
    return () => clearInterval(id)
  }, [analyzing])

  function handleExtracted(fields: ExtractedFields) {
    onClose()
    onExtracted(fields)
  }

  function handleError(msg: string) {
    setError(msg)
    setAnalyzing(false)
  }

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" style={{ backdropFilter: 'blur(8px)' }} />
      <div
        className="relative w-full sm:max-w-md bg-card sm:rounded-3xl rounded-t-3xl p-6 shadow-xl"
        style={{ boxShadow: '0 24px 64px oklch(0.05 0 0 / 32%)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
            Crear con IA
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex rounded-xl overflow-hidden mb-5" style={{ background: 'var(--muted)' }}>
          {(['image', 'audio'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className="flex-1 py-2 text-sm font-semibold transition-all rounded-xl"
              style={{
                fontFamily: 'var(--font-inter)',
                background: tab === t ? 'var(--card)' : 'transparent',
                color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: tab === t ? '0 1px 4px oklch(0 0 0 / 8%)' : 'none',
              }}
            >
              {t === 'image' ? 'Imagen' : 'Audio'}
            </button>
          ))}
        </div>

        {analyzing ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div
              className="w-8 h-8 rounded-full border-2"
              style={{
                borderColor: 'var(--primary)',
                borderTopColor: 'transparent',
                animation: 'spin 0.7s linear infinite',
              }}
            />
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              {ANALYZING_MESSAGES[msgIdx]}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-sm text-destructive mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                {error}
              </p>
            )}
            {tab === 'image' ? (
              <AIImageCapture
                onExtracted={handleExtracted}
                onError={handleError}
                analyzing={analyzing}
                setAnalyzing={setAnalyzing}
              />
            ) : (
              <AIAudioCapture
                onExtracted={handleExtracted}
                onError={handleError}
                analyzing={analyzing}
                setAnalyzing={setAnalyzing}
              />
            )}
          </>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
