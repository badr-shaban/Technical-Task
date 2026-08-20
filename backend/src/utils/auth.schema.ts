import { z } from 'zod'

export const registerBodySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/\d/, 'Password must include a number'),
})

export const loginBodySchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
