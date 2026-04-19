import type { ResolvedAttachment } from '@/types'

interface Props {
  lightboxSrc: string | null
  onCloseLightbox: () => void
  deleteConfirm: ResolvedAttachment | null
  deletingAttach: boolean
  onCancelDeleteAttach: () => void
  onConfirmDeleteAttach: () => void
  confirmDeleteTask: boolean
  deletingTask: boolean
  taskTitle: string
  onCancelDeleteTask: () => void
  onConfirmDeleteTask: () => void
}

export function TaskDetailModals({
  lightboxSrc, onCloseLightbox,
  deleteConfirm, deletingAttach, onCancelDeleteAttach, onConfirmDeleteAttach,
  confirmDeleteTask, deletingTask, taskTitle, onCancelDeleteTask, onConfirmDeleteTask,
}: Props) {
  return (
    <>
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onCloseLightbox}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <img
            src={lightboxSrc}
            decoding="async"
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={onCloseLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onCancelDeleteAttach}>
          <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(6px)' }} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>¿Eliminar adjunto?</h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{deleteConfirm.file_name}</span> será eliminado permanentemente.
              </p>
              <p className="text-xs font-medium px-3 py-2 rounded-xl" style={{ background: 'oklch(from var(--destructive) l c h / 0.1)', color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
                Esta acción no se puede deshacer aunque canceles la edición.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={onCancelDeleteAttach}
                className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmDeleteAttach}
                disabled={deletingAttach}
                className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--destructive)', color: 'white', fontFamily: 'var(--font-inter)' }}
              >
                {deletingAttach ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onCancelDeleteTask}>
          <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(6px)' }} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>¿Eliminar tarea?</h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{taskTitle}</span> será eliminada permanentemente junto con todos sus adjuntos.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={onCancelDeleteTask}
                className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmDeleteTask}
                disabled={deletingTask}
                className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--destructive)', color: 'white', fontFamily: 'var(--font-inter)' }}
              >
                {deletingTask ? 'Eliminando...' : 'Eliminar tarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
