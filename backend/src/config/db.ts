import dns from 'node:dns'
import mongoose from 'mongoose'
import { env } from './env'

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true)

  // mongodb+srv:// needs DNS SRV records. Some Windows/ISP resolvers refuse those
  // queries (querySrv ECONNREFUSED). Google/Cloudflare DNS handles them reliably.
  if (env.mongoUri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
  }

  await mongoose.connect(env.mongoUri)

  const host = mongoose.connection.host ?? 'unknown'
  const dbName = mongoose.connection.name ?? 'unknown'
  console.log(`MongoDB connected (${host}/${dbName})`)
}
