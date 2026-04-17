import type { PrismaClient, InventoryBag, InventoryItem } from '../generated/prisma/client.js'
import type {
  CreateItemInput,
  UpdateItemInput,
  CreateBagInput,
  UpdateBagInput,
} from '../schemas/inventory.schema.js'

export class InventoryRepository {
  constructor(private readonly db: PrismaClient) {}

  findBagsByCharacterId(characterId: string): Promise<InventoryBag[]> {
    return this.db.inventoryBag.findMany({
      where: { characterId },
      orderBy: { sortOrder: 'asc' },
    })
  }

  findItemsByCharacterId(characterId: string): Promise<InventoryItem[]> {
    return this.db.inventoryItem.findMany({
      where: { characterId },
      orderBy: { sortOrder: 'asc' },
    })
  }

  findBagById(bagId: string): Promise<InventoryBag | null> {
    return this.db.inventoryBag.findUnique({ where: { id: bagId } })
  }

  findItemById(itemId: string): Promise<InventoryItem | null> {
    return this.db.inventoryItem.findUnique({ where: { id: itemId } })
  }

  createBag(characterId: string, input: CreateBagInput): Promise<InventoryBag> {
    return this.db.inventoryBag.create({
      data: { characterId, name: input.name, slots: input.slots, sortOrder: input.sort_order },
    })
  }

  updateBag(bagId: string, input: UpdateBagInput): Promise<InventoryBag> {
    return this.db.inventoryBag.update({
      where: { id: bagId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slots !== undefined && { slots: input.slots }),
        ...(input.sort_order !== undefined && { sortOrder: input.sort_order }),
      },
    })
  }

  deleteBag(bagId: string): Promise<InventoryBag> {
    return this.db.inventoryBag.delete({ where: { id: bagId } })
  }

  createItem(characterId: string, input: CreateItemInput): Promise<InventoryItem> {
    return this.db.inventoryItem.create({
      data: {
        characterId,
        bagId: input.bag_id ?? null,
        name: input.name,
        description: input.description ?? '',
        weight: input.weight ?? 'nulo',
        isEquipment: input.is_equipment ?? false,
        maxDurability: input.max_durability ?? null,
        currentDurability: input.current_durability ?? null,
        imageUrl: input.image_url ?? null,
        catalogImage: input.catalog_image ?? null,
        fromCatalog: input.from_catalog ?? false,
        catalogSubcategory: input.catalog_subcategory ?? null,
        catalogTier: input.catalog_tier ?? null,
        damage: input.damage ?? null,
        effects: input.effects ?? [],
        sortOrder: input.sort_order ?? 0,
      },
    })
  }

  updateItem(itemId: string, input: UpdateItemInput): Promise<InventoryItem> {
    return this.db.inventoryItem.update({
      where: { id: itemId },
      data: {
        ...(input.bag_id !== undefined && { bagId: input.bag_id }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.weight !== undefined && { weight: input.weight }),
        ...(input.is_equipment !== undefined && { isEquipment: input.is_equipment }),
        ...(input.max_durability !== undefined && { maxDurability: input.max_durability }),
        ...(input.current_durability !== undefined && { currentDurability: input.current_durability }),
        ...(input.image_url !== undefined && { imageUrl: input.image_url }),
        ...(input.catalog_image !== undefined && { catalogImage: input.catalog_image }),
        ...(input.from_catalog !== undefined && { fromCatalog: input.from_catalog }),
        ...(input.catalog_subcategory !== undefined && { catalogSubcategory: input.catalog_subcategory }),
        ...(input.catalog_tier !== undefined && { catalogTier: input.catalog_tier }),
        ...(input.damage !== undefined && { damage: input.damage }),
        ...(input.effects !== undefined && { effects: input.effects }),
        ...(input.sort_order !== undefined && { sortOrder: input.sort_order }),
      },
    })
  }

  deleteItem(itemId: string): Promise<InventoryItem> {
    return this.db.inventoryItem.delete({ where: { id: itemId } })
  }

  async reorderItems(
    updates: Array<{ id: string; sort_order: number; bag_id?: string | null }>,
  ): Promise<void> {
    await this.db.$transaction(
      updates.map(({ id, sort_order, bag_id }) =>
        this.db.inventoryItem.update({
          where: { id },
          data: {
            sortOrder: sort_order,
            ...(bag_id !== undefined && { bagId: bag_id }),
          },
        }),
      ),
    )
  }
}
