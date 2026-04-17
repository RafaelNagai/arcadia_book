import type { PrismaClient, CharacterState } from '../generated/prisma/client.js'
import { ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CharactersRepository } from '../repositories/characters.repository.js'
import { StateRepository } from '../repositories/state.repository.js'
import type { DiceLogEntry } from '../types/domain.js'

export class StateService {
  private readonly charRepo: CharactersRepository
  private readonly repo: StateRepository

  constructor(db: PrismaClient) {
    this.charRepo = new CharactersRepository(db)
    this.repo = new StateRepository(db)
  }

  async get(characterId: string, userId: string): Promise<CharacterState> {
    await this.assertOwner(characterId, userId)
    return this.repo.findOrCreate(characterId, userId)
  }

  async updatePeChecks(
    characterId: string,
    userId: string,
    peChecks: Record<string, boolean[]>,
  ): Promise<CharacterState> {
    await this.assertOwner(characterId, userId)
    await this.repo.findOrCreate(characterId, userId)
    return this.repo.updatePeChecks(characterId, userId, peChecks)
  }

  async updateSkillModifiers(
    characterId: string,
    userId: string,
    modifiers: Record<string, number>,
  ): Promise<CharacterState> {
    await this.assertOwner(characterId, userId)
    await this.repo.findOrCreate(characterId, userId)
    return this.repo.updateSkillModifiers(characterId, userId, modifiers)
  }

  async updateDefenseModifiers(
    characterId: string,
    userId: string,
    modifiers: { daBase: number; daBonus: number; dpBonus: number },
  ): Promise<CharacterState> {
    await this.assertOwner(characterId, userId)
    await this.repo.findOrCreate(characterId, userId)
    return this.repo.updateDefenseModifiers(characterId, userId, modifiers)
  }

  async appendDiceLog(
    characterId: string,
    userId: string,
    entry: DiceLogEntry,
  ): Promise<CharacterState> {
    await this.assertOwner(characterId, userId)
    return this.repo.appendDiceLog(characterId, userId, entry)
  }

  async clearDiceLog(characterId: string, userId: string): Promise<CharacterState> {
    await this.assertOwner(characterId, userId)
    await this.repo.findOrCreate(characterId, userId)
    return this.repo.clearDiceLog(characterId, userId)
  }

  private async assertOwner(characterId: string, userId: string): Promise<void> {
    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId !== userId) throw new ForbiddenError()
  }
}
