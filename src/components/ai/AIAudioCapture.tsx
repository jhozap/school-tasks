'use client'

import { useEffect, useRef, useState } from 'react'
import type { ExtractedFields } from '@/app/api/ai/analyze/schema'

type AnyWindow = Window & typeof globalThis & {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionEventLike = {
  resultIndex: number
  results: { isFinal: boolean; 0: { transcript: string } }[]
}

interface Props {
  onExtracted: (fields: ExtractedFields) => void
  onError: (msg: string) => void
  analyzing: boolean
  setAnalyzing: (v: boolean) => void
}

export function AIAudioCapture({ onExtracted, onError, analyzing, setAnalyzing }: Props) {
  const [supported, setSupported] = useState(true)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [seconds, setSeconds] = useState(0)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    const w = window as AnyWindow
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  function startRecording() {
    const w = window as AnyWindow
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = navigator.language || 'es-ES'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = true

    let finalTranscript = ''

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t + ' '
        else interim = t
      }
      setTranscript(finalTranscript + interim)
    }

    recognition.onerror = () => {
      stopRecording(finalTranscript)
    }

    recognition.onend = () => {
      if (recording) stopRecording(finalTranscript)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
    setTranscript('')
    setSeconds(0)
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  function stopRecording(finalText?: string) {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    const text = finalText ?? transcript
    if (text.trim() && Date.now() - startTimeRef.current >= 2000) {
      sendTranscript(text.trim())
    }
  }

  async function sendTranscript(text: string) {
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('mode', 'audio')
      formData.append('transcript', text)
      const res = await fetch('/api/ai/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        onError(data.error ?? 'Error al analizar el audio')
        return
      }
      onExtracted(data)
    } catch {
      onError('Error de red. Intenta de nuevo.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!supported) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)' }}>
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
          Tu navegador no soporta grabación de voz.
          <br />Usa la opción de imagen.
        </p>
      </div>
    )
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="space-y-4">
      {transcript && (
        <div
          className="rounded-2xl p-3 text-sm min-h-[72px] max-h-40 overflow-y-auto"
          style={{ background: 'var(--muted)', fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
        >
          {transcript}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {recording && (
          <span className="text-sm tabular-nums font-mono" style={{ color: 'var(--destructive)' }}>
            {fmt(seconds)}
          </span>
        )}

        <button
          onClick={() => recording ? stopRecording() : startRecording()}
          disabled={analyzing}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-md disabled:opacity-60 transition-all"
          style={{
            background: recording ? 'var(--destructive)' : 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            color: recording ? '#fff' : 'var(--primary-foreground)',
          }}
          aria-label={recording ? 'Detener grabación' : 'Iniciar grabación'}
        >
          {recording ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
          {analyzing ? 'Analizando...' : recording ? 'Grabando... toca para detener' : 'Toca para grabar'}
        </p>
      </div>
    </div>
  )
}
