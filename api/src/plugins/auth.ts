import fp from 'fastify-plugin'
import { UnauthorizedError } from '../middleware/error-handler.js'

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async function (request: Parameters<typeof fastify.authenticate>[0]) {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError()
    const token = header.slice(7)
    const { data, error } = await fastify.supabase.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedError()
    request.user = data.user
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: import('fastify').FastifyRequest) => Promise<void>
  }
}
