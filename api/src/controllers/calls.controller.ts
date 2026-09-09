import type { FastifyInstance } from 'fastify'
import { CallsService } from '../services/calls.service.js'
import { NegotiateTracksSchema, RenegotiateSchema } from '../schemas/calls.schema.js'

export async function callsController(fastify: FastifyInstance) {
  const svc = new CallsService(fastify.prisma)

  // Create a Cloudflare Realtime session for the current user in this campaign
  fastify.post('/session', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId } = req.params as { campaignId: string }
    const session = await svc.createSession(campaignId, req.user!.id)
    return reply.status(201).send(session)
  })

  // Push or pull tracks on a session (SDP offer/answer negotiation)
  fastify.post('/session/:sessionId/tracks', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId, sessionId } = req.params as { campaignId: string; sessionId: string }
    const input = NegotiateTracksSchema.parse(req.body)
    const result = await svc.negotiateTracks(campaignId, sessionId, req.user!.id, input)
    return reply.send(result)
  })

  // Complete a renegotiation requested by a previous tracks/new call
  fastify.put('/session/:sessionId/renegotiate', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId, sessionId } = req.params as { campaignId: string; sessionId: string }
    const input = RenegotiateSchema.parse(req.body)
    const result = await svc.renegotiate(campaignId, sessionId, req.user!.id, input)
    return reply.send(result)
  })
}
