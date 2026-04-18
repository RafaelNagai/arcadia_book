import type { PrismaClient, CharacterState } from '../generated/prisma/client.js'
import { ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CharactersRepository } from '../repositories/characters.repository.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { StateRepository } from '../repositories/state.repository.js'
import type { DiceLogEntry } from '../types/domain.js'

export class StateService {
  private readonly charRepo: CharactersRepository
  private readonly campaignRepo: CampaignsRepository
  private readonly repo: StateRepository

  constructor(db: PrismaClient) {
    this.charRepo = new CharactersRepository(db)
    this.campaignRepo = new CampaignsRepository(db)
    this.repo = new StateRepository(db)
  }

  async get(characterId: string, userId: string): Promise<CharacterState> {
    const stateUserId = await this.resolveStateUserId(characterId, userId)
    return this.repo.findOrCreate(characterId, stateUserId)
  }

  async updatePeChecks(
    characterId: string,
    userId: string,
    peChecks: Record<string, boolean[]>,
  ): Promise<CharacterState> {
    const stateUserId = await this.resolveStateUserId(characterId, userId)
    await this.repo.findOrCreate(characterId, stateUserId)
    return this.repo.updatePeChecks(characterId, stateUserId, peChecks)
  }

  async updateSkillModifiers(
    characterId: string,
    userId: string,
    modifiers: Record<string, number>,
  ): Promise<CharacterState> {
    const stateUserId = await this.resolveStateUserId(characterId, userId)
    await this.repo.findOrCreate(characterId, stateUserId)
    return this.repo.updateSkillModifiers(characterId, stateUserId, modifiers)
  }

  async updateDefenseModifiers(
    characterId: string,
    userId: string,
    modifiers: { daBase: number; daBonus: number; dpBonus: number },
  ): Promise<CharacterState> {
    const stateUserId = await this.resolveStateUserId(characterId, userId)
    await this.repo.findOrCreate(characterId, stateUserId)
    return this.repo.updateDefenseModifiers(characterId, stateUserId, modifiers)
  }

  async appendDiceLog(
    characterId: string,
    userId: string,
    entry: DiceLogEntry,
  ): Promise<CharacterState> {
    const stateUserId = await this.resolveStateUserId(characterId, userId)
    return this.repo.appendDiceLog(characterId, stateUserId, entry)
  }

  async clearDiceLog(characterId: string, userId: string): Promise<CharacterState> {
    const stateUserId = await this.resolveStateUserId(characterId, userId)
    await this.repo.findOrCreate(characterId, stateUserId)
    return this.repo.clearDiceLog(characterId, stateUserId)
  }

  // Returns the userId to use as the state row key.
  // Campaign GMs write to the character owner's row so changes are shared.
  private async resolveStateUserId(characterId: string, requestingUserId: string): Promise<string> {
    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId === requestingUserId) return requestingUserId

    const membership = await this.campaignRepo.findMembership(characterId)
    if (membership) {
      const campaign = await this.campaignRepo.findById(membership.campaignId)
      if (campaign?.gmUserId === requestingUserId) return char.userId
    }

    throw new ForbiddenError()
  }
}
