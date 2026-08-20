import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@/types/task'
import { delay, getAuthToken } from '@/services/api'
import {
  createTaskRecord,
  deleteTaskRecord,
  listTasks,
  requireUser,
  updateTaskRecord,
} from '@/services/mockStore'

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  await delay()
  const user = requireUser(getAuthToken())
  return listTasks(user.id, filters)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await delay()
  const user = requireUser(getAuthToken())
  return createTaskRecord(user.id, input)
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  await delay()
  const user = requireUser(getAuthToken())
  return updateTaskRecord(user.id, taskId, input)
}

export async function deleteTask(taskId: string): Promise<void> {
  await delay()
  const user = requireUser(getAuthToken())
  deleteTaskRecord(user.id, taskId)
}
