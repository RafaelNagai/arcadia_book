import type { PrismaClient, ShipState } from '../generated/prisma/client.js'
import type { MoralLogEntry } from '../types/domain.js'

const MORAL_LOG_MAX = 200

export class ShipStateRepository {
  constructor(private readonly db: PrismaClient) {}

  async findOrCreate(shipId: string): Promise<ShipState> {
    const existing = await this.db.shipState.findUnique({ where: { shipId } })
    if (existing) return existing
    try {
      return await this.db.shipState.create({ data: { shipId } })
    } catch (err: unknown) {
      // P2002 = unique violation — race condition with pgBouncer, record was just created
      if ((err as { code?: string }).code === 'P2002') {
        return this.db.shipState.findUniqueOrThrow({ where: { shipId } })
      }
      throw err
    }
  }

  async applyMoralMutation(
    shipId: string,
    moralPool: number[],
    entry: MoralLogEntry,
  ): Promise<ShipState> {
    const state = await this.findOrCreate(shipId)
    const log = [entry, ...((state.moralLog as unknown) as MoralLogEntry[])].slice(0, MORAL_LOG_MAX)
    return this.db.shipState.update({
      where: { shipId },
      data: {
        moralPool: moralPool as unknown as object,
        moralLog: log as unknown as object,
      },
    })
  }
}
