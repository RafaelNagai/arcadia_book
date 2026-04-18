import type { FastifyInstance } from 'fastify'
import { CharactersService } from '../services/characters.service.js'
import {
  CreateCharacterSchema,
  CurrentValuesSchema,
  UpdateCharacterSchema,
  VisibilitySchema,
  type UpdateCharacterInput,
} from '../schemas/character.schema.js'
import { UUIDParamSchema } from '../schemas/shared.schema.js'

export async function charactersController(fastify: FastifyInstance) {
  const svc = new CharactersService(fastify.prisma, fastify.supabase)

  fastify.get('/', async (req, reply) => {
    await fastify.authenticate(req)
    const chars = await svc.list(req.user!.id)
    return reply.send({ characters: chars })
  })

  fastify.get('/public', async (req, reply) => {
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const chars = await svc.listPublic(userId)
    return reply.send({ characters: chars })
  })

  fastify.post('/', async (req, reply) => {
    await fastify.authenticate(req)
    const input = CreateCharacterSchema.parse(req.body)
    const char = await svc.create(req.user!.id, input)
    return reply.status(201).send({ character: char })
  })

  fastify.get('/:id', async (req, reply) => {
    const { id } = UUIDParamSchema.parse(req.params)
    // auth is optional for public characters
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const char = await svc.get(id, userId)
    return reply.send({ character: char })
  })

  fastify.put('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = UpdateCharacterSchema.parse(req.body) as UpdateCharacterInput
    const char = await svc.update(id, req.user!.id, input as Record<string, unknown>)
    return reply.send({ character: char })
  })

  fastify.patch('/:id/current-values', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const values = CurrentValuesSchema.parse(req.body)
    const char = await svc.updateCurrentValues(id, req.user!.id, values)
    return reply.send({ character: char })
  })

  fastify.patch('/:id/visibility', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { is_public } = VisibilitySchema.parse(req.body)
    const char = await svc.setVisibility(id, req.user!.id, is_public)
    return reply.send({ character: char })
  })

  fastify.delete('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    await svc.delete(id, req.user!.id)
    return reply.status(204).send()
  })
}
