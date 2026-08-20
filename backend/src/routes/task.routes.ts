import { Router } from 'express'
import {
  addTaskAttachments,
  createTask,
  deleteTask,
  deleteTaskAttachment,
  getTaskById,
  getTasks,
  updateTask,
} from '../controllers/task.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { taskAttachmentUpload } from '../middlewares/upload.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskAttachmentParamsSchema,
  taskIdParamsSchema,
  updateTaskBodySchema,
} from '../utils/task.schema'

export const taskRouter = Router()

taskRouter.use(authMiddleware)

taskRouter.post('/', validate({ body: createTaskBodySchema }), createTask)
taskRouter.get('/', validate({ query: listTasksQuerySchema }), getTasks)
taskRouter.post(
  '/:id/attachments',
  validate({ params: taskIdParamsSchema }),
  taskAttachmentUpload,
  addTaskAttachments,
)
taskRouter.delete(
  '/:id/attachments/:attachmentId',
  validate({ params: taskAttachmentParamsSchema }),
  deleteTaskAttachment,
)
taskRouter.get('/:id', validate({ params: taskIdParamsSchema }), getTaskById)
taskRouter.put(
  '/:id',
  validate({ params: taskIdParamsSchema, body: updateTaskBodySchema }),
  updateTask,
)
taskRouter.delete('/:id', validate({ params: taskIdParamsSchema }), deleteTask)
