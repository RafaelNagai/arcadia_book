import type { PrismaClient } from '../generated/prisma/client.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { MapsRepository } from '../repositories/maps.repository.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { UploadService } from './upload.service.js'
import type {
  CreateMapInput,
  UpdateMapInput,
  CreateMapLayerInput,
  UpdateMapLayerInput,
  CreateMapTokenInput,
  UpdateMapTokenInput,
  UpdateFogInput,
  AddFogPatchesInput,
  FogPatchInput,
} from '../schemas/map.schema.js'
import type { Prisma } from '../generated/prisma/client.js'

export class MapsService {
  private readonly repo: MapsRepository
  private readonly campaignsRepo: CampaignsRepository
  private readonly uploadSvc: UploadService

  constructor(db: PrismaClient, supabase: SupabaseClient) {
    this.repo = new MapsRepository(db)
    this.campaignsRepo = new CampaignsRepository(db)
    this.uploadSvc = new UploadService(supabase)
  }

  // ── Maps ──────────────────────────────────────────────────────────────────

  async list(campaignId: string, userId: string) {
    await this.assertCampaignAccess(campaignId, userId)
    return this.repo.listMaps(campaignId)
  }

  async getActive(campaignId: string, userId: string) {
    await this.assertCampaignAccess(campaignId, userId)
    return this.repo.findActiveMap(campaignId)
  }

  async create(campaignId: string, userId: string, input: CreateMapInput) {
    await this.assertGm(campaignId, userId)
    return this.repo.createMap(campaignId, {
      title: input.title,
      gridEnabled: input.grid_enabled,
      gridSize: input.grid_size,
      visionUnified: input.vision_unified,
      defaultVisionRadius: input.default_vision_radius,
    })
  }

  async update(mapId: string, userId: string, input: UpdateMapInput) {
    const map = await this.assertMapGm(mapId, userId)
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.grid_enabled !== undefined) patch.gridEnabled = input.grid_enabled
    if (input.grid_size !== undefined) patch.gridSize = input.grid_size
    if (input.vision_unified !== undefined) patch.visionUnified = input.vision_unified
    if (input.default_vision_radius !== undefined) patch.defaultVisionRadius = input.default_vision_radius
    return this.repo.updateMap(map.id, patch)
  }

  async delete(mapId: string, userId: string) {
    const map = await this.assertMapGm(mapId, userId)
    await this.repo.deleteMap(mapId)
    // Clean up all layer images from storage after DB deletion
    for (const layer of map.layers) {
      await this.uploadSvc.deleteImageByUrl(layer.imageUrl).catch(() => {})
    }
  }

  async activate(campaignId: string, mapId: string, userId: string) {
    await this.assertGm(campaignId, userId)
    const map = await this.repo.findMapById(mapId)
    if (!map || map.campaignId !== campaignId) throw new NotFoundError('Mapa não encontrado')
    return this.repo.activateMap(campaignId, mapId)
  }

  async deactivate(campaignId: string, mapId: string, userId: string) {
    await this.assertGm(campaignId, userId)
    const map = await this.repo.findMapById(mapId)
    if (!map || map.campaignId !== campaignId) throw new NotFoundError('Mapa não encontrado')
    return this.repo.deactivateMap(mapId)
  }

  // ── Layers ────────────────────────────────────────────────────────────────

  async createLayer(mapId: string, userId: string, input: CreateMapLayerInput) {
    await this.assertMapGm(mapId, userId)
    return this.repo.createLayer(mapId, {
      name: input.name,
      orderIndex: input.order_index,
      imageUrl: input.image_url,
    })
  }

  async updateLayer(mapId: string, layerId: string, userId: string, input: UpdateMapLayerInput) {
    await this.assertMapGm(mapId, userId)
    const layer = await this.repo.findLayerById(layerId)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.order_index !== undefined) patch.orderIndex = input.order_index
    return this.repo.updateLayer(layerId, patch)
  }

  async deleteLayer(mapId: string, layerId: string, userId: string) {
    await this.assertMapGm(mapId, userId)
    const layer = await this.repo.findLayerById(layerId)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    await this.repo.deleteLayer(layerId)
    await this.uploadSvc.deleteImageByUrl(layer.imageUrl).catch(() => {})
    return layer.imageUrl
  }

  async activateLayer(mapId: string, layerId: string, userId: string) {
    await this.assertMapGm(mapId, userId)
    const layer = await this.repo.findLayerById(layerId)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    return this.repo.activateLayer(mapId, layerId)
  }

  // ── Tokens ────────────────────────────────────────────────────────────────

  async listTokens(mapId: string, userId: string) {
    const map = await this.repo.findMapById(mapId)
    if (!map) throw new NotFoundError('Mapa não encontrado')
    await this.assertCampaignAccess(map.campaignId, userId)
    return this.repo.listTokens(mapId)
  }

  async createToken(mapId: string, userId: string, input: CreateMapTokenInput) {
    await this.assertMapGm(mapId, userId)
    const layer = await this.repo.findLayerById(input.layer_id)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    return this.repo.createToken({
      mapId,
      layerId: input.layer_id,
      characterId: input.character_id,
      x: input.x,
      y: input.y,
      visionRadius: input.vision_radius ?? null,
      isVisible: input.is_visible,
    })
  }

  async updateToken(mapId: string, tokenId: string, userId: string, input: UpdateMapTokenInput) {
    const map = await this.repo.findMapById(mapId)
    if (!map) throw new NotFoundError('Mapa não encontrado')
    const campaign = await this.assertCampaignAccess(map.campaignId, userId)
    const isGm = campaign.gmUserId === userId

    const token = await this.repo.findTokenById(tokenId)
    if (!token || token.mapId !== mapId) throw new NotFoundError('Token não encontrado')

    if (!isGm) {
      const ownsCharacter = campaign.characters.some(
        cc => cc.characterId === token.characterId && cc.character.userId === userId,
      )
      if (!ownsCharacter) throw new ForbiddenError()
      // Players may only reposition their own token
      if (input.layer_id !== undefined || input.vision_radius !== undefined ||
          input.is_visible !== undefined || input.size !== undefined) {
        throw new ForbiddenError()
      }
    }

    if (input.layer_id) {
      const layer = await this.repo.findLayerById(input.layer_id)
      if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    }
    const patch: Record<string, unknown> = {}
    if (input.layer_id !== undefined) patch.layerId = input.layer_id
    if (input.x !== undefined) patch.x = input.x
    if (input.y !== undefined) patch.y = input.y
    if (input.vision_radius !== undefined) patch.visionRadius = input.vision_radius
    if (input.is_visible !== undefined) patch.isVisible = input.is_visible
    if (input.size !== undefined) patch.size = input.size
    return this.repo.updateToken(tokenId, patch)
  }

  async deleteToken(mapId: string, tokenId: string, userId: string) {
    await this.assertMapGm(mapId, userId)
    const token = await this.repo.findTokenById(tokenId)
    if (!token || token.mapId !== mapId) throw new NotFoundError('Token não encontrado')
    await this.repo.deleteToken(tokenId)
  }

  // ── Fog ───────────────────────────────────────────────────────────────────

  async updateFog(mapId: string, userId: string, input: UpdateFogInput) {
    await this.assertMapGm(mapId, userId)
    return this.repo.updateFog(mapId, { fogEnabled: input.enabled })
  }

  async addFogPatches(mapId: string, layerId: string, userId: string, input: AddFogPatchesInput) {
    await this.assertMapMember(mapId, userId)
    const layer = await this.repo.findLayerById(layerId)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    const existing = (layer.fogRevealed as FogPatchInput[]) ?? []
    return this.repo.updateLayerFog(layerId, [...existing, ...input.patches])
  }

  async resetFog(mapId: string, layerId: string, userId: string) {
    await this.assertMapGm(mapId, userId)
    const layer = await this.repo.findLayerById(layerId)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    return this.repo.updateLayerFog(layerId, [])
  }

  // ── Walls ─────────────────────────────────────────────────────────────────

  async createWall(mapId: string, layerId: string, userId: string, points: Array<{ x: number; y: number }>) {
    await this.assertMapGm(mapId, userId)
    const layer = await this.repo.findLayerById(layerId)
    if (!layer || layer.mapId !== mapId) throw new NotFoundError('Layer não encontrada')
    return this.repo.createWall({ mapId, layerId, points: points as Prisma.InputJsonValue })
  }

  async deleteWall(mapId: string, wallId: string, userId: string) {
    await this.assertMapGm(mapId, userId)
    const wall = await this.repo.findWallById(wallId)
    if (!wall || wall.mapId !== mapId) throw new NotFoundError('Parede não encontrada')
    await this.repo.deleteWall(wallId)
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  private async assertCampaignAccess(campaignId: string, userId: string) {
    const campaign = await this.campaignsRepo.findById(campaignId)
    if (!campaign) throw new NotFoundError('Campanha não encontrada')
    const isGm = campaign.gmUserId === userId
    const isPlayer = campaign.characters.some(cc => cc.character.userId === userId)
    if (!isGm && !isPlayer) throw new ForbiddenError()
    return campaign
  }

  private async assertGm(campaignId: string, userId: string) {
    const campaign = await this.campaignsRepo.findById(campaignId)
    if (!campaign) throw new NotFoundError('Campanha não encontrada')
    if (campaign.gmUserId !== userId) throw new ForbiddenError()
    return campaign
  }

  private async assertMapGm(mapId: string, userId: string) {
    const map = await this.repo.findMapById(mapId)
    if (!map) throw new NotFoundError('Mapa não encontrado')
    await this.assertGm(map.campaignId, userId)
    return map
  }

  private async assertMapMember(mapId: string, userId: string) {
    const map = await this.repo.findMapById(mapId)
    if (!map) throw new NotFoundError('Mapa não encontrado')
    await this.assertCampaignAccess(map.campaignId, userId)
    return map
  }
}
