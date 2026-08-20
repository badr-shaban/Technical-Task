import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError'
import { verifyAccessToken } from '../utils/jwt'

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  if (!token) {
    next(new AppError('Authentication required', 401))
    return
  }

  try {
    const payload = verifyAccessToken(token)
    // Attach the authenticated user's id so controllers can scope queries by owner.
    req.userId = payload.userId
    next()
  } catch (error) {
    next(error)
  }
}
