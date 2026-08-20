import type { Request, Response } from 'express'
import { User } from '../models/User'
import { AppError } from '../utils/AppError'
import { asyncHandler } from '../utils/asyncHandler'
import { signAccessToken } from '../utils/jwt'
import type { AuthUser } from '../utils/types'

function toAuthUser(user: { _id: unknown; name: string; email: string }): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  }
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string
    email: string
    password: string
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409)
  }

  const user = await User.create({ name, email, password })
  const token = signAccessToken(String(user._id))

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: {
      token,
      user: toAuthUser(user),
    },
  })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401)
  }

  const token = signAccessToken(String(user._id))

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      token,
      user: toAuthUser(user),
    },
  })
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId)
  if (!user) {
    throw new AppError('User not found', 401)
  }

  res.status(200).json({
    success: true,
    data: toAuthUser(user),
  })
})
