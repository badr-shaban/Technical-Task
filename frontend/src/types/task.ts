export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export interface TaskAttachment {
  id: string
  url: string
  originalName: string
  mimeType: string
  size: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  userId: string
  attachments: TaskAttachment[]
}

export interface CreateTaskInput {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  files?: File[]
  removedAttachmentIds?: string[]
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export interface TaskFilters {
  search?: string
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  page?: number
  limit?: number
}

export const TASK_PAGE_SIZE = 6
export const BOARD_PAGE_SIZE = 50
export const MAX_TASK_ATTACHMENTS = 10
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024
export const ALLOWED_ATTACHMENT_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,.doc,.docx'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedTasks {
  tasks: Task[]
  pagination: PaginationMeta
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
