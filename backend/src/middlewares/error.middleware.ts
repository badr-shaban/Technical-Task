import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import { env } from '../config/env'
import { AppError } from '../utils/AppError'

function getDuplicateFieldMessage(error: { keyValue?: Record<string, unknown> }): string {
  const field = error.keyValue ? Object.keys(error.keyValue)[0] : undefined
  if (field === 'email') {
    return 'An account with this email already exists'
  }
  return field ? `${field} already exists` : 'Duplicate value'
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error)
    return
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    })
    return
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: error.issues.map((issue) => issue.message).join(', '),
    })
    return
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ')

    res.status(400).json({
      success: false,
      message,
    })
    return
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    })
    return
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: getDuplicateFieldMessage(error as { keyValue?: Record<string, unknown> }),
    })
    return
  }

  const message =
    error instanceof Error && env.nodeEnv !== 'production'
      ? error.message
      : 'Internal server error'

  console.error(error)
  res.status(500).json({
    success: false,
    message,
  })
}
