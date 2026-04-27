import type { PrismaClient, Prisma } from '../generated/prisma/client.js'

const TOKEN_CHAR_SELECT = {
  id: true,
  userId: true,
  name: true,
  imageUrl: true,
  afinidade: true,
  race: true,
}

export class MapsRepository {
  constructor(private readonly db: PrismaClient) {}

  // ── Maps ──────────────────────────────────────────────────────────────────

  findMapById(id: string) {
    return this.db.map.findUnique({
      where: { id },
      include: { layers: { orderBy: { orderIndex: 'asc' } } },
    })
  }

  findMapFull(id: string) {
    return this.db.map.findUnique({
      where: { id },
      include: {
        layers: {
          orderBy: { orderIndex: 'asc' },
          include: {
            walls: { orderBy: { createdAt: 'asc' } },
            doors: { orderBy: { createdAt: 'asc' } },
          },
        },
        tokens: {
          include: { character: { select: TOKEN_CHAR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  listMaps(campaignId: string) {
    return this.db.map.findMany({
      where: { campaignId },
      include: {
        layers: { orderBy: { orderIndex: 'asc' } },
        tokens: {
          include: { character: { select: TOKEN_CHAR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  createMap(campaignId: string, data: {
    title: string
    gridEnabled: boolean
    gridSize: number
    visionUnified: boolean
    defaultVisionRadius: number
  }) {
    return this.db.map.create({
      data: { campaignId, ...data },
      include: { layers: true },
    })
  }

  updateMap(id: string, data: Partial<{
    title: string
    gridEnabled: boolean
    gridSize: number
    visionUnified: boolean
    defaultVisionRadius: number
  }>) {
    return this.db.map.update({ where: { id }, data, include: { layers: true } })
  }

  updateFog(id: string, data: { fogEnabled?: boolean }) {
    return this.db.map.update({ where: { id }, data, include: { layers: true } })
  }

  updateLayerFog(id: string, fogRevealed: Prisma.InputJsonValue) {
    return this.db.mapLayer.update({
      where: { id },
      data: { fogRevealed },
    })
  }

  deleteMap(id: string) {
    return this.db.map.delete({ where: { id } })
  }

  async activateMap(campaignId: string, mapId: string) {
    await this.db.map.updateMany({ where: { campaignId, isActive: true }, data: { isActive: false } })
    return this.db.map.update({ where: { id: mapId }, data: { isActive: true }, include: { layers: true } })
  }

  deactivateMap(mapId: string) {
    return this.db.map.update({ where: { id: mapId }, data: { isActive: false } })
  }

  findActiveMap(campaignId: string) {
    return this.db.map.findFirst({
      where: { campaignId, isActive: true },
      include: {
        layers: {
          orderBy: { orderIndex: 'asc' },
          include: {
            walls: { orderBy: { createdAt: 'asc' } },
            doors: { orderBy: { createdAt: 'asc' } },
          },
        },
        tokens: {
          include: { character: { select: TOKEN_CHAR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  // ── Walls ─────────────────────────────────────────────────────────────────

  findWallById(id: string) {
    return this.db.mapWall.findUnique({ where: { id } })
  }

  createWall(data: { mapId: string; layerId: string; points: Prisma.InputJsonValue }) {
    return this.db.mapWall.create({ data })
  }

  deleteWall(id: string) {
    return this.db.mapWall.delete({ where: { id } })
  }

  // ── Doors ─────────────────────────────────────────────────────────────────

  findDoorById(id: string) {
    return this.db.mapDoor.findUnique({ where: { id } })
  }

  createDoor(data: { mapId: string; layerId: string; points: Prisma.InputJsonValue }) {
    return this.db.mapDoor.create({ data })
  }

  deleteDoor(id: string) {
    return this.db.mapDoor.delete({ where: { id } })
  }

  toggleDoor(id: string, isOpen: boolean) {
    return this.db.mapDoor.update({ where: { id }, data: { isOpen } })
  }

  // ── Layers ────────────────────────────────────────────────────────────────

  findLayerById(id: string) {
    return this.db.mapLayer.findUnique({ where: { id } })
  }

  createLayer(mapId: string, data: { name: string; orderIndex: number; imageUrl: string }) {
    return this.db.mapLayer.create({ data: { mapId, ...data } })
  }

  updateLayer(id: string, data: Partial<{ name: string; orderIndex: number }>) {
    return this.db.mapLayer.update({ where: { id }, data })
  }

  deleteLayer(id: string) {
    return this.db.mapLayer.delete({ where: { id } })
  }

  async activateLayer(mapId: string, layerId: string) {
    await this.db.mapLayer.updateMany({ where: { mapId, isActive: true }, data: { isActive: false } })
    return this.db.mapLayer.update({ where: { id: layerId }, data: { isActive: true } })
  }

  // ── Tokens ────────────────────────────────────────────────────────────────

  listTokens(mapId: string) {
    return this.db.mapToken.findMany({
      where: { mapId },
      include: { character: { select: TOKEN_CHAR_SELECT } },
      orderBy: { createdAt: 'asc' },
    })
  }

  findTokenById(id: string) {
    return this.db.mapToken.findUnique({ where: { id } })
  }

  findTokenForCharacter(characterId: string) {
    return this.db.mapToken.findFirst({ where: { characterId } })
  }

  createToken(data: {
    mapId: string
    layerId: string
    characterId: string
    x: number
    y: number
    visionRadius?: number | null
    isVisible: boolean
  }) {
    return this.db.mapToken.create({
      data,
      include: { character: { select: TOKEN_CHAR_SELECT } },
    })
  }

  updateToken(id: string, data: Partial<{
    layerId: string
    x: number
    y: number
    visionRadius: number | null
    isVisible: boolean
    size: number
    sharedWith: Prisma.InputJsonValue
  }>) {
    return this.db.mapToken.update({
      where: { id },
      data,
      include: { character: { select: TOKEN_CHAR_SELECT } },
    })
  }

  deleteToken(id: string) {
    return this.db.mapToken.delete({ where: { id } })
  }
}
