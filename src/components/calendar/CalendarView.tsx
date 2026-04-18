'use client'

import { useState } from 'react'
import type { Task, Reminder } from '@/types'

interface Props {
  tasks: Task[]
  reminders: Reminder[]
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toDateKey(dateStr: string) {
  return dateStr.slice(0, 10)
}

function localDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function CalendarView({ tasks, reminders }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const tasksByDay = new Map<string, Task[]>()
  for (const t of tasks) {
    if (t.due_date) {
      const key = toDateKey(t.due_date)
      if (!tasksByDay.has(key)) tasksByDay.set(key, [])
      tasksByDay.get(key)!.push(t)
    }
  }

  const remindersByDay = new Map<string, Reminder[]>()
  for (const r of reminders) {
    const key = toDateKey(r.remind_at)
    if (!remindersByDay.has(key)) remindersByDay.set(key, [])
    remindersByDay.get(key)!.push(r)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const todayKey = localDateKey(today)

  const selectedTasks = selectedDay ? (tasksByDay.get(selectedDay) ?? []) : []
  const selectedReminders = selectedDay ? (remindersByDay.get(selectedDay) ?? []) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={next}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wide py-1" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = key === todayKey
          const isSelected = key === selectedDay
          const hasTasks = tasksByDay.has(key)
          const hasReminders = remindersByDay.has(key)
          const taskCount = tasksByDay.get(key)?.length ?? 0
          const reminderCount = remindersByDay.get(key)?.length ?? 0

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className="relative flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors"
              style={{
                background: isSelected
                  ? 'oklch(from var(--primary) l c h / 0.15)'
                  : isToday
                    ? 'oklch(from var(--primary) l c h / 0.08)'
                    : 'transparent',
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: isToday ? 'var(--primary)' : 'transparent',
                  color: isToday ? 'var(--primary-foreground)' : 'var(--foreground)',
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                {day}
              </span>
              {/* Dots */}
              <div className="flex gap-0.5 h-1.5">
                {hasTasks && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                )}
                {hasReminders && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--destructive)' }} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
          <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>Tareas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--destructive)' }} />
          <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>Recordatorios</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (selectedTasks.length > 0 || selectedReminders.length > 0) && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope)' }}>
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          {selectedTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Tareas
              </p>
              {selectedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: t.status === 'completed' ? 'var(--muted-foreground)' : 'var(--primary)' }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: t.status === 'completed' ? 'var(--muted-foreground)' : 'var(--foreground)',
                      textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                    }}
                  >
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedReminders.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Recordatorios
              </p>
              {selectedReminders.map(r => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--destructive)' }} />
                  <div>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}>{r.title}</p>
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                      {new Date(r.remind_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedDay && selectedTasks.length === 0 && selectedReminders.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            Sin eventos para este día
          </p>
        </div>
      )}
    </div>
  )
}
