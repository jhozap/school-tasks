import type { ResolvedAttachment } from '@/types'

interface Props {
  images: ResolvedAttachment[]
  links: ResolvedAttachment[]
  files: ResolvedAttachment[]
  editMode: boolean
  isOwner: boolean
  onLightbox: (src: string) => void
  onDeleteConfirm: (a: ResolvedAttachment) => void
  onDownload: (url: string, name: string) => void
}

export function AttachmentDisplay({
  images, links, files, editMode, isOwner, onLightbox, onDeleteConfirm, onDownload,
}: Props) {
  return (
    <>
      {images.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Imágenes ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map(a => (
              <div key={a.id} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                  {a.signedUrl ? (
                    <button className="w-full h-full block" onClick={() => onLightbox(a.signedUrl!)}>
                      <img
                        src={a.signedUrl}
                        alt={a.file_name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {!editMode && a.signedUrl && (
                    <button
                      onClick={() => onDownload(a.signedUrl!, a.file_name)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
                      title="Descargar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  )}
                  {editMode && isOwner && (
                    <button
                      onClick={() => onDeleteConfirm(a)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
                      style={{ background: 'var(--destructive)', color: 'white' }}
                      title="Eliminar"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 truncate px-1" style={{ fontFamily: 'var(--font-inter)' }}>
                  {a.file_name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Enlaces ({links.length})
          </p>
          <div className="space-y-2">
            {links.map(a => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
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
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-sm font-medium truncate">{a.file_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.file_url}</p>
                </a>
                {editMode && isOwner && (
                  <button
                    onClick={() => onDeleteConfirm(a)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted"
                    style={{ color: 'var(--destructive)' }}
                    title="Eliminar enlace"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Archivos ({files.length})
          </p>
          <div className="space-y-2">
            {files.map(a => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
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
                  <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-inter)' }}>{a.file_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!editMode && a.signedUrl && (
                    <button
                      onClick={() => onDownload(a.signedUrl!, a.file_name)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      title="Descargar"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  )}
                  {editMode && isOwner && (
                    <button
                      onClick={() => onDeleteConfirm(a)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                      style={{ color: 'var(--destructive)' }}
                      title="Eliminar archivo"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
