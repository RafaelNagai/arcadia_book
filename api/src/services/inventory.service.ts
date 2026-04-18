import type { PrismaClient, InventoryBag, InventoryItem } from '../generated/prisma/client.js'
import { ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CharactersRepository } from '../repositories/characters.repository.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { InventoryRepository } from '../repositories/inventory.repository.js'
import type {
  CreateBagInput,
  CreateItemInput,
  UpdateBagInput,
  UpdateItemInput,
} from '../schemas/inventory.schema.js'

export class InventoryService {
  private readonly charRepo: CharactersRepository
  private readonly campaignRepo: CampaignsRepository
  private readonly repo: InventoryRepository

  constructor(db: PrismaClient) {
    this.charRepo = new CharactersRepository(db)
    this.campaignRepo = new CampaignsRepository(db)
    this.repo = new InventoryRepository(db)
  }

  async getInventory(
    characterId: string,
    requestingUserId?: string,
  ): Promise<{ bags: InventoryBag[]; items: InventoryItem[] }> {
    await this.assertAccess(characterId, requestingUserId)
    const [bags, items] = await Promise.all([
      this.repo.findBagsByCharacterId(characterId),
      this.repo.findItemsByCharacterId(characterId),
    ])
    return { bags, items }
  }

  async createItem(
    characterId: string,
    userId: string,
    input: CreateItemInput,
  ): Promise<InventoryItem> {
    await this.assertOwner(characterId, userId)
    return this.repo.createItem(characterId, input)
  }

  async updateItem(
    characterId: string,
    itemId: string,
    userId: string,
    input: UpdateItemInput,
  ): Promise<InventoryItem> {
    await this.assertOwner(characterId, userId)
    const item = await this.repo.findItemById(itemId)
    if (!item || item.characterId !== characterId) throw new NotFoundError('Item não encontrado')
    return this.repo.updateItem(itemId, input)
  }

  async deleteItem(characterId: string, itemId: string, userId: string): Promise<void> {
    await this.assertOwner(characterId, userId)
    const item = await this.repo.findItemById(itemId)
    if (!item || item.characterId !== characterId) throw new NotFoundError('Item não encontrado')
    await this.repo.deleteItem(itemId)
  }

  async reorderItems(
    characterId: string,
    userId: string,
    updates: Array<{ id: string; sort_order: number; bag_id?: string | null }>,
  ): Promise<void> {
    await this.assertOwner(characterId, userId)
    return this.repo.reorderItems(updates)
  }

  async createBag(characterId: string, userId: string, input: CreateBagInput): Promise<InventoryBag> {
    await this.assertOwner(characterId, userId)
    return this.repo.createBag(characterId, input)
  }

  async updateBag(
    characterId: string,
    bagId: string,
    userId: string,
    input: UpdateBagInput,
  ): Promise<InventoryBag> {
    await this.assertOwner(characterId, userId)
    const bag = await this.repo.findBagById(bagId)
    if (!bag || bag.characterId !== characterId) throw new NotFoundError('Bolsa não encontrada')
    return this.repo.updateBag(bagId, input)
  }

  async deleteBag(characterId: string, bagId: string, userId: string): Promise<void> {
    await this.assertOwner(characterId, userId)
    const bag = await this.repo.findBagById(bagId)
    if (!bag || bag.characterId !== characterId) throw new NotFoundError('Bolsa não encontrada')
    await this.repo.deleteBag(bagId)
  }

  private async assertAccess(characterId: string, userId?: string): Promise<void> {
    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.isPublic || char.userId === userId) return
    if (userId) {
      const membership = await this.campaignRepo.findMembership(characterId)
      if (membership) {
        const campaign = await this.campaignRepo.findById(membership.campaignId)
        if (campaign?.gmUserId === userId) return
      }
    }
    throw new ForbiddenError()
  }

  private async assertOwner(characterId: string, userId: string): Promise<void> {
    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId === userId) return
    const membership = await this.campaignRepo.findMembership(characterId)
    if (membership) {
      const campaign = await this.campaignRepo.findById(membership.campaignId)
      if (campaign?.gmUserId === userId) return
    }
    throw new ForbiddenError()
  }
}
