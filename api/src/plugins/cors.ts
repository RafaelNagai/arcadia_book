import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

export default fp(async (fastify) => {
  fastify.register(fastifyCors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
})
