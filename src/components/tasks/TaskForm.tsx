'use client'

import { useState, useRef } from 'react'
import { createTask, updateTask } from '@/app/(app)/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Task } from '@/types'

interface Props {
  task?: Task
  onClose: () => void
}

export function TaskForm({ task, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = task ? await updateTask(task.id, formData) : await createTask(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
          Tarea *
        </Label>
        <Input
          name="title"
          required
          defaultValue={task?.title}
          placeholder="¿Qué hay que hacer?"
          autoFocus
          className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-11"
          style={{ fontFamily: 'var(--font-inter)' }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
          Descripción
        </Label>
        <textarea
          name="description"
          defaultValue={task?.description ?? ''}
          placeholder="Detalles adicionales..."
          rows={3}
          className="w-full bg-muted border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          style={{ fontFamily: 'var(--font-inter)' }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
          Fecha de entrega
        </Label>
        <Input
          name="due_date"
          type="date"
          defaultValue={task?.due_date ?? ''}
          className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-11"
          style={{ fontFamily: 'var(--font-inter)' }}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-11 rounded-xl font-semibold"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {loading ? 'Guardando...' : task ? 'Guardar' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  )
}
