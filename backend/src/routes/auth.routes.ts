import { Router } from 'express'
import { getMe, login, register } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { loginBodySchema, registerBodySchema } from '../utils/auth.schema'

export const authRouter = Router()

authRouter.post('/register', validate({ body: registerBodySchema }), register)
authRouter.post('/login', validate({ body: loginBodySchema }), login)
authRouter.get('/me', authMiddleware, getMe)
