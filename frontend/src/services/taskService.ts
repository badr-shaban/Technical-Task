import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@/types/task'
import { api, type ApiResponse } from '@/services/api'
import { mapTask, type ApiTask } from '@/utils/taskMapper'

function toQuery(filters: TaskFilters): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.status && filters.status !== 'all') {
    params.status = filters.status
  }

  if (filters.priority && filters.priority !== 'all') {
    params.priority = filters.priority
  }

  return params
}

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const { data } = await api.get<ApiResponse<ApiTask[]>>('/tasks', {
    params: toQuery(filters),
  })
  return data.data.map(mapTask)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<ApiResponse<ApiTask>>('/tasks', input)
  return mapTask(data.data)
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const { data } = await api.put<ApiResponse<ApiTask>>(`/tasks/${taskId}`, input)
  return mapTask(data.data)
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`)
}
