import type { FastifyInstance } from 'fastify'
import { CampaignsService } from '../services/campaigns.service.js'
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  JoinCampaignSchema,
  AddNpcSchema,
} from '../schemas/campaign.schema.js'
import { UUIDParamSchema } from '../schemas/shared.schema.js'

const CampaignAndCharParamSchema = UUIDParamSchema.extend({
  charId: UUIDParamSchema.shape.id,
})

export async function campaignsController(fastify: FastifyInstance) {
  const svc = new CampaignsService(fastify.prisma, fastify.supabase)

  // List user campaigns
  fastify.get('/', async (req, reply) => {
    await fastify.authenticate(req)
    const campaigns = await svc.list(req.user!.id)
    return reply.send({ campaigns })
  })

  // Create campaign
  fastify.post('/', async (req, reply) => {
    await fastify.authenticate(req)
    const input = CreateCampaignSchema.parse(req.body)
    const campaign = await svc.create(req.user!.id, input)
    return reply.status(201).send({ campaign })
  })

  // Join campaign with invite code
  fastify.post('/join', async (req, reply) => {
    await fastify.authenticate(req)
    const { code, character_id } = JoinCampaignSchema.parse(req.body)
    const membership = await svc.join(code, character_id, req.user!.id)
    return reply.status(201).send({ membership })
  })

  // Get campaign detail
  fastify.get('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const campaign = await svc.get(id, req.user!.id)
    return reply.send({ campaign })
  })

  // Update campaign (GM only)
  fastify.put('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = UpdateCampaignSchema.parse(req.body)
    const campaign = await svc.update(id, req.user!.id, input)
    return reply.send({ campaign })
  })

  // Delete campaign (GM only)
  fastify.delete('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    await svc.delete(id, req.user!.id)
    return reply.status(204).send()
  })

  // Regenerate invite code (GM only)
  fastify.post('/:id/invite-code', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const inviteCode = await svc.regenerateInviteCode(id, req.user!.id)
    return reply.send({ inviteCode })
  })

  // Remove character / leave campaign
  fastify.delete('/:id/characters/:charId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, charId } = CampaignAndCharParamSchema.parse(req.params)
    await svc.leave(id, charId, req.user!.id)
    return reply.status(204).send()
  })

  // Add NPC (GM only)
  fastify.post('/:id/npcs', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { character_id } = AddNpcSchema.parse(req.body)
    const membership = await svc.addNpc(id, character_id, req.user!.id)
    return reply.status(201).send({ membership })
  })

  // Remove NPC (GM only)
  fastify.delete('/:id/npcs/:charId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, charId } = CampaignAndCharParamSchema.parse(req.params)
    await svc.leave(id, charId, req.user!.id)
    return reply.status(204).send()
  })

  // Get character campaign membership
  fastify.get('/character/:charId/membership', async (req, reply) => {
    await fastify.authenticate(req)
    const charId = (req.params as { charId: string }).charId
    const membership = await svc.getMembership(charId)
    return reply.send({ membership })
  })
}
