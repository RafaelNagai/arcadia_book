import type { FastifyInstance } from 'fastify'
import { ShipsService } from '../services/ships.service.js'
import { ShipStateService } from '../services/ship-state.service.js'
import {
  CreateShipSchema,
  CurrentHpSchema,
  JoinShipSchema,
  LeaveShipSchema,
  MoralActionSchema,
  UpdateShipSchema,
  VisibilitySchema,
} from '../schemas/ship.schema.js'
import { UUIDParamSchema } from '../schemas/shared.schema.js'

export async function shipsController(fastify: FastifyInstance) {
  const svc = new ShipsService(fastify.prisma, fastify.supabase)
  const stateSvc = new ShipStateService(fastify.prisma)

  fastify.get('/', async (req, reply) => {
    await fastify.authenticate(req)
    const ships = await svc.list(req.user!.id)
    return reply.send({ ships })
  })

  fastify.get('/public', async (req, reply) => {
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const ships = await svc.listPublic(userId)
    return reply.send({ ships })
  })

  fastify.post('/', async (req, reply) => {
    await fastify.authenticate(req)
    const input = CreateShipSchema.parse(req.body)
    const ship = await svc.create(req.user!.id, input)
    return reply.status(201).send({ ship })
  })

  fastify.post('/join', async (req, reply) => {
    await fastify.authenticate(req)
    const { code, character_id } = JoinShipSchema.parse(req.body)
    const membership = await svc.join(code, character_id, req.user!.id)
    return reply.status(201).send({ membership })
  })

  fastify.get('/:id', async (req, reply) => {
    const { id } = UUIDParamSchema.parse(req.params)
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const ship = await svc.get(id, userId)
    return reply.send({ ship })
  })

  fastify.put('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = UpdateShipSchema.parse(req.body)
    const ship = await svc.update(id, req.user!.id, input)
    return reply.send({ ship })
  })

  fastify.patch('/:id/visibility', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { is_public } = VisibilitySchema.parse(req.body)
    const ship = await svc.setVisibility(id, req.user!.id, is_public)
    return reply.send({ ship })
  })

  fastify.patch('/:id/current-hp', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { current_hp } = CurrentHpSchema.parse(req.body)
    const ship = await svc.updateCurrentHp(id, req.user!.id, current_hp)
    return reply.send({ ship })
  })

  fastify.post('/:id/regenerate-code', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const crewCode = await svc.regenerateCode(id, req.user!.id)
    return reply.send({ crewCode })
  })

  fastify.post('/:id/leave', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { character_id } = LeaveShipSchema.parse(req.body)
    await svc.leave(id, character_id, req.user!.id)
    return reply.status(204).send()
  })

  fastify.get('/character/:charId/membership', async (req, reply) => {
    await fastify.authenticate(req)
    const charId = (req.params as { charId: string }).charId
    const membership = await svc.getMembership(charId)
    return reply.send({ membership })
  })

  fastify.get('/:id/state', async (req, reply) => {
    const { id } = UUIDParamSchema.parse(req.params)
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const state = await stateSvc.get(id, userId)
    return reply.send({ state })
  })

  fastify.patch('/:id/state/moral', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const action = MoralActionSchema.parse(req.body)
    const state = await stateSvc.mutateMoral(id, req.user!.id, action)
    return reply.send({ state })
  })

  fastify.delete('/:id', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    await svc.delete(id, req.user!.id)
    return reply.status(204).send()
  })
}
