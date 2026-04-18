export type TaskStatus = 'pending' | 'completed'

export type Task = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: TaskStatus
  workspace_id: string
  created_at: string
}

export type Attachment = {
  id: string
  task_id: string
  file_url: string  // storage path para archivos, URL directa para links
  file_type: string // mime type para archivos, 'link' para enlaces externos
  file_name: string // nombre del archivo o etiqueta del enlace
  created_at: string
}

export type TaskWithAttachments = Task & {
  attachments: Attachment[]
}

export type Workspace = {
  id: string
  name: string
  created_by: string
  created_at: string
}
