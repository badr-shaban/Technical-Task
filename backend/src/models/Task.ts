import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/types'

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title is too long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be To Do, In Progress, or Done',
      },
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.userId = String(ret.user)
        delete ret._id
        return ret
      },
    },
  },
)

taskSchema.index({ user: 1, title: 1 })

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Task: Model<TaskDocument> =
  mongoose.models.Task ?? mongoose.model<TaskDocument>('Task', taskSchema)
