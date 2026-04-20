import type { PrismaClient } from '../generated/prisma/client.js'

const TOKEN_CHAR_SELECT = {
  id: true,
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

  listMaps(campaignId: string) {
    return this.db.map.findMany({
      where: { campaignId },
      include: { layers: { orderBy: { orderIndex: 'asc' } } },
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
        layers: { orderBy: { orderIndex: 'asc' } },
        tokens: {
          include: { character: { select: TOKEN_CHAR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
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
