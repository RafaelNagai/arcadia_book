import type { FastifyInstance } from 'fastify'
import { MapsService } from '../services/maps.service.js'
import {
  CreateMapSchema,
  UpdateMapSchema,
  CreateMapLayerSchema,
  UpdateMapLayerSchema,
  CreateMapTokenSchema,
  UpdateMapTokenSchema,
  UpdateFogSchema,
  AddFogPatchesSchema,
  CreateMapWallSchema,
} from '../schemas/map.schema.js'
import { UUIDParamSchema } from '../schemas/shared.schema.js'
import { z } from 'zod'

const MapAndLayerParamSchema = UUIDParamSchema.extend({ layerId: z.string().uuid() })
const MapAndTokenParamSchema = UUIDParamSchema.extend({ tokenId: z.string().uuid() })

export async function mapsController(fastify: FastifyInstance) {
  const svc = new MapsService(fastify.prisma)

  // ── Maps ────────────────────────────────────────────────────────────────

  // List maps of a campaign
  fastify.get('/', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId } = req.params as { campaignId: string }
    const maps = await svc.list(campaignId, req.user!.id)
    return reply.send({ maps })
  })

  // Get active map (with tokens)
  fastify.get('/active', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId } = req.params as { campaignId: string }
    const map = await svc.getActive(campaignId, req.user!.id)
    return reply.send({ map })
  })

  // Create map
  fastify.post('/', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId } = req.params as { campaignId: string }
    const input = CreateMapSchema.parse(req.body)
    const map = await svc.create(campaignId, req.user!.id, input)
    return reply.status(201).send({ map })
  })

  // Update map
  fastify.put('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = UpdateMapSchema.parse(req.body)
    const map = await svc.update(id, req.user!.id, input)
    return reply.send({ map })
  })

  // Delete map
  fastify.delete('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    await svc.delete(id, req.user!.id)
    return reply.status(204).send()
  })

  // Activate map
  fastify.patch('/:id/activate', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId } = req.params as { campaignId: string }
    const { id } = UUIDParamSchema.parse(req.params)
    const map = await svc.activate(campaignId, id, req.user!.id)
    return reply.send({ map })
  })

  // Deactivate map
  fastify.patch('/:id/deactivate', async (req, reply) => {
    await fastify.authenticate(req)
    const { campaignId } = req.params as { campaignId: string }
    const { id } = UUIDParamSchema.parse(req.params)
    const map = await svc.deactivate(campaignId, id, req.user!.id)
    return reply.send({ map })
  })

  // ── Layers ───────────────────────────────────────────────────────────────

  // Create layer
  fastify.post('/:id/layers', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = CreateMapLayerSchema.parse(req.body)
    const layer = await svc.createLayer(id, req.user!.id, input)
    return reply.status(201).send({ layer })
  })

  // Update layer
  fastify.put('/:id/layers/:layerId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, layerId } = MapAndLayerParamSchema.parse(req.params)
    const input = UpdateMapLayerSchema.parse(req.body)
    const layer = await svc.updateLayer(id, layerId, req.user!.id, input)
    return reply.send({ layer })
  })

  // Delete layer
  fastify.delete('/:id/layers/:layerId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, layerId } = MapAndLayerParamSchema.parse(req.params)
    await svc.deleteLayer(id, layerId, req.user!.id)
    return reply.status(204).send()
  })

  // Activate layer
  fastify.patch('/:id/layers/:layerId/activate', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, layerId } = MapAndLayerParamSchema.parse(req.params)
    const layer = await svc.activateLayer(id, layerId, req.user!.id)
    return reply.send({ layer })
  })

  // ── Tokens ───────────────────────────────────────────────────────────────

  // List tokens
  fastify.get('/:id/tokens', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const tokens = await svc.listTokens(id, req.user!.id)
    return reply.send({ tokens })
  })

  // Create token
  fastify.post('/:id/tokens', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = CreateMapTokenSchema.parse(req.body)
    const token = await svc.createToken(id, req.user!.id, input)
    return reply.status(201).send({ token })
  })

  // Update token (position, layer, visibility)
  fastify.patch('/:id/tokens/:tokenId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, tokenId } = MapAndTokenParamSchema.parse(req.params)
    const input = UpdateMapTokenSchema.parse(req.body)
    const token = await svc.updateToken(id, tokenId, req.user!.id, input)
    return reply.send({ token })
  })

  // Delete token
  fastify.delete('/:id/tokens/:tokenId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, tokenId } = MapAndTokenParamSchema.parse(req.params)
    await svc.deleteToken(id, tokenId, req.user!.id)
    return reply.status(204).send()
  })

  // ── Fog ──────────────────────────────────────────────────────────────────

  // Toggle fog on/off
  fastify.patch('/:id/fog', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = UpdateFogSchema.parse(req.body)
    const map = await svc.updateFog(id, req.user!.id, input)
    return reply.send({ map })
  })

  // Add revealed patches to a layer
  fastify.post('/:id/layers/:layerId/fog/patches', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, layerId } = MapAndLayerParamSchema.parse(req.params)
    const input = AddFogPatchesSchema.parse(req.body)
    const layer = await svc.addFogPatches(id, layerId, req.user!.id, input)
    return reply.send({ layer })
  })

  // Reset fog for a layer
  fastify.delete('/:id/layers/:layerId/fog/patches', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, layerId } = MapAndLayerParamSchema.parse(req.params)
    const layer = await svc.resetFog(id, layerId, req.user!.id)
    return reply.send({ layer })
  })

  // ── Walls ──────────────────────────────────────────────────────────────────

  fastify.post('/:id/layers/:layerId/walls', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, layerId } = MapAndLayerParamSchema.parse(req.params)
    const input = CreateMapWallSchema.parse(req.body)
    const wall = await svc.createWall(id, layerId, req.user!.id, input.points)
    return reply.status(201).send({ wall })
  })

  fastify.delete('/:id/layers/:layerId/walls/:wallId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { wallId } = req.params as { wallId: string }
    await svc.deleteWall(id, wallId, req.user!.id)
    return reply.status(204).send()
  })
}
