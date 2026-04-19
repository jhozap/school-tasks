'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toggleTask, deleteTask, updateTask } from '@/app/(app)/actions'
import { addAttachmentRecord, addLinkAttachment, deleteAttachment } from '@/app/(app)/attachment-actions'
import { TaskModal } from './TaskModal'
import { AttachmentDisplay } from './AttachmentDisplay'
import { TaskDetailModals } from './TaskDetailModals'
import { formatDateDisplay, getTaskAccentColor } from '@/lib/dates'
import type { TaskWithAttachments, ResolvedAttachment } from '@/types'

interface Props {
  task: TaskWithAttachments
  userId: string
  workspaceId: string
  initialEdit?: boolean
}

interface SessionAttachment {
  id: string
  storagePath: string | null
}

async function downloadBlob(url: string, name: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const objUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objUrl; a.download = name
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(objUrl)
}

export function TaskDetailView({ task, userId, workspaceId, initialEdit = false }: Props) {
  const router = useRouter()
  const isOwner = task.created_by === userId
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editMode, setEditMode] = useState(initialEdit && isOwner)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [resolved, setResolved] = useState<ResolvedAttachment[]>([])
  const [addedInSession, setAddedInSession] = useState<SessionAttachment[]>([])

  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ResolvedAttachment | null>(null)
  const [deletingAttach, setDeletingAttach] = useState(false)
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(false)
  const [deletingTask, setDeletingTask] = useState(false)

  // Batch signed URL resolution — one request for all attachments
  useEffect(() => {
    async function resolve() {
      const nonLinks = (task.attachments ?? []).filter(a => a.file_type !== 'link')
      const links = (task.attachments ?? []).filter(a => a.file_type === 'link')

      if (nonLinks.length === 0) {
        setResolved(links.map(a => ({ ...a })))
        return
      }

      const supabase = createClient()
      const { data: signed } = await supabase.storage
        .from('attachments')
        .createSignedUrls(nonLinks.map(a => a.file_url), 3600)

      const signedMap = Object.fromEntries(
        (signed ?? []).map(s => [s.path, s.signedUrl])
      )

      setResolved([
        ...nonLinks.map(a => ({ ...a, signedUrl: signedMap[a.file_url] ?? undefined })),
        ...links.map(a => ({ ...a })),
      ])
    }
    resolve()
  }, [task.attachments])

  function enterEdit() {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setDueDate(task.due_date ?? '')
    setAddedInSession([])
    setError(null)
    setShowLinkForm(false)
    setEditMode(true)
  }

  async function handleCancel() {
    if (addedInSession.length === 0) { setEditMode(false); return }
    setCancelling(true)
    await Promise.all(addedInSession.map(item => deleteAttachment(item.id, item.storagePath)))
    setCancelling(false)
    setAddedInSession([])
    setEditMode(false)
    router.refresh()
  }

  async function handleSave() {
    setSaving(true); setError(null)
    const formData = new FormData()
    formData.set('title', title.trim())
    formData.set('description', description)
    formData.set('due_date', dueDate)
    const result = await updateTask(task.id, formData)
    if (result?.error) { setError(result.error); setSaving(false); return }
    setAddedInSession([])
    setSaving(false)
    setEditMode(false)
    router.refresh()
  }

  async function handleToggle() {
    await toggleTask(task.id, task.status)
    router.refresh()
  }

  async function handleDeleteTask() {
    setDeletingTask(true)
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
    if (result?.error) { setError(result.error); setUploading(false); return }
    setAddedInSession(prev => [...prev, { id: result.id!, storagePath: path }])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    router.refresh()
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setLinkLoading(true); setError(null)
    const result = await addLinkAttachment(task.id, linkUrl, linkLabel)
    if (result?.error) { setError(result.error); setLinkLoading(false); return }
    setAddedInSession(prev => [...prev, { id: result.id!, storagePath: null }])
    setLinkUrl(''); setLinkLabel(''); setShowLinkForm(false)
    setLinkLoading(false)
    router.refresh()
  }

  async function handleDeleteExisting() {
    if (!deleteConfirm) return
    setDeletingAttach(true)
    const storagePath = deleteConfirm.file_type !== 'link' ? deleteConfirm.file_url : null
    await deleteAttachment(deleteConfirm.id, storagePath)
    setAddedInSession(prev => prev.filter(s => s.id !== deleteConfirm.id))
    setDeleteConfirm(null)
    setDeletingAttach(false)
    router.refresh()
  }

  const images = resolved.filter(a => a.file_type.startsWith('image/'))
  const links = resolved.filter(a => a.file_type === 'link')
  const files = resolved.filter(a => !a.file_type.startsWith('image/') && a.file_type !== 'link')
  const dateColor = getTaskAccentColor(task.status, task.due_date)

  return (
    <>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8"
          style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            onClick={() => editMode ? handleCancel() : router.back()}
            disabled={cancelling}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary disabled:opacity-50"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {editMode ? (cancelling ? 'Cancelando...' : 'Cancelar') : 'Volver'}
          </button>

          <div className="flex items-center gap-2">
            {editMode ? (
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-inter)' }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            ) : isOwner ? (
              <>
                <button
                  onClick={enterEdit}
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
                  onClick={() => setConfirmDeleteTask(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                  style={{ fontFamily: 'var(--font-inter)', color: 'var(--destructive)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                  Eliminar
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8 space-y-8">
          {/* Task header */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {!editMode && (
                <button
                  onClick={handleToggle}
                  className="mt-1.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
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
              )}

              {editMode ? (
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Título de la tarea"
                  className="flex-1 text-2xl font-extrabold bg-transparent border-b-2 outline-none pb-1 transition-colors"
                  style={{ fontFamily: 'var(--font-manrope)', borderColor: 'var(--primary)', color: 'var(--foreground)' }}
                />
              ) : (
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
              )}
            </div>

            <div className="pl-9">
              {editMode ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="h-10 px-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-shadow"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
                  />
                </div>
              ) : task.due_date ? (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background: 'var(--muted)', color: dateColor, fontFamily: 'var(--font-inter)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDateDisplay(task.due_date)}
                </div>
              ) : null}
            </div>

            <div className="pl-9">
              {editMode ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Agrega una descripción..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none transition-shadow"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
                  />
                </div>
              ) : task.description ? (
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)', whiteSpace: 'pre-wrap' }}
                >
                  {task.description}
                </p>
              ) : null}
            </div>

            {error && (
              <p className="pl-9 text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>
            )}
          </div>

          {/* Attachment display sections */}
          <AttachmentDisplay
            images={images}
            links={links}
            files={files}
            editMode={editMode}
            isOwner={isOwner}
            onLightbox={setLightboxSrc}
            onDeleteConfirm={setDeleteConfirm}
            onDownload={downloadBlob}
          />

          {/* Add attachments — edit mode + owner only */}
          {editMode && isOwner && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Agregar adjuntos
              </p>

              {showLinkForm ? (
                <form
                  onSubmit={handleAddLink}
                  className="space-y-3 rounded-2xl p-4"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
                  />
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={e => setLinkLabel(e.target.value)}
                    placeholder="Nombre del enlace (opcional)"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowLinkForm(false); setLinkUrl(''); setLinkLabel('') }}
                      className="flex-1 h-10 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={linkLoading}
                      className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-inter)' }}
                    >
                      {linkLoading ? 'Guardando...' : 'Agregar enlace'}
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
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={handleFileChange} disabled={uploading} />
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

          {!editMode && !isOwner && resolved.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" style={{ fontFamily: 'var(--font-inter)' }}>
              Sin adjuntos
            </p>
          )}
        </div>
      </div>

      <TaskDetailModals
        lightboxSrc={lightboxSrc}
        onCloseLightbox={() => setLightboxSrc(null)}
        deleteConfirm={deleteConfirm}
        deletingAttach={deletingAttach}
        onCancelDeleteAttach={() => setDeleteConfirm(null)}
        onConfirmDeleteAttach={handleDeleteExisting}
        confirmDeleteTask={confirmDeleteTask}
        deletingTask={deletingTask}
        taskTitle={task.title}
        onCancelDeleteTask={() => setConfirmDeleteTask(false)}
        onConfirmDeleteTask={handleDeleteTask}
      />
    </>
  )
}
