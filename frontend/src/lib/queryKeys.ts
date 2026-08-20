import type { TaskFilters } from '@/types/task'

export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
}

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
}
