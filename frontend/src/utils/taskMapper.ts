import type { Task, TaskAttachment, TaskPriority, TaskStatus } from '@/types/task'

export interface ApiAttachment {
  id?: string
  _id?: string
  url: string
  originalName: string
  mimeType: string
  size: number
}

export interface ApiTask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  userId?: string
  user?: string
  attachments?: ApiAttachment[]
}

const STATUS_FROM_API: Record<string, TaskStatus> = {
  'To Do': 'todo',
  todo: 'todo',
  'In Progress': 'in_progress',
  in_progress: 'in_progress',
  Done: 'done',
  done: 'done',
}

const PRIORITY_FROM_API: Record<string, TaskPriority> = {
  Low: 'low',
  low: 'low',
  Medium: 'medium',
  medium: 'medium',
  High: 'high',
  high: 'high',
}

function mapAttachment(raw: ApiAttachment): TaskAttachment {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    url: raw.url,
    originalName: raw.originalName,
    mimeType: raw.mimeType,
    size: raw.size,
  }
}

export function mapTask(raw: ApiTask): Task {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: STATUS_FROM_API[raw.status] ?? 'todo',
    priority: PRIORITY_FROM_API[raw.priority] ?? 'medium',
    dueDate: raw.dueDate,
    userId: raw.userId ?? String(raw.user ?? ''),
    attachments: (raw.attachments ?? []).map(mapAttachment),
  }
}
