import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { errorMiddleware } from './middlewares/error.middleware'
import { notFoundMiddleware } from './middlewares/notFound.middleware'
import { authRouter } from './routes/auth.routes'
import { taskRouter } from './routes/task.routes'

export const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '16kb' }))
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'TaskFlow API is running' })
})

app.use('/api/auth', authRouter)
app.use('/api/tasks', taskRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)
