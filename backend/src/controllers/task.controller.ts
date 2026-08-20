import type { Request, Response } from 'express'
import { Task } from '../models/Task'
import { AppError } from '../utils/AppError'
import { asyncHandler } from '../utils/asyncHandler'
import { escapeRegex } from '../utils/escapeRegex'
import { MAX_TASK_ATTACHMENTS } from '../utils/attachment.constants'
import {
  destroyCloudinaryFile,
  uploadBufferToCloudinary,
} from '../utils/cloudinary'
import type { TaskPriority, TaskStatus } from '../utils/types'

function getParam(req: Request, name: string): string {
  const value = req.params[name]
  return Array.isArray(value) ? value[0] : value
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

async function removeCloudinaryAttachments(
  attachments: Array<{ publicId: string; resourceType?: string }>,
): Promise<void> {
  await Promise.allSettled(
    attachments.map((attachment) =>
      destroyCloudinaryFile(attachment.publicId, attachment.resourceType ?? 'image'),
    ),
  )
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
  const { search, status, priority, page, limit } = req.query as unknown as {
    search?: string
    status?: TaskStatus
    priority?: TaskPriority
    page: number
    limit: number
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

  const skip = (page - 1) * limit
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ dueDate: 1 }).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1)

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  })
})

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await findOwnedTaskOrThrow(getParam(req, 'id'), req.userId)

  res.status(200).json({
    success: true,
    data: task,
  })
})

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as TaskInput

  // Ownership is enforced in the filter: user A cannot update user B's task.
  const task = await Task.findOneAndUpdate(
    { _id: getParam(req, 'id'), user: req.userId },
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
    _id: getParam(req, 'id'),
    user: req.userId,
  })

  if (!task) {
    throw new AppError('Task not found', 404)
  }

  await removeCloudinaryAttachments(task.attachments ?? [])

  res.status(200).json({
    success: true,
    message: 'Task deleted',
    data: { id: String(task._id) },
  })
})

export const addTaskAttachments = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new AppError('At least one file is required', 400)
  }

  const task = await findOwnedTaskOrThrow(getParam(req, 'id'), req.userId)
  const currentCount = task.attachments?.length ?? 0

  if (currentCount + files.length > MAX_TASK_ATTACHMENTS) {
    throw new AppError(`A task can have at most ${MAX_TASK_ATTACHMENTS} attachments`, 400)
  }

  if (!task.attachments) {
    task.set('attachments', [])
  }

  const uploaded: Array<{
    publicId: string
    url: string
    originalName: string
    mimeType: string
    size: number
    resourceType: string
  }> = []

  try {
    for (const file of files) {
      const result = await uploadBufferToCloudinary(file)
      const attachment = {
        publicId: result.publicId,
        url: result.url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        resourceType: result.resourceType,
      }
      uploaded.push(attachment)
      task.attachments.push(attachment)
    }
  } catch (error) {
    await removeCloudinaryAttachments(uploaded)
    throw error
  }

  await task.save()

  res.status(201).json({
    success: true,
    message: files.length > 1 ? 'Files uploaded' : 'File uploaded',
    data: task,
  })
})

export const deleteTaskAttachment = asyncHandler(async (req: Request, res: Response) => {
  const task = await findOwnedTaskOrThrow(getParam(req, 'id'), req.userId)
  const attachmentId = getParam(req, 'attachmentId')
  const attachment = (task.attachments ?? []).find(
    (item) => String(item._id) === attachmentId,
  )

  if (!attachment) {
    throw new AppError('Attachment not found', 404)
  }

  await destroyCloudinaryFile(attachment.publicId, attachment.resourceType)
  task.attachments.pull(attachment._id)
  await task.save()

  res.status(200).json({
    success: true,
    message: 'Attachment deleted',
    data: task,
  })
})
