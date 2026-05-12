import type { FastifyInstance } from 'fastify'
import { CreaturesService } from '../services/creatures.service.js'
import { UploadService } from '../services/upload.service.js'
import { ValidationError } from '../middleware/error-handler.js'
import {
  CreateCustomCreatureSchema,
  UpdateCustomCreatureSchema,
  VisibilitySchema,
} from '../schemas/creature.schema.js'
import { UUIDParamSchema } from '../schemas/shared.schema.js'
import { z } from 'zod'

const DeleteImageSchema = z.object({ path: z.string().min(1) })

export async function creaturesController(fastify: FastifyInstance) {
  const svc = new CreaturesService(fastify.prisma, fastify.supabase)
  const uploadSvc = new UploadService(fastify.supabase)

  fastify.get('/', async (req, reply) => {
    await fastify.authenticate(req)
    const creatures = await svc.list(req.user!.id)
    return reply.send({ creatures })
  })

  fastify.get('/public', async (req, reply) => {
    const creatures = await svc.listPublic()
    return reply.send({ creatures })
  })

  fastify.post('/', async (req, reply) => {
    await fastify.authenticate(req)
    const input = CreateCustomCreatureSchema.parse(req.body)
    const creature = await svc.create(req.user!.id, input)
    return reply.status(201).send({ creature })
  })

  fastify.get('/:id', async (req, reply) => {
    const { id } = UUIDParamSchema.parse(req.params)
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const creature = await svc.get(id, userId)
    return reply.send({ creature })
  })

  fastify.put('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = UpdateCustomCreatureSchema.parse(req.body)
    const creature = await svc.update(id, req.user!.id, input)
    return reply.send({ creature })
  })

  fastify.patch('/:id/visibility', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { is_public } = VisibilitySchema.parse(req.body)
    const creature = await svc.setVisibility(id, req.user!.id, is_public)
    return reply.send({ creature })
  })

  fastify.delete('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    await svc.delete(id, req.user!.id)
    return reply.status(204).send()
  })

  fastify.post('/upload-image', async (req, reply) => {
    await fastify.authenticate(req)

    const data = await req.file()
    if (!data) throw new ValidationError('Nenhum arquivo enviado')

    const creatureIdField = data.fields.creatureId as { value: string } | undefined
    const creatureId = creatureIdField?.value
    if (!creatureId) throw new ValidationError('creatureId é obrigatório')

    const buffer = await data.toBuffer()
    const url = await uploadSvc.uploadCreatureImage(
      req.user!.id,
      creatureId,
      buffer,
      data.mimetype,
      data.filename,
    )

    return reply.status(201).send({ url })
  })
}
