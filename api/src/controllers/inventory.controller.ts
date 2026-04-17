import type { FastifyInstance } from 'fastify'
import { InventoryService } from '../services/inventory.service.js'
import {
  CreateBagSchema,
  CreateItemSchema,
  ReorderItemsSchema,
  UpdateBagSchema,
  UpdateItemSchema,
} from '../schemas/inventory.schema.js'
import { UUIDBagParamSchema, UUIDItemParamSchema, UUIDParamSchema } from '../schemas/shared.schema.js'

export async function inventoryController(fastify: FastifyInstance) {
  const svc = new InventoryService(fastify.prisma)

  fastify.get('/', async (req, reply) => {
    const { id } = UUIDParamSchema.parse(req.params)
    const token = (req.headers.authorization ?? '').slice(7)
    let userId: string | undefined
    if (token) {
      const { data } = await fastify.supabase.auth.getUser(token)
      userId = data.user?.id
    }
    const inventory = await svc.getInventory(id, userId)
    return reply.send(inventory)
  })

  fastify.post('/items', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = CreateItemSchema.parse(req.body)
    const item = await svc.createItem(id, req.user!.id, input)
    return reply.status(201).send({ item })
  })

  fastify.put('/items/:itemId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, itemId } = UUIDItemParamSchema.parse(req.params)
    const input = UpdateItemSchema.parse(req.body)
    const item = await svc.updateItem(id, itemId, req.user!.id, input)
    return reply.send({ item })
  })

  fastify.delete('/items/:itemId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, itemId } = UUIDItemParamSchema.parse(req.params)
    await svc.deleteItem(id, itemId, req.user!.id)
    return reply.status(204).send()
  })

  fastify.post('/items/reorder', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const { items } = ReorderItemsSchema.parse(req.body)
    await svc.reorderItems(id, req.user!.id, items)
    return reply.status(204).send()
  })

  fastify.post('/bags', async (req, reply) => {
    await fastify.authenticate(req)
    const { id } = UUIDParamSchema.parse(req.params)
    const input = CreateBagSchema.parse(req.body)
    const bag = await svc.createBag(id, req.user!.id, input)
    return reply.status(201).send({ bag })
  })

  fastify.put('/bags/:bagId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, bagId } = UUIDBagParamSchema.parse(req.params)
    const input = UpdateBagSchema.parse(req.body)
    const bag = await svc.updateBag(id, bagId, req.user!.id, input)
    return reply.send({ bag })
  })

  fastify.delete('/bags/:bagId', async (req, reply) => {
    await fastify.authenticate(req)
    const { id, bagId } = UUIDBagParamSchema.parse(req.params)
    await svc.deleteBag(id, bagId, req.user!.id)
    return reply.status(204).send()
  })
}
