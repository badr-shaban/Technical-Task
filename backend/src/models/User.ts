import bcrypt from 'bcryptjs'
import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.password
        return ret
      },
    },
  },
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return
  }

  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = function comparePassword(
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId
  comparePassword(candidate: string): Promise<boolean>
}

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', userSchema)
