import { env } from './config/env'
import { connectDatabase } from './config/db'
import { app } from './app'

async function startServer(): Promise<void> {
  await connectDatabase()

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`API listening on port ${env.port}`)
  })
}

void startServer().catch((error: unknown) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
