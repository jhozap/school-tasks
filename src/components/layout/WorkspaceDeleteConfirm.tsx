interface Props {
  name: string
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function WorkspaceDeleteConfirm({ name, deleting, onCancel, onConfirm }: Props) {
  return (
    <div
      className="rounded-xl px-3 py-2.5 space-y-2"
      style={{
        background: 'oklch(from var(--destructive) l c h / 0.08)',
        border: '1px solid oklch(from var(--destructive) l c h / 0.2)',
      }}
    >
      <p className="text-xs font-medium leading-snug" style={{ color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
        ¿Eliminar &quot;{name}&quot;? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ fontFamily: 'var(--font-inter)', background: 'var(--muted)', color: 'var(--foreground)' }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: 'var(--destructive)',
            color: '#fff',
            fontFamily: 'var(--font-inter)',
            opacity: deleting ? 0.6 : 1,
          }}
        >
          {deleting ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </div>
  )
}
