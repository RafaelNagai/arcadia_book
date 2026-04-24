import type { PrismaClient } from '../generated/prisma/client.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, NotFoundError, ValidationError } from '../middleware/error-handler.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { CharactersRepository } from '../repositories/characters.repository.js'
import { MapsRepository } from '../repositories/maps.repository.js'
import { UploadService } from './upload.service.js'
import type { CreateCampaignInput, UpdateCampaignInput } from '../schemas/campaign.schema.js'

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export class CampaignsService {
  private readonly repo: CampaignsRepository
  private readonly charRepo: CharactersRepository
  private readonly mapsRepo: MapsRepository
  private readonly uploadSvc: UploadService

  constructor(db: PrismaClient, supabase: SupabaseClient) {
    this.repo = new CampaignsRepository(db)
    this.charRepo = new CharactersRepository(db)
    this.mapsRepo = new MapsRepository(db)
    this.uploadSvc = new UploadService(supabase)
  }

  async create(gmUserId: string, input: CreateCampaignInput) {
    return this.repo.create(gmUserId, {
      title: input.title,
      description: input.description ?? '',
      imageUrl: input.image_url ?? null,
      inviteCode: generateInviteCode(),
    })
  }

  async list(userId: string) {
    const campaigns = await this.repo.listForUser(userId)
    return campaigns.map(c => ({
      id: c.id,
      gmUserId: c.gmUserId,
      title: c.title,
      description: c.description,
      imageUrl: c.imageUrl,
      inviteCode: c.gmUserId === userId ? c.inviteCode : undefined,
      isGm: c.gmUserId === userId,
      playerCount: c.characters.filter(cc => cc.role === 'player').length,
      createdAt: c.createdAt,
    }))
  }

  async get(id: string, userId: string) {
    const campaign = await this.repo.findById(id)
    if (!campaign) throw new NotFoundError('Campanha não encontrada')

    const isGm = campaign.gmUserId === userId
    const isPlayer = campaign.characters.some(cc => cc.character.userId === userId)

    if (!isGm && !isPlayer) throw new ForbiddenError()

    const players = campaign.characters
      .filter(cc => cc.role === 'player')
      .map(cc => ({ ...cc.character, campaignCharacterId: cc.id }))

    const npcs = isGm
      ? campaign.characters
          .filter(cc => cc.role === 'npc')
          .map(cc => ({ ...cc.character, campaignCharacterId: cc.id }))
      : []

    return {
      id: campaign.id,
      gmUserId: campaign.gmUserId,
      title: campaign.title,
      description: campaign.description,
      imageUrl: campaign.imageUrl,
      inviteCode: isGm ? campaign.inviteCode : undefined,
      isGm,
      players,
      npcs,
    }
  }

  async update(id: string, userId: string, input: UpdateCampaignInput) {
    await this.assertGm(id, userId)
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.description !== undefined) patch.description = input.description
    if (input.image_url !== undefined) patch.imageUrl = input.image_url
    return this.repo.update(id, patch)
  }

  async delete(id: string, userId: string) {
    await this.assertGm(id, userId)
    const maps = await this.mapsRepo.listMaps(id)
    await this.repo.delete(id)
    // Clean up all map layer images from storage after DB deletion
    for (const map of maps) {
      for (const layer of map.layers) {
        await this.uploadSvc.deleteImageByUrl(layer.imageUrl).catch(() => {})
      }
    }
  }

  async regenerateInviteCode(id: string, userId: string) {
    await this.assertGm(id, userId)
    const updated = await this.repo.update(id, { inviteCode: generateInviteCode() })
    return updated.inviteCode
  }

  async join(code: string, characterId: string, userId: string) {
    const campaign = await this.repo.findByInviteCode(code)
    if (!campaign) throw new NotFoundError('Código de convite inválido')

    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId !== userId) throw new ForbiddenError()

    const existing = await this.repo.findMembership(characterId)
    if (existing) throw new ValidationError('Este personagem já está em uma campanha')

    return this.repo.addCharacter(campaign.id, characterId, 'player')
  }

  async leave(campaignId: string, characterId: string, userId: string) {
    const campaign = await this.repo.findById(campaignId)
    if (!campaign) throw new NotFoundError('Campanha não encontrada')

    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')

    const isGm = campaign.gmUserId === userId
    const isOwner = char.userId === userId

    if (!isGm && !isOwner) throw new ForbiddenError()

    await this.repo.removeCharacter(characterId)
  }

  async addNpc(campaignId: string, characterId: string, userId: string) {
    await this.assertGm(campaignId, userId)

    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId !== userId) throw new ForbiddenError()

    const existing = await this.repo.findMembership(characterId)
    if (existing) throw new ValidationError('Este personagem já está em uma campanha')

    return this.repo.addCharacter(campaignId, characterId, 'npc')
  }

  async getMembership(characterId: string) {
    return this.repo.findMembership(characterId)
  }

  private async assertGm(campaignId: string, userId: string) {
    const campaign = await this.repo.findById(campaignId)
    if (!campaign) throw new NotFoundError('Campanha não encontrada')
    if (campaign.gmUserId !== userId) throw new ForbiddenError()
    return campaign
  }
}
