'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AIImageCapture } from './AIImageCapture'
import { AIAudioCapture } from './AIAudioCapture'
import type { ExtractedFields } from '@/app/api/ai/analyze/schema'

const DAILY_LIMIT = 10
const ANALYZING_MESSAGES = ['Analizando contenido...', 'Extrayendo información...', 'Casi listo...']

interface Usage { image_count: number; audio_count: number }

interface Props {
  onExtracted: (fields: ExtractedFields) => void
  onClose: () => void
}

export function AICreateModal({ onExtracted, onClose }: Props) {
  const [tab, setTab] = useState<'image' | 'audio'>('image')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msgIdx, setMsgIdx] = useState(0)
  const [usage, setUsage] = useState<Usage | null>(null)

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

  useEffect(() => {
    fetch('/api/ai/usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
  }, [])

  function refreshUsage() {
    fetch('/api/ai/usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
  }

  function handleExtracted(fields: ExtractedFields) {
    onClose()
    onExtracted(fields)
  }

  function handleError(msg: string) {
    setError(msg)
    setAnalyzing(false)
    refreshUsage()
  }

  const remaining = usage
    ? { image: Math.max(0, DAILY_LIMIT - usage.image_count), audio: Math.max(0, DAILY_LIMIT - usage.audio_count) }
    : null

  const exhausted = remaining ? remaining[tab] === 0 : false

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
        <div className="flex rounded-xl overflow-hidden mb-3" style={{ background: 'var(--muted)' }}>
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

        {/* Daily usage counters */}
        {remaining && (
          <div className="flex items-center justify-center gap-3 mb-4">
            {(['image', 'audio'] as const).map(t => {
              const count = remaining[t]
              const isEmpty = count === 0
              return (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    background: isEmpty ? 'oklch(0.96 0.01 25)' : 'var(--muted)',
                    color: isEmpty ? 'var(--destructive)' : 'var(--muted-foreground)',
                  }}
                >
                  {t === 'image' ? 'Imágenes' : 'Audios'}: {count}/{DAILY_LIMIT}
                </span>
              )
            })}
          </div>
        )}

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
        ) : exhausted ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-2xl">⏳</span>
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-inter)' }}>
              Límite diario alcanzado
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
              Usaste los {DAILY_LIMIT} análisis de {tab === 'image' ? 'imágenes' : 'audios'} de hoy.
              <br />Vuelve mañana o cambia al otro modo.
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