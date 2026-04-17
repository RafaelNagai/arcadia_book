import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import supabasePlugin from './plugins/supabase.js'
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import corsPlugin from './plugins/cors.js'
import { registerRoutes } from './routes/index.js'

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  await fastify.register(corsPlugin)
  await fastify.register(supabasePlugin)
  await fastify.register(prismaPlugin)
  await fastify.register(authPlugin)
  await fastify.register(multipart, {
    limits: { fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024 },
  })

  fastify.setErrorHandler(errorHandler)

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await registerRoutes(fastify)

  return fastify
}
