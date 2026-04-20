import type { FastifyInstance } from 'fastify'
import { UploadService } from '../services/upload.service.js'
import { ValidationError } from '../middleware/error-handler.js'
import { z } from 'zod'

const DeleteImageSchema = z.object({
  path: z.string().min(1),
})

export async function uploadController(fastify: FastifyInstance) {
  const svc = new UploadService(fastify.supabase)

  fastify.post('/character-image', async (req, reply) => {
    await fastify.authenticate(req)

    const data = await req.file()
    if (!data) throw new ValidationError('Nenhum arquivo enviado')

    const characterId = (data.fields.characterId as { value: string } | undefined)?.value
    if (!characterId) throw new ValidationError('characterId é obrigatório')

    const buffer = await data.toBuffer()
    const url = await svc.uploadCharacterImage(
      req.user!.id,
      characterId,
      buffer,
      data.mimetype,
      data.filename,
    )

    return reply.status(201).send({ url })
  })

  fastify.delete('/character-image', async (req, reply) => {
    await fastify.authenticate(req)
    const { path } = DeleteImageSchema.parse(req.body)
    await svc.deleteCharacterImage(path)
    return reply.status(204).send()
  })

  fastify.post('/map-layer', async (req, reply) => {
    await fastify.authenticate(req)

    const data = await req.file()
    if (!data) throw new ValidationError('Nenhum arquivo enviado')

    const mapIdField = data.fields.mapId as any
    const mapId = mapIdField?.value

    // Validação
    if (typeof mapId !== 'string' || mapId.trim() === '') {
      throw new ValidationError('mapId é obrigatório e deve ser um texto')
    }

    const buffer = await data.toBuffer()
    const url = await svc.uploadMapLayerImage(
      req.user!.id,
      mapId,
      buffer,
      data.mimetype,
      data.filename,
    )

    return reply.status(201).send({ url })
  })
}
