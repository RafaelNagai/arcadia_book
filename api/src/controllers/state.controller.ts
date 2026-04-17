import type { FastifyInstance } from 'fastify'
import { StateService } from '../services/state.service.js'
import {
  AppendDiceLogSchema,
  DefenseModifiersSchema,
  PeChecksSchema,
  SkillModifiersSchema,
} from '../schemas/state.schema.js'
import { UUIDParamSchema } from '../schemas/shared.schema.js'

export async function stateController(fastify: FastifyInstance) {
  const svc = new StateService(fastify.prisma)

  fastify.get('/', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const state = await svc.get(id, req.user!.id)
    return reply.send({ state })
  })

  fastify.patch('/pe-checks', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { pe_checks } = PeChecksSchema.parse(req.body)
    const state = await svc.updatePeChecks(id, req.user!.id, pe_checks)
    return reply.send({ state })
  })

  fastify.patch('/skill-modifiers', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { skill_modifiers } = SkillModifiersSchema.parse(req.body)
    const state = await svc.updateSkillModifiers(id, req.user!.id, skill_modifiers)
    return reply.send({ state })
  })

  fastify.patch('/defense-modifiers', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { defense_modifiers } = DefenseModifiersSchema.parse(req.body)
    const state = await svc.updateDefenseModifiers(id, req.user!.id, defense_modifiers)
    return reply.send({ state })
  })

  fastify.post('/dice-log', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { entry } = AppendDiceLogSchema.parse(req.body)
    const state = await svc.appendDiceLog(id, req.user!.id, entry)
    return reply.send({ state })
  })

  fastify.delete('/dice-log', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const state = await svc.clearDiceLog(id, req.user!.id)
    return reply.send({ state })
  })
}
