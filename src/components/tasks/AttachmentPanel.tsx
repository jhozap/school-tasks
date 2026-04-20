'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { addAttachmentRecord, addLinkAttachment, deleteAttachment } from '@/app/(app)/attachment-actions'
import type { Attachment } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface Props {
  attachments: Attachment[]
  taskId: string
  workspaceId: string
  isOwner: boolean
}

interface ResolvedAttachment extends Attachment {
  signedUrl?: string
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

export function AttachmentPanel({ attachments, taskId, workspaceId, isOwner }: Props) {
  const [open, setOpen] = useState(false)
  const [resolved, setResolved] = useState<ResolvedAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    async function resolveUrls() {
      const supabase = createClient()
      const result: ResolvedAttachment[] = await Promise.all(
        attachments.map(async (a) => {
          if (a.file_type === 'link') return { ...a }
          const { data } = await supabase.storage
            .from('attachments')
            .createSignedUrl(a.file_url, 3600)
          return { ...a, signedUrl: data?.signedUrl }
        })
      )
      setResolved(result)
    }
    resolveUrls()
  }, [open, attachments])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar 10MB')
      return
    }
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${workspaceId}/${taskId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file)
    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }
    const result = await addAttachmentRecord(taskId, path, file.type, file.name)
    if (result?.error) setError(result.error)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setLinkLoading(true)
    setError(null)
    const result = await addLinkAttachment(taskId, linkUrl, linkLabel)
    if (result?.error) {
      setError(result.error)
    } else {
      setLinkUrl('')
      setLinkLabel('')
      setShowLinkForm(false)
    }
    setLinkLoading(false)
  }

  async function handleDelete(attachment: ResolvedAttachment) {
    const storagePath = attachment.file_type !== 'link' ? attachment.file_url : null
    await deleteAttachment(attachment.id, storagePath)
  }

  if (!isOwner && attachments.length === 0) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <PaperclipIcon />
        <span>
          {attachments.length > 0
            ? `${attachments.length} adjunto${attachments.length > 1 ? 's' : ''}`
            : isOwner ? 'Adjuntar' : null}
        </span>
        <span className="text-muted-foreground/50">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {resolved.map((a) => (
            <div key={a.id} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              {a.file_type === 'link' ? (
                <>
                  <span className="text-muted-foreground"><GlobeIcon /></span>
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs font-medium text-primary truncate hover:underline"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    {a.file_name}
                  </a>
                </>
              ) : a.file_type.startsWith('image/') ? (
                <>
                  {a.signedUrl ? (
                    <a href={a.signedUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <Image
                        src={a.signedUrl}
                        alt={a.file_name}
                        width={32}
                        height={32}
                        className="rounded-lg object-cover"
                      />
                    </a>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted-foreground/20 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-xs text-muted-foreground truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                    {a.file_name}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground"><FileIcon /></span>
                  {a.signedUrl ? (
                    <a
                      href={a.signedUrl}
                      download={a.file_name}
                      className="flex-1 text-xs font-medium text-primary truncate hover:underline"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {a.file_name}
                    </a>
                  ) : (
                    <span className="flex-1 text-xs text-muted-foreground truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                      {a.file_name}
                    </span>
                  )}
                </>
              )}
              {isOwner && (
                <button
                  onClick={() => handleDelete(a)}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0 transition-colors"
                  aria-label="Eliminar adjunto"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {error && (
            <p className="text-xs text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>
          )}

          {isOwner && showLinkForm ? (
            <form onSubmit={handleAddLink} className="space-y-2 bg-muted rounded-xl p-3">
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full bg-background rounded-lg px-3 py-2 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ fontFamily: 'var(--font-inter)' }}
              />
              <input
                type="text"
                value={linkLabel}
                onChange={e => setLinkLabel(e.target.value)}
                placeholder="Etiqueta (opcional)"
                className="w-full bg-background rounded-lg px-3 py-2 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ fontFamily: 'var(--font-inter)' }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowLinkForm(false); setLinkUrl(''); setLinkLabel('') }}
                  className="flex-1 text-xs py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-inter)' }}
                >
                  {linkLoading ? '...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : isOwner ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <FileIcon />
                {uploading ? 'Subiendo...' : 'Archivo'}
              </button>
              <button
                onClick={() => setShowLinkForm(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <GlobeIcon />
                Enlace
              </button>
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  )
}
