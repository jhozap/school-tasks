'use client'

import { useRef, useState } from 'react'
import type { ExtractedFields } from '@/app/api/ai/analyze/schema'

interface Props {
  onExtracted: (fields: ExtractedFields) => void
  onError: (msg: string) => void
  analyzing: boolean
  setAnalyzing: (v: boolean) => void
}

export function AIImageCapture({ onExtracted, onError, analyzing, setAnalyzing }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      onError('Imagen demasiado grande. Máximo 5MB.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleAnalyze() {
    if (!file) return
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('mode', 'image')
      formData.append('file', file)
      const res = await fetch('/api/ai/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        onError(data.error ?? 'Error al analizar la imagen')
        return
      }
      onExtracted(data)
    } catch {
      onError('Error de red. Intenta de nuevo.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ maxHeight: 220 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa" className="w-full object-cover" style={{ maxHeight: 220 }} />
          <button
            onClick={() => { setPreview(null); setFile(null) }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--card)', color: 'var(--foreground)' }}
            aria-label="Quitar imagen"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
            Seleccionar imagen
          </span>
          <span className="text-xs" style={{ fontFamily: 'var(--font-inter)' }}>
            JPEG, PNG, GIF o WebP · máx 5MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-3 rounded-2xl text-sm font-semibold disabled:opacity-60 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {analyzing ? 'Analizando...' : 'Analizar imagen'}
        </button>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
        ⚠️ HEIC/HEIF no soportado. Convierte a JPEG o PNG antes de subir.
      </p>
    </div>
  )
}
