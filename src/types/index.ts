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
  file_url: string
  file_type: string
  file_name: string
  created_at: string
}

export type Workspace = {
  id: string
  name: string
  created_by: string
  created_at: string
}
