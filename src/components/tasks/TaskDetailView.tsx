'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toggleTask, deleteTask } from '@/app/(app)/actions'
import { addAttachmentRecord, addLinkAttachment, deleteAttachment } from '@/app/(app)/attachment-actions'
import { TaskModal } from './TaskModal'
import type { TaskWithAttachments, Attachment } from '@/types'

interface Props {
  task: TaskWithAttachments
  userId: string
  workspaceId: string
}

interface ResolvedAttachment extends Attachment {
  signedUrl?: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getDiffDays(dueDateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getAccentColor(task: TaskWithAttachments) {
  if (task.status === 'completed') return 'var(--chart-3)'
  if (!task.due_date) return 'var(--muted-foreground)'
  const d = getDiffDays(task.due_date)
  if (d < 0 || d === 0) return 'var(--destructive)'
  if (d <= 7) return 'var(--chart-4)'
  return 'var(--chart-2)'
}

function StatusLabel({ task }: { task: TaskWithAttachments }) {
  if (task.status === 'completed') return <span style={{ color: 'var(--chart-3)' }}>Completada</span>
  if (!task.due_date) return <span style={{ color: 'var(--muted-foreground)' }}>Sin fecha</span>
  const d = getDiffDays(task.due_date)
  if (d < 0) return <span style={{ color: 'var(--destructive)' }}>Vencida</span>
  if (d === 0) return <span style={{ color: 'var(--destructive)' }}>Hoy</span>
  if (d === 1) return <span style={{ color: 'var(--chart-4)' }}>Mañana</span>
  if (d <= 7) return <span style={{ color: 'var(--chart-4)' }}>Esta semana</span>
  return <span style={{ color: 'var(--chart-2)' }}>Próxima</span>
}

export function TaskDetailView({ task, userId, workspaceId }: Props) {
  const router = useRouter()
  const isOwner = task.created_by === userId
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resolved, setResolved] = useState<ResolvedAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    async function resolve() {
      const supabase = createClient()
      const result: ResolvedAttachment[] = await Promise.all(
        (task.attachments ?? []).map(async (a) => {
          if (a.file_type === 'link') return { ...a }
          const { data } = await supabase.storage.from('attachments').createSignedUrl(a.file_url, 3600)
          return { ...a, signedUrl: data?.signedUrl }
        })
      )
      setResolved(result)
    }
    resolve()
  }, [task.attachments])

  async function handleToggle() {
    await toggleTask(task.id, task.status)
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteTask(task.id)
    router.push('/')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('El archivo no puede superar 10MB'); return }
    setUploading(true); setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${workspaceId}/${task.id}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('attachments').upload(path, file)
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const result = await addAttachmentRecord(task.id, path, file.type, file.name)
    if (result?.error) setError(result.error)
    setUploading(false)
    router.refresh()
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setLinkLoading(true); setError(null)
    const result = await addLinkAttachment(task.id, linkUrl, linkLabel)
    if (result?.error) { setError(result.error) }
    else { setLinkUrl(''); setLinkLabel(''); setShowLinkForm(false); router.refresh() }
    setLinkLoading(false)
  }

  async function handleDeleteAttachment(a: ResolvedAttachment) {
    await deleteAttachment(a.id, a.file_type !== 'link' ? a.file_url : null)
    router.refresh()
  }

  const images = resolved.filter(a => a.file_type.startsWith('image/'))
  const links = resolved.filter(a => a.file_type === 'link')
  const files = resolved.filter(a => !a.file_type.startsWith('image/') && a.file_type !== 'link')

  return (
    <>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8"
          style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--destructive)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8 space-y-8">
          {/* Task header */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <button
                onClick={handleToggle}
                className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: task.status === 'completed' ? 'var(--chart-3)' : 'var(--border)',
                  background: task.status === 'completed' ? 'var(--chart-3)' : 'transparent',
                }}
              >
                {task.status === 'completed' && (
                  <svg width="11" height="9" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <h1
                className="text-2xl font-extrabold leading-snug"
                style={{
                  fontFamily: 'var(--font-manrope)',
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'var(--muted-foreground)' : 'var(--foreground)',
                }}
              >
                {task.title}
              </h1>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 pl-9">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--muted)', fontFamily: 'var(--font-inter)' }}
              >
                <StatusLabel task={task} />
              </div>
              {task.due_date && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background: 'var(--muted)', color: getAccentColor(task), fontFamily: 'var(--font-inter)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(task.due_date)}
                </div>
              )}
            </div>

            {task.description && (
              <div
                className="pl-9 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)', whiteSpace: 'pre-wrap' }}
              >
                {task.description}
              </div>
            )}
          </div>

          {/* Images */}
          {images.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Imágenes ({images.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map(a => (
                  <div key={a.id} className="relative group aspect-square">
                    {a.signedUrl ? (
                      <button
                        className="w-full h-full rounded-2xl overflow-hidden block"
                        onClick={() => setLightboxSrc(a.signedUrl!)}
                      >
                        <img
                          src={a.signedUrl}
                          alt={a.file_name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)' }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteAttachment(a)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'var(--destructive)', color: 'white' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1 truncate px-1" style={{ fontFamily: 'var(--font-inter)' }}>
                      {a.file_name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {links.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Enlaces ({links.length})
              </p>
              <div className="space-y-2">
                {links.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl group"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'oklch(from var(--primary) l c h / 0.12)', color: 'var(--primary)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 hover:underline"
                      style={{ fontFamily: 'var(--font-inter)', color: 'var(--primary)' }}
                    >
                      <p className="text-sm font-medium truncate">{a.file_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.file_url}</p>
                    </a>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteAttachment(a)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Other files */}
          {files.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Archivos ({files.length})
              </p>
              <div className="space-y-2">
                {files.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl group"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      {a.signedUrl ? (
                        <a
                          href={a.signedUrl}
                          download={a.file_name}
                          className="text-sm font-medium hover:underline truncate block"
                          style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
                        >
                          {a.file_name}
                        </a>
                      ) : (
                        <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-inter)' }}>{a.file_name}</p>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteAttachment(a)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Add attachments — owner only */}
          {isOwner && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Adjuntar
              </p>
              {error && <p className="text-xs text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>}

              {showLinkForm ? (
                <form onSubmit={handleAddLink} className="space-y-2 rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  />
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={e => setLinkLabel(e.target.value)}
                    placeholder="Nombre del enlace (opcional)"
                    className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setShowLinkForm(false); setLinkUrl(''); setLinkLabel('') }}
                      className="flex-1 h-10 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={linkLoading}
                      className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-inter)' }}>
                      {linkLoading ? 'Guardando...' : 'Guardar enlace'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-3">
                  <label
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium transition-colors cursor-pointer hover:bg-muted"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
                    </svg>
                    {uploading ? 'Subiendo...' : 'Archivo o imagen'}
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  <button
                    onClick={() => setShowLinkForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium transition-colors hover:bg-muted"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Enlace
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setLightboxSrc(null)}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <img
            src={lightboxSrc}
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {editing && <TaskModal task={task} onClose={() => { setEditing(false); router.refresh() }} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(6px)' }} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="space-y-1">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>¿Eliminar tarea?</h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{task.title}</span> será eliminada permanentemente.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--destructive)', color: 'white', fontFamily: 'var(--font-inter)' }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
