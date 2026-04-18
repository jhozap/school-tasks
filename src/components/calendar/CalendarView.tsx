'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Task, Reminder } from '@/types'

interface Props {
  tasks: Task[]
  reminders: Reminder[]
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayKey() {
  return toKey(new Date())
}

function buildGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const start = new Date(first)
  start.setDate(1 - first.getDay())           // back to Sunday

  const end = new Date(last)
  end.setDate(last.getDate() + (6 - last.getDay())) // forward to Saturday

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

type DayEvent =
  | { kind: 'task'; id: string; title: string }
  | { kind: 'reminder'; id: string; title: string }

export function CalendarView({ tasks, reminders }: Props) {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Build event maps
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

  const weeks = buildGrid(year, month)
  const tk = todayKey()

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  // Selected day events for detail panel
  const selectedEvents = selectedKey ? (eventsByDay.get(selectedKey) ?? []) : []
  const selectedDate = selectedKey
    ? new Date(selectedKey + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  const MAX_VISIBLE = 3

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
          {MONTHS[month]} de {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="px-3 h-8 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
            style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Hoy
          </button>
          <button
            onClick={next}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          {WEEKDAYS.map(d => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7"
            style={{ borderBottom: wi < weeks.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            {week.map((day, di) => {
              const key = toKey(day)
              const isCurrentMonth = day.getMonth() === month
              const isToday = key === tk
              const isSelected = key === selectedKey
              const events = eventsByDay.get(key) ?? []
              const visible = events.slice(0, MAX_VISIBLE)
              const overflow = events.length - MAX_VISIBLE

              return (
                <div
                  key={di}
                  onClick={() => setSelectedKey(isSelected ? null : key)}
                  className="min-h-[90px] lg:min-h-[110px] p-1.5 cursor-pointer transition-colors"
                  style={{
                    borderLeft: di > 0 ? '1px solid var(--border)' : 'none',
                    background: isSelected
                      ? 'oklch(from var(--primary) l c h / 0.06)'
                      : 'var(--card)',
                  }}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        background: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday
                          ? 'var(--primary-foreground)'
                          : isCurrentMonth
                            ? 'var(--foreground)'
                            : 'var(--muted-foreground)',
                        fontWeight: isToday ? 700 : isCurrentMonth ? 500 : 400,
                        opacity: isCurrentMonth ? 1 : 0.4,
                      }}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Event pills */}
                  <div className="space-y-0.5">
                    {visible.map((ev, ei) => (
                      <button
                        key={ei}
                        onClick={e => {
                          e.stopPropagation()
                          if (ev.kind === 'task') router.push(`/tasks/${ev.id}`)
                        }}
                        className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded-md text-left transition-opacity hover:opacity-80"
                        style={{
                          background: ev.kind === 'task'
                            ? 'oklch(from var(--primary) l c h / 0.18)'
                            : 'oklch(from var(--destructive) l c h / 0.18)',
                          color: ev.kind === 'task' ? 'var(--primary)' : 'var(--destructive)',
                        }}
                      >
                        <span className="flex-shrink-0">
                          {ev.kind === 'task' ? <TaskIcon /> : <BellIcon />}
                        </span>
                        <span
                          className="text-[10px] font-medium truncate leading-tight"
                          style={{ fontFamily: 'var(--font-inter)' }}
                        >
                          {ev.title}
                        </span>
                      </button>
                    ))}
                    {overflow > 0 && (
                      <p
                        className="text-[10px] px-1.5"
                        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
                      >
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

      {/* Legend */}
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

      {/* Selected day detail */}
      {selectedKey && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold capitalize" style={{ fontFamily: 'var(--font-manrope)' }}>
            {selectedDate}
          </p>

          {selectedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              Sin eventos para este día
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev, i) => (
                <button
                  key={i}
                  onClick={() => ev.kind === 'task' && router.push(`/tasks/${ev.id}`)}
                  className="w-full flex items-center gap-3 text-left group"
                  style={{ cursor: ev.kind === 'task' ? 'pointer' : 'default' }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: ev.kind === 'task'
                        ? 'oklch(from var(--primary) l c h / 0.15)'
                        : 'oklch(from var(--destructive) l c h / 0.15)',
                      color: ev.kind === 'task' ? 'var(--primary)' : 'var(--destructive)',
                    }}
                  >
                    {ev.kind === 'task' ? <TaskIcon /> : <BellIcon />}
                  </span>
                  <span
                    className="text-sm font-medium group-hover:underline"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      textDecoration: ev.kind === 'task' ? undefined : 'none',
                    }}
                  >
                    {ev.title}
                  </span>
                  <span
                    className="text-xs ml-auto"
                    style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
                  >
                    {ev.kind === 'task' ? 'Tarea' : 'Recordatorio'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
