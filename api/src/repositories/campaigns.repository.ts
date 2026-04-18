import type { PrismaClient, Campaign, CampaignCharacter } from '../generated/prisma/client.js'

const CHAR_SELECT = {
  id: true,
  name: true,
  race: true,
  afinidade: true,
  imageUrl: true,
  isPublic: true,
  userId: true,
  level: true,
  concept: true,
  hp: true,
  sanidade: true,
  attributes: true,
  skills: true,
  entropia: true,
}

export class CampaignsRepository {
  constructor(private readonly db: PrismaClient) {}

  create(gmUserId: string, data: { title: string; description: string; imageUrl?: string | null; inviteCode: string }): Promise<Campaign> {
    return this.db.campaign.create({
      data: {
        gmUserId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        inviteCode: data.inviteCode,
      },
    })
  }

  findById(id: string) {
    return this.db.campaign.findUnique({
      where: { id },
      include: {
        characters: {
          include: { character: { select: CHAR_SELECT } },
        },
      },
    })
  }

  findByInviteCode(code: string) {
    return this.db.campaign.findUnique({ where: { inviteCode: code.toUpperCase() } })
  }

  listForUser(userId: string) {
    return this.db.campaign.findMany({
      where: {
        OR: [
          { gmUserId: userId },
          { characters: { some: { character: { userId } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        characters: {
          include: { character: { select: { id: true, userId: true } } },
        },
      },
    })
  }

  update(id: string, data: Partial<{ title: string; description: string; imageUrl: string | null; inviteCode: string }>): Promise<Campaign> {
    return this.db.campaign.update({ where: { id }, data })
  }

  delete(id: string): Promise<Campaign> {
    return this.db.campaign.delete({ where: { id } })
  }

  addCharacter(campaignId: string, characterId: string, role: 'player' | 'npc'): Promise<CampaignCharacter> {
    return this.db.campaignCharacter.create({ data: { campaignId, characterId, role } })
  }

  removeCharacter(characterId: string): Promise<CampaignCharacter> {
    return this.db.campaignCharacter.delete({ where: { characterId } })
  }

  findMembership(characterId: string) {
    return this.db.campaignCharacter.findUnique({
      where: { characterId },
      include: { campaign: true },
    })
  }
}
