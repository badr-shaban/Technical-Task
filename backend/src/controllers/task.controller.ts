import type { Request, Response } from 'express'
import { Task } from '../models/Task'
import { AppError } from '../utils/AppError'
import { asyncHandler } from '../utils/asyncHandler'
import { escapeRegex } from '../utils/escapeRegex'
import type { TaskPriority, TaskStatus } from '../utils/types'

function getTaskId(req: Request): string {
  const id = req.params.id
  return Array.isArray(id) ? id[0] : id
}

interface TaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
}

/**
 * Every task query is scoped to req.userId. A matching _id from another
 * account is treated as "not found" so users cannot read or mutate
 * someone else's tasks.
 */
async function findOwnedTaskOrThrow(taskId: string, userId: string) {
  const task = await Task.findOne({ _id: taskId, user: userId })
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  return task
}

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as TaskInput

  const task = await Task.create({
    ...body,
    user: req.userId,
  })

  res.status(201).json({
    success: true,
    message: 'Task created',
    data: task,
  })
})

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, priority } = req.query as {
    search?: string
    status?: TaskStatus
    priority?: TaskPriority
  }

  const filter: Record<string, unknown> = { user: req.userId }

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: 'i' }
  }

  if (status) {
    filter.status = status
  }

  if (priority) {
    filter.priority = priority
  }

  const tasks = await Task.find(filter).sort({ dueDate: 1 })

  res.status(200).json({
    success: true,
    data: tasks,
  })
})

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await findOwnedTaskOrThrow(getTaskId(req), req.userId)

  res.status(200).json({
    success: true,
    data: task,
  })
})

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as TaskInput

  // Ownership is enforced in the filter: user A cannot update user B's task.
  const task = await Task.findOneAndUpdate(
    { _id: getTaskId(req), user: req.userId },
    body,
    { new: true, runValidators: true },
  )

  if (!task) {
    throw new AppError('Task not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Task updated',
    data: task,
  })
})

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  // Ownership is enforced in the filter: user A cannot delete user B's task.
  const task = await Task.findOneAndDelete({
    _id: getTaskId(req),
    user: req.userId,
  })

  if (!task) {
    throw new AppError('Task not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted',
    data: { id: String(task._id) },
  })
})
