import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'
import type { JwtPayload } from './types'
import { AppError } from './AppError'

export function signAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  }

  return jwt.sign({ userId } satisfies JwtPayload, env.jwtSecret, options)
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret)

    if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
      throw new AppError('Invalid token', 401)
    }

    return { userId: decoded.userId }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('Invalid or expired token', 401)
  }
}
