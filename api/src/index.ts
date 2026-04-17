import { buildApp } from './app.js'
import { env } from './config/env.js'

const fastify = await buildApp()

try {
  await fastify.listen({ port: env.PORT, host: env.HOST })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
