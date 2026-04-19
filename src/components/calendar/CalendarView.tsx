'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Task, Reminder } from '@/types'

type ViewMode = 'day' | 'week' | 'month'

interface Props {
  tasks: Task[]
  reminders: Reminder[]
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayKey() { return toKey(new Date()) }

function buildMonthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const end = new Date(last)
  end.setDate(last.getDate() + (6 - last.getDay()))
  const weeks: Date[][] = []
  const cur = new Date(start)
  while (cur <= end) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function getWeekStart(d: Date): Date {
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  return start
}

function getWeekDays(anchor: Date): Date[] {
  const start = getWeekStart(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

type DayEvent =
  | { kind: 'task'; id: string; title: string }
  | { kind: 'reminder'; id: string; title: string }

function TaskIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-5">
      <div className="flex items-center gap-1.5">
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'oklch(from var(--primary) l c h / 0.18)', color: 'var(--primary)' }}
        >
          <TaskIcon />
        </span>
        <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>Tarea</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'oklch(from var(--destructive) l c h / 0.18)', color: 'var(--destructive)' }}
        >
          <BellIcon />
        </span>
        <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>Recordatorio</span>
      </div>
    </div>
  )
}

function EventPill({ ev, onClick }: { ev: DayEvent; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded-md text-left transition-opacity hover:opacity-80"
      style={{
        background: ev.kind === 'task'
          ? 'oklch(from var(--primary) l c h / 0.18)'
          : 'oklch(from var(--destructive) l c h / 0.18)',
        color: ev.kind === 'task' ? 'var(--primary)' : 'var(--destructive)',
        cursor: ev.kind === 'task' ? 'pointer' : 'default',
      }}
    >
      <span className="flex-shrink-0">{ev.kind === 'task' ? <TaskIcon /> : <BellIcon />}</span>
      <span className="text-[10px] font-medium truncate leading-tight" style={{ fontFamily: 'var(--font-inter)' }}>
        {ev.title}
      </span>
    </button>
  )
}

export function CalendarView({ tasks, reminders }: Props) {
  const router = useRouter()
  const today = new Date()
  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date(today))
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Build event map
  const eventsByDay = new Map<string, DayEvent[]>()
  for (const t of tasks) {
    if (!t.due_date) continue
    const key = t.due_date.slice(0, 10)
    if (!eventsByDay.has(key)) eventsByDay.set(key, [])
    eventsByDay.get(key)!.push({ kind: 'task', id: t.id, title: t.title })
  }
  for (const r of reminders) {
    const key = r.remind_at.slice(0, 10)
    if (!eventsByDay.has(key)) eventsByDay.set(key, [])
    eventsByDay.get(key)!.push({ kind: 'reminder', id: r.id, title: r.title })
  }

  const tk = todayKey()

  // Navigation
  function prev() {
    setCurrentDate(d => {
      const nd = new Date(d)
      if (view === 'day') nd.setDate(d.getDate() - 1)
      else if (view === 'week') nd.setDate(d.getDate() - 7)
      else { nd.setDate(1); nd.setMonth(d.getMonth() - 1) }
      return nd
    })
  }

  function next() {
    setCurrentDate(d => {
      const nd = new Date(d)
      if (view === 'day') nd.setDate(d.getDate() + 1)
      else if (view === 'week') nd.setDate(d.getDate() + 7)
      else { nd.setDate(1); nd.setMonth(d.getMonth() + 1) }
      return nd
    })
  }

  function goToday() { setCurrentDate(new Date(today)) }

  // Title
  function getTitle(): string {
    if (view === 'month') return `${MONTHS[currentDate.getMonth()]} de ${currentDate.getFullYear()}`
    if (view === 'day') {
      return new Date(toKey(currentDate) + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    }
    // week
    const days = getWeekDays(currentDate)
    const first = days[0], last = days[6]
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} – ${last.getDate()} ${MONTHS_SHORT[first.getMonth()]} ${first.getFullYear()}`
    }
    return `${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`
  }

  // Selected day panel
  const panelKey = selectedKey ?? (view === 'day' ? toKey(currentDate) : null)
  const panelEvents = panelKey ? (eventsByDay.get(panelKey) ?? []) : []
  const panelDate = panelKey
    ? new Date(panelKey + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  const MAX_MONTH = 3
  const MAX_WEEK = 4

  function handleDayClick(key: string) {
    setSelectedKey(prev => prev === key ? null : key)
  }

  function handleEventClick(ev: DayEvent, e: React.MouseEvent) {
    e.stopPropagation()
    if (ev.kind === 'task') router.push(`/tasks/${ev.id}`)
  }

  // ── MONTH VIEW ────────────────────────────────────────────────────────
  function MonthGrid() {
    const weeks = buildMonthGrid(currentDate.getFullYear(), currentDate.getMonth())
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {/* Weekday headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7"
            style={{ borderBottom: wi < weeks.length - 1 ? '1px solid var(--border)' : 'none' }}>
            {week.map((day, di) => {
              const key = toKey(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = key === tk
              const isSelected = key === selectedKey
              const events = eventsByDay.get(key) ?? []
              const visible = events.slice(0, MAX_MONTH)
              const overflow = events.length - MAX_MONTH
              return (
                <div key={di} onClick={() => handleDayClick(key)}
                  className="min-h-[90px] lg:min-h-[110px] p-1.5 cursor-pointer transition-colors"
                  style={{
                    borderLeft: di > 0 ? '1px solid var(--border)' : 'none',
                    background: isSelected ? 'oklch(from var(--primary) l c h / 0.06)' : 'var(--card)',
                  }}>
                  <div className="flex justify-end mb-1">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        background: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday ? 'var(--primary-foreground)' : isCurrentMonth ? 'var(--foreground)' : 'var(--muted-foreground)',
                        fontWeight: isToday ? 700 : isCurrentMonth ? 500 : 400,
                        opacity: isCurrentMonth ? 1 : 0.4,
                      }}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {visible.map((ev, ei) => (
                      <EventPill key={ei} ev={ev} onClick={e => handleEventClick(ev, e as React.MouseEvent)} />
                    ))}
                    {overflow > 0 && (
                      <p className="text-[10px] px-1.5" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
                        +{overflow} más
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // ── WEEK VIEW ─────────────────────────────────────────────────────────
  function WeekGrid() {
    const days = getWeekDays(currentDate)
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-7" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          {days.map((day, di) => {
            const key = toKey(day)
            const isToday = key === tk
            return (
              <div key={di} onClick={() => handleDayClick(key)}
                className="py-3 px-2 text-center cursor-pointer transition-colors hover:bg-muted/40"
                style={{ borderLeft: di > 0 ? '1px solid var(--border)' : 'none' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
                  {WEEKDAYS[di]}
                </p>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mx-auto"
                  style={{
                    background: isToday ? 'var(--primary)' : 'transparent',
                    color: isToday ? 'var(--primary-foreground)' : 'var(--foreground)',
                    fontFamily: 'var(--font-inter)',
                  }}>
                  {day.getDate()}
                </span>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-7" style={{ background: 'var(--card)' }}>
          {days.map((day, di) => {
            const key = toKey(day)
            const isSelected = key === selectedKey
            const events = eventsByDay.get(key) ?? []
            const visible = events.slice(0, MAX_WEEK)
            const overflow = events.length - MAX_WEEK
            return (
              <div key={di} onClick={() => handleDayClick(key)}
                className="min-h-[150px] p-1.5 cursor-pointer transition-colors"
                style={{
                  borderLeft: di > 0 ? '1px solid var(--border)' : 'none',
                  background: isSelected ? 'oklch(from var(--primary) l c h / 0.06)' : 'var(--card)',
                }}>
                <div className="space-y-0.5">
                  {visible.map((ev, ei) => (
                    <EventPill key={ei} ev={ev} onClick={e => handleEventClick(ev, e as React.MouseEvent)} />
                  ))}
                  {overflow > 0 && (
                    <p className="text-[10px] px-1.5" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
                      +{overflow} más
                    </p>
                  )}
                  {events.length === 0 && (
                    <p className="text-[10px] px-1.5 text-center pt-2" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>—</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── DAY VIEW ──────────────────────────────────────────────────────────
  function DayView() {
    const key = toKey(currentDate)
    const events = eventsByDay.get(key) ?? []
    const isToday = key === tk
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{
              background: isToday ? 'var(--primary)' : 'var(--muted)',
              color: isToday ? 'var(--primary-foreground)' : 'var(--foreground)',
              fontFamily: 'var(--font-manrope)',
            }}>
            {currentDate.getDate()}
          </span>
          <div>
            <p className="text-sm font-semibold capitalize" style={{ fontFamily: 'var(--font-manrope)' }}>
              {WEEKDAYS_LONG[currentDate.getDay()]}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
          {isToday && (
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'oklch(from var(--primary) l c h / 0.15)', color: 'var(--primary)', fontFamily: 'var(--font-inter)' }}>
              Hoy
            </span>
          )}
        </div>

        <div className="p-4">
          {events.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
              Sin eventos para este día
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((ev, i) => (
                <button key={i} onClick={e => handleEventClick(ev, e)}
                  className="w-full flex items-center gap-3 text-left rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                  style={{
                    cursor: ev.kind === 'task' ? 'pointer' : 'default',
                    border: '1px solid var(--border)',
                  }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: ev.kind === 'task' ? 'oklch(from var(--primary) l c h / 0.15)' : 'oklch(from var(--destructive) l c h / 0.15)',
                      color: ev.kind === 'task' ? 'var(--primary)' : 'var(--destructive)',
                    }}>
                    {ev.kind === 'task' ? <TaskIcon /> : <BellIcon />}
                  </span>
                  <span className="flex-1 text-sm font-medium" style={{ fontFamily: 'var(--font-inter)' }}>{ev.title}</span>
                  <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
                    {ev.kind === 'task' ? 'Tarea' : 'Recordatorio'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── SELECTED DAY PANEL (month + week views) ───────────────────────────
  function SelectedPanel() {
    if (view === 'day' || !selectedKey) return null
    return (
      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-semibold capitalize" style={{ fontFamily: 'var(--font-manrope)' }}>
          {panelDate}
        </p>
        {panelEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>Sin eventos para este día</p>
        ) : (
          <div className="space-y-2">
            {panelEvents.map((ev, i) => (
              <button key={i} onClick={e => handleEventClick(ev, e)}
                className="w-full flex items-center gap-3 text-left group"
                style={{ cursor: ev.kind === 'task' ? 'pointer' : 'default' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: ev.kind === 'task' ? 'oklch(from var(--primary) l c h / 0.15)' : 'oklch(from var(--destructive) l c h / 0.15)',
                    color: ev.kind === 'task' ? 'var(--primary)' : 'var(--destructive)',
                  }}>
                  {ev.kind === 'task' ? <TaskIcon /> : <BellIcon />}
                </span>
                <span className="text-sm font-medium group-hover:underline"
                  style={{ fontFamily: 'var(--font-inter)', textDecoration: ev.kind !== 'task' ? 'none' : undefined }}>
                  {ev.title}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
                  {ev.kind === 'task' ? 'Tarea' : 'Recordatorio'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend — always at top */}
      <Legend />

      {/* Header: title + view toggle + navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-extrabold tracking-tight capitalize" style={{ fontFamily: 'var(--font-manrope)' }}>
          {getTitle()}
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['day', 'week', 'month'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 h-8 text-xs font-semibold transition-colors"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: view === v ? 'var(--primary)' : 'transparent',
                  color: view === v ? 'var(--primary-foreground)' : 'var(--foreground)',
                  borderLeft: v !== 'day' ? '1px solid var(--border)' : 'none',
                }}>
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={prev}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
              style={{ color: 'var(--muted-foreground)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button onClick={goToday}
              className="px-3 h-8 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
              style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              Hoy
            </button>
            <button onClick={next}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
              style={{ color: 'var(--muted-foreground)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar content */}
      {view === 'month' && <MonthGrid />}
      {view === 'week' && <WeekGrid />}
      {view === 'day' && <DayView />}

      {/* Selected day detail panel */}
      <SelectedPanel />
    </div>
  )
}
