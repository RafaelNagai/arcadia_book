import type { FastifyInstance } from 'fastify'
import { authController } from '../controllers/auth.controller.js'
import { charactersController } from '../controllers/characters.controller.js'
import { inventoryController } from '../controllers/inventory.controller.js'
import { stateController } from '../controllers/state.controller.js'
import { uploadController } from '../controllers/upload.controller.js'
import { campaignsController } from '../controllers/campaigns.controller.js'
import { mapsController } from '../controllers/maps.controller.js'

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.register(authController, { prefix: '/api/v1/auth' })
  fastify.register(charactersController, { prefix: '/api/v1/characters' })
  fastify.register(
    async (f) => {
      f.register(inventoryController, { prefix: '/:id/inventory' })
      f.register(stateController, { prefix: '/:id/state' })
    },
    { prefix: '/api/v1/characters' },
  )
  fastify.register(uploadController, { prefix: '/api/v1/upload' })
  fastify.register(campaignsController, { prefix: '/api/v1/campaigns' })
  fastify.register(
    async (f) => {
      f.register(mapsController, { prefix: '/:campaignId/maps' })
    },
    { prefix: '/api/v1/campaigns' },
  )
}
