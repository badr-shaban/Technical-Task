import { z } from 'zod'
import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from './types'

const emptyToUndefined = (value: unknown) =>
  value === '' || value === 'all' || value === undefined ? undefined : value

const STATUS_ALIASES: Record<string, TaskStatus> = {
  todo: 'To Do',
  'to do': 'To Do',
  'To Do': 'To Do',
  in_progress: 'In Progress',
  'in progress': 'In Progress',
  'In Progress': 'In Progress',
  done: 'Done',
  Done: 'Done',
}

const PRIORITY_ALIASES: Record<string, TaskPriority> = {
  low: 'Low',
  Low: 'Low',
  medium: 'Medium',
  Medium: 'Medium',
  high: 'High',
  High: 'High',
}

function mappedEnum<T extends string>(
  aliases: Record<string, T>,
  message: string,
) {
  return z.string().transform((value, ctx) => {
    const mapped = aliases[value]
    if (!mapped) {
      ctx.addIssue({ code: 'custom', message })
      return z.NEVER
    }
    return mapped
  })
}

const statusSchema = mappedEnum(
  STATUS_ALIASES,
  `Status must be one of: ${TASK_STATUSES.join(', ')}`,
)

const prioritySchema = mappedEnum(
  PRIORITY_ALIASES,
  `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
)

export const createTaskBodySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().trim().min(1, 'Description is required'),
  status: statusSchema.default('To Do'),
  priority: prioritySchema.default('Medium'),
  dueDate: z.coerce.date({ error: 'Due date is required' }),
})

export const updateTaskBodySchema = createTaskBodySchema.partial()

export const taskIdParamsSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid task id'),
})

export const listTasksQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.preprocess(emptyToUndefined, statusSchema.optional()),
  priority: z.preprocess(emptyToUndefined, prioritySchema.optional()),
})
