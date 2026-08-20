export const TASK_STATUSES = ['To Do', 'In Progress', 'Done'] as const
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface JwtPayload {
  userId: string
}
