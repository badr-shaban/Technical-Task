import type {
  CreateTaskInput,
  PaginatedTasks,
  PaginationMeta,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@/types/task'
import { TASK_PAGE_SIZE } from '@/types/task'
import { api, type ApiResponse } from '@/services/api'
import { mapTask, type ApiTask } from '@/utils/taskMapper'

interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: PaginationMeta
}

function toQuery(filters: TaskFilters): Record<string, string> {
  const params: Record<string, string> = {
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? TASK_PAGE_SIZE),
  }

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

async function persistAttachments(
  taskId: string,
  files?: File[],
  removedAttachmentIds?: string[],
): Promise<Task | null> {
  let latest: Task | null = null

  for (const attachmentId of removedAttachmentIds ?? []) {
    latest = await deleteTaskAttachment(taskId, attachmentId)
  }

  if (files?.length) {
    latest = await uploadTaskAttachments(taskId, files)
  }

  return latest
}

export async function getTasks(filters: TaskFilters = {}): Promise<PaginatedTasks> {
  const { data } = await api.get<PaginatedApiResponse<ApiTask[]>>('/tasks', {
    params: toQuery(filters),
  })

  return {
    tasks: data.data.map(mapTask),
    pagination: data.pagination,
  }
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { files, title, description, status, priority, dueDate } = input
  const { data } = await api.post<ApiResponse<ApiTask>>('/tasks', {
    title,
    description,
    status,
    priority,
    dueDate,
  })
  const created = mapTask(data.data)
  const withAttachments = await persistAttachments(created.id, files)
  return withAttachments ?? created
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const { files, removedAttachmentIds, title, description, status, priority, dueDate } =
    input
  const { data } = await api.put<ApiResponse<ApiTask>>(`/tasks/${taskId}`, {
    title,
    description,
    status,
    priority,
    dueDate,
  })
  const updated = mapTask(data.data)
  const withAttachments = await persistAttachments(
    taskId,
    files,
    removedAttachmentIds,
  )
  return withAttachments ?? updated
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`)
}

export async function uploadTaskAttachments(
  taskId: string,
  files: File[],
): Promise<Task> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const { data } = await api.post<ApiResponse<ApiTask>>(
    `/tasks/${taskId}/attachments`,
    formData,
  )
  return mapTask(data.data)
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string,
): Promise<Task> {
  const { data } = await api.delete<ApiResponse<ApiTask>>(
    `/tasks/${taskId}/attachments/${attachmentId}`,
  )
  return mapTask(data.data)
}
