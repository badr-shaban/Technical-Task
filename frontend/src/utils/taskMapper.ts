import type { Task, TaskPriority, TaskStatus } from '@/types/task'

export interface ApiTask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  userId?: string
  user?: string
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

export function mapTask(raw: ApiTask): Task {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: STATUS_FROM_API[raw.status] ?? 'todo',
    priority: PRIORITY_FROM_API[raw.priority] ?? 'medium',
    dueDate: raw.dueDate,
    userId: raw.userId ?? String(raw.user ?? ''),
  }
}
