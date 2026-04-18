import type { PrismaClient, Character } from '../generated/prisma/client.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CharactersRepository } from '../repositories/characters.repository.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { UploadService } from './upload.service.js'
import type { CreateCharacterInput } from '../schemas/character.schema.js'

const SNAKE_TO_CAMEL: Record<string, string> = {
  image_url: 'imageUrl',
  is_public: 'isPublic',
  current_hp: 'currentHp',
  current_sanidade: 'currentSanidade',
}

function snakeToCamelPatch(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).map(([k, v]) => [SNAKE_TO_CAMEL[k] ?? k, v]),
  )
}

export class CharactersService {
  private readonly repo: CharactersRepository
  private readonly campaignRepo: CampaignsRepository
  private readonly uploadSvc: UploadService

  constructor(db: PrismaClient, supabase: SupabaseClient) {
    this.repo = new CharactersRepository(db)
    this.campaignRepo = new CampaignsRepository(db)
    this.uploadSvc = new UploadService(supabase)
  }

  async listPublic(requestingUserId?: string) {
    const chars = await this.repo.findPublic(requestingUserId)
    return chars.map(c => ({
      ...c,
      campaign: c.campaignCharacter
        ? { id: c.campaignCharacter.campaign.id, title: c.campaignCharacter.campaign.title, role: c.campaignCharacter.role }
        : null,
    }))
  }

  async list(userId: string) {
    const chars = await this.repo.findByUserId(userId)
    return chars.map(c => ({
      ...c,
      campaign: c.campaignCharacter
        ? { id: c.campaignCharacter.campaign.id, title: c.campaignCharacter.campaign.title, role: c.campaignCharacter.role }
        : null,
    }))
  }

  async get(id: string, requestingUserId?: string): Promise<Character> {
    const char = await this.repo.findById(id)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (!char.isPublic && char.userId !== requestingUserId) {
      if (requestingUserId) {
        const membership = await this.campaignRepo.findMembership(id)
        if (membership) {
          const campaign = await this.campaignRepo.findById(membership.campaignId)
          if (campaign?.gmUserId === requestingUserId) return char
        }
      }
      throw new ForbiddenError('Este personagem é privado')
    }
    return char
  }

  async create(userId: string, input: CreateCharacterInput): Promise<Character> {
    return this.repo.create(userId, input)
  }

  async update(id: string, userId: string, input: Record<string, unknown>): Promise<Character> {
    await this.assertOwner(id, userId)
    return this.repo.update(id, snakeToCamelPatch(input))
  }

  async updateCurrentValues(
    id: string,
    userId: string,
    values: { current_hp?: number; current_sanidade?: number },
  ): Promise<Character> {
    await this.assertOwner(id, userId)
    // Map snake_case from route to Prisma camelCase
    return this.repo.update(id, {
      ...(values.current_hp !== undefined && { currentHp: values.current_hp }),
      ...(values.current_sanidade !== undefined && { currentSanidade: values.current_sanidade }),
    })
  }

  async setVisibility(id: string, userId: string, isPublic: boolean): Promise<Character> {
    const char = await this.repo.findById(id)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId !== userId) throw new ForbiddenError()
    return this.repo.update(id, { isPublic })
  }

  async delete(id: string, userId: string): Promise<void> {
    const char = await this.assertOwner(id, userId)
    await this.repo.delete(id)
    await this.uploadSvc.deleteCharacterFolder(char.userId, id).catch(() => {})
  }

  private async assertOwner(id: string, userId: string): Promise<Character> {
    const char = await this.repo.findById(id)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId !== userId) {
      // Allow campaign GM to edit characters in their campaign
      const membership = await this.campaignRepo.findMembership(id)
      if (membership) {
        const campaign = await this.campaignRepo.findById(membership.campaignId)
        if (campaign?.gmUserId === userId) return char
      }
      throw new ForbiddenError()
    }
    return char
  }
}
