export function getDiffDays(dueDateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function formatDateParts(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
    weekday: d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),
  }
}

const ORANGE = 'oklch(0.72 0.19 47)'

export function getTaskAccentColor(status: string, dueDate: string | null | undefined): string {
  if (status === 'completed') return 'var(--chart-3)'
  if (!dueDate) return 'var(--muted-foreground)'
  const d = getDiffDays(dueDate)
  if (d < 0 || d === 0) return 'var(--destructive)'
  if (d === 1) return ORANGE
  if (d <= 7) return 'var(--chart-4)'
  return 'var(--chart-2)'
}
