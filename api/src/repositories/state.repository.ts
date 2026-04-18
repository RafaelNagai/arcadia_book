import type { PrismaClient, CharacterState } from '../generated/prisma/client.js'
import type { DiceLogEntry } from '../types/domain.js'

const DICE_LOG_MAX = 200

export class StateRepository {
  constructor(private readonly db: PrismaClient) {}

  async findOrCreate(characterId: string, userId: string): Promise<CharacterState> {
    const existing = await this.db.characterState.findUnique({
      where: { characterId_userId: { characterId, userId } },
    })
    if (existing) return existing
    try {
      return await this.db.characterState.create({ data: { characterId, userId } })
    } catch (err: unknown) {
      // P2002 = unique violation — race condition with pgBouncer, record was just created
      if ((err as { code?: string }).code === 'P2002') {
        return this.db.characterState.findUniqueOrThrow({
          where: { characterId_userId: { characterId, userId } },
        })
      }
      throw err
    }
  }

  updatePeChecks(
    characterId: string,
    userId: string,
    peChecks: Record<string, boolean[]>,
  ): Promise<CharacterState> {
    return this.db.characterState.update({
      where: { characterId_userId: { characterId, userId } },
      data: { peChecks },
    })
  }

  updateSkillModifiers(
    characterId: string,
    userId: string,
    skillModifiers: Record<string, number>,
  ): Promise<CharacterState> {
    return this.db.characterState.update({
      where: { characterId_userId: { characterId, userId } },
      data: { skillModifiers },
    })
  }

  updateDefenseModifiers(
    characterId: string,
    userId: string,
    defenseModifiers: { daBase: number; daBonus: number; dpBonus: number },
  ): Promise<CharacterState> {
    return this.db.characterState.update({
      where: { characterId_userId: { characterId, userId } },
      data: { defenseModifiers },
    })
  }

  async appendDiceLog(
    characterId: string,
    userId: string,
    entry: DiceLogEntry,
  ): Promise<CharacterState> {
    const state = await this.findOrCreate(characterId, userId)
    const log = [entry, ...((state.diceLog as unknown) as DiceLogEntry[])].slice(0, DICE_LOG_MAX)
    return this.db.characterState.update({
      where: { characterId_userId: { characterId, userId } },
      data: { diceLog: log as never },
    })
  }

  clearDiceLog(characterId: string, userId: string): Promise<CharacterState> {
    return this.db.characterState.update({
      where: { characterId_userId: { characterId, userId } },
      data: { diceLog: [] },
    })
  }
}
