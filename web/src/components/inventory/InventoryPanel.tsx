import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { WEIGHT_VALUES } from "@/data/characterTypes";
import type { InventoryBag, InventoryItem } from "@/data/characterTypes";
import {
  loadInventory,
  saveInventory,
  loadBags,
  saveBags,
} from "@/lib/localCharacters";
import {
  isApiCharacterId,
  buildInventoryFromApi,
  mapApiItemToInventoryItem,
  type ApiRawItem,
  type ApiRawBag,
} from "@/lib/apiAdapter";
import { api } from "@/lib/apiClient";
import { generateItemId, resolveCatalogImage } from "./types";
import type { CatalogEntry, ItemFormData } from "./types";
import { ItemCard } from "./ItemCard";
import { ItemModal } from "./ItemModal";
import { EmptySlot } from "./EmptySlot";
import { DroppableSection } from "./DroppableSection";
import { BagSection } from "./BagSection";
import { ImageZoomOverlay } from "@/components/ImageZoomOverlay";

export function InventoryPanel({
  characterId,
  fisico,
  accentColor,
  isOpen,
  onClose,
  onRollDamage,
  canEdit,
  inventorySnapshot,
}: {
  characterId: string;
  fisico: number;
  accentColor: string;
  isOpen: boolean;
  onClose: () => void;
  onRollDamage?: (damageStr: string, equipmentName: string) => void;
  canEdit?: boolean;
  inventorySnapshot?: { bags: InventoryBag[]; items: InventoryItem[] } | null;
}) {
  const totalSlots = 2 + fisico;
  const maxWeight = 12 + fisico * 3;
  const isApiChar = isApiCharacterId(characterId);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [bags, setBags] = useState<InventoryBag[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Load initial inventory
  useEffect(() => {
    if (!characterId) return;
    if (isApiChar) {
      api.inventory
        .get(characterId)
        .then((res) => {
          const { bags: rawBags, items: rawItems } = res as {
            bags: ApiRawBag[];
            items: ApiRawItem[];
          };
          const built = buildInventoryFromApi(rawBags, rawItems);
          setItems(built.items);
          setBags(built.bags);
        })
        .catch(() => {});
    } else {
      setItems(loadInventory(characterId));
      setBags(loadBags(characterId));
    }
  }, [characterId]);

  // Apply realtime snapshot from parent
  useEffect(() => {
    if (!inventorySnapshot) return;
    setItems(inventorySnapshot.items);
    setBags(inventorySnapshot.bags);
  }, [inventorySnapshot]);

  const allItems = [...items, ...bags.flatMap((b) => b.items)];
  const currentWeight = allItems.reduce(
    (sum, item) => sum + WEIGHT_VALUES[item.weight],
    0,
  );
  const weightPct = Math.min(1, currentWeight / maxWeight);
  const overDouble = currentWeight > maxWeight * 2;
  const overEncumbered = currentWeight > maxWeight;
  const weightColor = overDouble
    ? "#C05050"
    : overEncumbered
      ? "#C07030"
      : weightPct < 0.7
        ? "#6EC840"
        : "#C8922A";

  /* ── Damage roll ──────────────────────────────────────────────── */

  function handleRollDamage(damageStr: string, equipmentName: string) {
    onClose();
    onRollDamage?.(damageStr, equipmentName);
  }

  /* ── Persistence helpers (localStorage chars only) ────────────── */

  function persistBagsLocal(next: InventoryBag[]) {
    setBags(next);
    if (!isApiChar) saveBags(characterId, next);
  }

  /* ── API reorder helper ────────────────────────────────────────── */

  function buildReorderPayload(
    baseItems: InventoryItem[],
    updatedBags: InventoryBag[],
  ): Array<{ id: string; sort_order: number; bag_id: string | null }> {
    return [
      ...baseItems.map((item, idx) => ({
        id: item.id,
        sort_order: idx,
        bag_id: null,
      })),
      ...updatedBags.flatMap((bag) =>
        bag.items.map((item, idx) => ({
          id: item.id,
          sort_order: idx,
          bag_id: bag.id,
        })),
      ),
    ];
  }

  /* ── Bag management ───────────────────────────────────────────── */

  async function addBag() {
    if (!canEdit) return;
    if (isApiChar) {
      try {
        const res = (await api.inventory.createBag(characterId, {
          name: "Mochila",
          slots: 4,
        })) as { bag: ApiRawBag };
        const newBag: InventoryBag = {
          id: res.bag.id,
          name: res.bag.name,
          slots: res.bag.slots,
          items: [],
        };
        setBags((prev) => [...prev, newBag]);
      } catch {
        /* ignore */
      }
    } else {
      const newBag: InventoryBag = {
        id: `bag_${Date.now()}`,
        name: "Mochila",
        slots: 4,
        items: [],
      };
      persistBagsLocal([...bags, newBag]);
    }
  }

  function deleteBag(bagId: string) {
    if (!canEdit) return;
    setBags((prev) => prev.filter((b) => b.id !== bagId));
    if (isApiChar) {
      void api.inventory.deleteBag(characterId, bagId);
    } else {
      saveBags(
        characterId,
        bags.filter((b) => b.id !== bagId),
      );
    }
  }

  function renameBag(bagId: string, name: string) {
    if (!canEdit) return;
    const next = bags.map((b) => (b.id === bagId ? { ...b, name } : b));
    setBags(next);
    if (isApiChar) {
      void api.inventory.updateBag(characterId, bagId, { name });
    } else {
      saveBags(characterId, next);
    }
  }

  function changeBagSlots(bagId: string, delta: number) {
    if (!canEdit) return;
    const next = bags.map((b) =>
      b.id === bagId ? { ...b, slots: Math.max(1, b.slots + delta) } : b,
    );
    setBags(next);
    const bag = next.find((b) => b.id === bagId);
    if (isApiChar && bag) {
      void api.inventory.updateBag(characterId, bagId, { slots: bag.slots });
    } else if (!isApiChar) {
      saveBags(characterId, next);
    }
  }

  /* ── Drag and drop ────────────────────────────────────────────── */

  function findContainerIdOf(itemId: string): string | null {
    if (items.find((i) => i.id === itemId)) return "base";
    for (const bag of bags) {
      if (bag.items.find((i) => i.id === itemId)) return bag.id;
    }
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveItemId(String(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveItemId(null);
    if (!over || active.id === over.id || !canEdit) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainerId = findContainerIdOf(activeId);
    const overContainerId =
      findContainerIdOf(overId) ??
      (overId === "base" || bags.find((b) => b.id === overId) ? overId : null);

    if (!activeContainerId || !overContainerId) return;

    let newItems = items;
    let newBags = bags;

    if (activeContainerId === overContainerId) {
      if (activeContainerId === "base") {
        const oldIdx = items.findIndex((i) => i.id === activeId);
        const newIdx = items.findIndex((i) => i.id === overId);
        if (oldIdx < 0 || newIdx < 0) return;
        newItems = arrayMove(items, oldIdx, newIdx);
        setItems(newItems);
        if (!isApiChar) saveInventory(characterId, newItems);
      } else {
        newBags = bags.map((b) => {
          if (b.id !== activeContainerId) return b;
          const oldIdx = b.items.findIndex((i) => i.id === activeId);
          const newIdx = b.items.findIndex((i) => i.id === overId);
          if (oldIdx < 0 || newIdx < 0) return b;
          return { ...b, items: arrayMove(b.items, oldIdx, newIdx) };
        });
        setBags(newBags);
        if (!isApiChar) saveBags(characterId, newBags);
      }
    } else {
      const srcItems =
        activeContainerId === "base"
          ? items
          : bags.find((b) => b.id === activeContainerId)!.items;
      const dstItems =
        overContainerId === "base"
          ? items
          : bags.find((b) => b.id === overContainerId)!.items;

      const movingItem = srcItems.find((i) => i.id === activeId);
      if (!movingItem) return;

      const newSrc = srcItems.filter((i) => i.id !== activeId);
      const overIdx = dstItems.findIndex((i) => i.id === overId);
      const newDst = [...dstItems];
      newDst.splice(overIdx >= 0 ? overIdx : newDst.length, 0, movingItem);

      const dstLimit =
        overContainerId === "base"
          ? totalSlots
          : bags.find((b) => b.id === overContainerId)!.slots;
      if (newDst.length > dstLimit) return;

      if (activeContainerId === "base") {
        newItems = newSrc;
        newBags = bags.map((b) =>
          b.id === overContainerId ? { ...b, items: newDst } : b,
        );
      } else if (overContainerId === "base") {
        newItems = newDst;
        newBags = bags.map((b) =>
          b.id === activeContainerId ? { ...b, items: newSrc } : b,
        );
      } else {
        newBags = bags.map((b) => {
          if (b.id === activeContainerId) return { ...b, items: newSrc };
          if (b.id === overContainerId) return { ...b, items: newDst };
          return b;
        });
      }
      setItems(newItems);
      setBags(newBags);
      if (!isApiChar) {
        saveInventory(characterId, newItems);
        saveBags(characterId, newBags);
      }
    }

    if (isApiChar) {
      void api.inventory.reorderItems(
        characterId,
        buildReorderPayload(newItems, newBags),
      );
    }
  }

  /* ── Modal state ──────────────────────────────────────────────── */

  const [modal, setModal] = useState<
    | null
    | { mode: "create"; bagId?: string }
    | { mode: "edit"; itemId: string; bagId?: string }
  >(null);

  /* ── Item CRUD ────────────────────────────────────────────────── */

  function buildItemFromForm(data: ItemFormData): Omit<InventoryItem, "id"> {
    return {
      name: data.name.trim(),
      description: data.description.trim(),
      weight: data.weight,
      isEquipment: data.isEquipment,
      maxDurability: data.isEquipment ? data.maxDurability : undefined,
      currentDurability: data.isEquipment ? data.maxDurability : undefined,
      image: data.image.trim() || undefined,
      damage: data.damage.trim() || null,
      da: data.da.trim() || null,
      effects: data.effects.filter((e) => e.trim()),
    };
  }

  async function handleCatalogSelect(entry: CatalogEntry) {
    if (modal?.mode !== "create" || !canEdit) return;
    const { bagId } = modal;

    const tempId = generateItemId();
    const newItem: InventoryItem = {
      id: tempId,
      name: entry.name,
      description: entry.description,
      weight: entry.weight,
      isEquipment: entry.isEquipment,
      maxDurability: entry.isEquipment ? (entry.maxDurability ?? 5) : undefined,
      currentDurability: entry.isEquipment
        ? (entry.maxDurability ?? 5)
        : undefined,
      catalogImage: resolveCatalogImage(entry.image),
      fromCatalog: true,
      catalogSubcategory: entry.subcategory,
      catalogTier: entry.tier,
      damage: entry.damage ?? null,
      da: entry.da != null ? String(entry.da) : null,
      effects: entry.effects,
    };

    if (bagId) {
      setBags((prev) =>
        prev.map((b) =>
          b.id === bagId ? { ...b, items: [...b.items, newItem] } : b,
        ),
      );
    } else {
      setItems((prev) => [...prev, newItem]);
    }
    setModal(null);

    if (isApiChar) {
      try {
        const res = (await api.inventory.createItem(characterId, {
          bag_id: bagId ?? null,
          name: entry.name,
          description: entry.description,
          weight: entry.weight,
          is_equipment: entry.isEquipment,
          max_durability: entry.isEquipment ? (entry.maxDurability ?? 5) : null,
          current_durability: entry.isEquipment
            ? (entry.maxDurability ?? 5)
            : null,
          catalog_image: resolveCatalogImage(entry.image) ?? null,
          from_catalog: true,
          catalog_subcategory: entry.subcategory ?? null,
          catalog_tier: entry.tier ?? null,
          damage: entry.damage ?? null,
          da: entry.da != null ? String(entry.da) : null,
          effects: entry.effects,
          sort_order: bagId
            ? (bags.find((b) => b.id === bagId)?.items.length ?? 0)
            : items.length,
        })) as { item: ApiRawItem };
        const createdItem = mapApiItemToInventoryItem(res.item);
        if (bagId) {
          setBags((prev) =>
            prev.map((b) =>
              b.id === bagId
                ? {
                    ...b,
                    items: b.items.map((i) =>
                      i.id === tempId ? createdItem : i,
                    ),
                  }
                : b,
            ),
          );
        } else {
          setItems((prev) =>
            prev.map((i) => (i.id === tempId ? createdItem : i)),
          );
        }
      } catch {
        // Revert optimistic update
        if (bagId) {
          setBags((prev) =>
            prev.map((b) =>
              b.id === bagId
                ? { ...b, items: b.items.filter((i) => i.id !== tempId) }
                : b,
            ),
          );
        } else {
          setItems((prev) => prev.filter((i) => i.id !== tempId));
        }
      }
    } else {
      if (bagId) {
        saveBags(
          characterId,
          bags.map((b) =>
            b.id === bagId ? { ...b, items: [...b.items, newItem] } : b,
          ),
        );
      } else {
        saveInventory(characterId, [...items, newItem]);
      }
    }
  }

  async function handleCreateConfirm(data: ItemFormData) {
    if (modal?.mode !== "create" || !canEdit) return;
    const { bagId } = modal;
    const tempId = generateItemId();
    const newItem: InventoryItem = { id: tempId, ...buildItemFromForm(data) };

    if (bagId) {
      setBags((prev) =>
        prev.map((b) =>
          b.id === bagId ? { ...b, items: [...b.items, newItem] } : b,
        ),
      );
    } else {
      setItems((prev) => [...prev, newItem]);
    }
    setModal(null);

    if (isApiChar) {
      try {
        const res = (await api.inventory.createItem(characterId, {
          bag_id: bagId ?? null,
          name: data.name.trim(),
          description: data.description.trim(),
          weight: data.weight,
          is_equipment: data.isEquipment,
          max_durability: data.isEquipment ? data.maxDurability : null,
          current_durability: data.isEquipment ? data.maxDurability : null,
          image_url: data.image.trim() || null,
          damage: data.damage.trim() || null,
          da: data.da.trim() || null,
          effects: data.effects.filter((e) => e.trim()),
          sort_order: bagId
            ? (bags.find((b) => b.id === bagId)?.items.length ?? 0)
            : items.length,
        })) as { item: ApiRawItem };
        const createdItem = mapApiItemToInventoryItem(res.item);
        if (bagId) {
          setBags((prev) =>
            prev.map((b) =>
              b.id === bagId
                ? {
                    ...b,
                    items: b.items.map((i) =>
                      i.id === tempId ? createdItem : i,
                    ),
                  }
                : b,
            ),
          );
        } else {
          setItems((prev) =>
            prev.map((i) => (i.id === tempId ? createdItem : i)),
          );
        }
      } catch {
        if (bagId) {
          setBags((prev) =>
            prev.map((b) =>
              b.id === bagId
                ? { ...b, items: b.items.filter((i) => i.id !== tempId) }
                : b,
            ),
          );
        } else {
          setItems((prev) => prev.filter((i) => i.id !== tempId));
        }
      }
    } else {
      if (bagId) {
        saveBags(
          characterId,
          bags.map((b) =>
            b.id === bagId ? { ...b, items: [...b.items, newItem] } : b,
          ),
        );
      } else {
        saveInventory(characterId, [...items, newItem]);
      }
    }
  }

  function handleEditConfirm(data: ItemFormData) {
    if (modal?.mode !== "edit" || !canEdit) return;
    const { itemId, bagId } = modal;

    const existing = [...items, ...bags.flatMap((b) => b.items)].find(
      (i) => i.id === itemId,
    );
    const newCurrentDurability = data.isEquipment
      ? Math.min(
          existing?.currentDurability ?? data.maxDurability,
          data.maxDurability,
        )
      : undefined;

    const updatedFields: Partial<InventoryItem> = {
      name: data.name.trim(),
      description: data.description.trim(),
      weight: data.weight,
      isEquipment: data.isEquipment,
      maxDurability: data.isEquipment ? data.maxDurability : undefined,
      currentDurability: newCurrentDurability,
      image: data.image.trim() || undefined,
      damage: data.damage.trim() || null,
      da: data.da.trim() || null,
      effects: data.effects.filter((e) => e.trim()),
    };

    function applyUpdate(list: InventoryItem[]) {
      return list.map((i) =>
        i.id === itemId ? { ...i, ...updatedFields } : i,
      );
    }

    if (bagId) {
      setBags((prev) =>
        prev.map((b) =>
          b.id === bagId ? { ...b, items: applyUpdate(b.items) } : b,
        ),
      );
    } else {
      setItems(applyUpdate);
    }
    setModal(null);

    if (isApiChar) {
      void api.inventory.updateItem(characterId, itemId, {
        name: data.name.trim(),
        description: data.description.trim(),
        weight: data.weight,
        is_equipment: data.isEquipment,
        max_durability: data.isEquipment ? data.maxDurability : null,
        current_durability: newCurrentDurability ?? null,
        image_url: data.image.trim() || null,
        damage: data.damage.trim() || null,
        da: data.da.trim() || null,
        effects: data.effects.filter((e) => e.trim()),
      });
    } else {
      if (bagId) {
        saveBags(
          characterId,
          bags.map((b) =>
            b.id === bagId ? { ...b, items: applyUpdate(b.items) } : b,
          ),
        );
      } else {
        saveInventory(characterId, applyUpdate(items));
      }
    }
  }

  function handleDelete(itemId: string, bagId?: string) {
    if (!canEdit) return;
    if (bagId) {
      const next = bags.map((b) =>
        b.id === bagId
          ? { ...b, items: b.items.filter((i) => i.id !== itemId) }
          : b,
      );
      setBags(next);
      if (!isApiChar) saveBags(characterId, next);
    } else {
      const next = items.filter((i) => i.id !== itemId);
      setItems(next);
      if (!isApiChar) saveInventory(characterId, next);
    }
    if (isApiChar) {
      void api.inventory.deleteItem(characterId, itemId);
    }
  }

  function handleDurabilityChange(
    itemId: string,
    delta: number,
    bagId?: string,
  ) {
    function applyDelta(list: InventoryItem[]) {
      return list.map((item) => {
        if (item.id !== itemId || !item.isEquipment) return item;
        const maxDur = item.maxDurability ?? 0;
        const cur = item.currentDurability ?? maxDur;
        return {
          ...item,
          currentDurability: Math.max(0, Math.min(maxDur, cur + delta)),
        };
      });
    }

    let updatedItem: InventoryItem | undefined;
    if (bagId) {
      const next = bags.map((b) =>
        b.id === bagId ? { ...b, items: applyDelta(b.items) } : b,
      );
      setBags(next);
      updatedItem = next
        .find((b) => b.id === bagId)
        ?.items.find((i) => i.id === itemId);
      if (!isApiChar) saveBags(characterId, next);
    } else {
      const next = applyDelta(items);
      setItems(next);
      updatedItem = next.find((i) => i.id === itemId);
      if (!isApiChar) saveInventory(characterId, next);
    }

    if (isApiChar && updatedItem?.currentDurability !== undefined) {
      void api.inventory.updateItem(characterId, itemId, {
        current_durability: updatedItem.currentDurability,
      });
    }
  }

  /* ── Scroll lock ──────────────────────────────────────────────── */

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── Edit initial state ───────────────────────────────────────── */

  const editItem =
    modal?.mode === "edit"
      ? [...items, ...bags.flatMap((b) => b.items)].find(
          (i) => i.id === modal.itemId,
        )
      : undefined;

  const editInitial = editItem
    ? {
        name: editItem.name,
        description: editItem.description,
        weight: editItem.weight,
        isEquipment: editItem.isEquipment,
        maxDurability: editItem.maxDurability ?? 5,
        image: editItem.image ?? "",
        damage: editItem.damage ?? "",
        da: editItem.da ?? "",
        effects: editItem.effects ?? [],
      }
    : undefined;

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 90,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(2px)",
              }}
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: 720,
                maxWidth: "100vw",
                zIndex: 100,
                background: "linear-gradient(180deg, #0A0F1E 0%, #080C18 100%)",
                borderLeft: "1px solid rgba(42,58,96,0.7)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "-16px 0 48px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.25rem 1.25rem 1rem",
                  borderBottom: "1px solid rgba(42,58,96,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>🎒</span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#EEF4FC",
                      lineHeight: 1,
                    }}
                  >
                    Inventário
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 3,
                    }}
                  >
                    {items.length}/{totalSlots} slots base · Físico {fisico}
                    {bags.length > 0
                      ? ` · ${bags.length} mochila${bags.length > 1 ? "s" : ""}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "1rem",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Weight bar */}
              <div
                style={{
                  padding: "0.9rem 1.25rem",
                  borderBottom: "1px solid rgba(42,58,96,0.35)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    Carga
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: weightColor,
                      transition: "color 0.2s",
                    }}
                  >
                    {currentWeight}
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.65rem",
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 400,
                      }}
                    >
                      /{maxWeight}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(1, weightPct) * 100}%`,
                      background: weightColor,
                      borderRadius: 2,
                      transition: "width 0.25s, background 0.25s",
                    }}
                  />
                </div>
                {overDouble && (
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.6rem",
                      color: "#C05050",
                      marginTop: "0.35rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Carga crítica — 2× Desvantagem em todos os testes
                  </p>
                )}
                {overEncumbered && !overDouble && (
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.6rem",
                      color: "#C07030",
                      marginTop: "0.35rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Sobrecarga — Desvantagem em todos os testes
                  </p>
                )}
              </div>

              {/* Scrollable content */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Base inventory slots */}
                  <DroppableSection
                    id="base"
                    itemIds={items.map((i) => i.id)}
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.55rem",
                    }}
                  >
                    {Array.from({ length: totalSlots }, (_, i) => {
                      const item = items[i];
                      if (item) {
                        return (
                          <ItemCard
                            key={item.id}
                            item={item}
                            accentColor={accentColor}
                            onEdit={
                              canEdit
                                ? () =>
                                    setModal({ mode: "edit", itemId: item.id })
                                : undefined
                            }
                            onDelete={
                              canEdit ? () => handleDelete(item.id) : undefined
                            }
                            onDurabilityChange={(delta) =>
                              handleDurabilityChange(item.id, delta)
                            }
                            onZoom={setZoomedImage}
                            onRollDamage={handleRollDamage}
                          />
                        );
                      }
                      return (
                        <EmptySlot
                          key={`empty-${i}`}
                          accentColor={accentColor}
                          onClick={
                            canEdit
                              ? () => setModal({ mode: "create" })
                              : undefined
                          }
                        />
                      );
                    })}
                  </DroppableSection>

                  {/* Bag sections */}
                  {bags.map((bag) => (
                    <BagSection
                      key={bag.id}
                      bag={bag}
                      onRename={
                        canEdit ? (name) => renameBag(bag.id, name) : undefined
                      }
                      onChangeSlots={
                        canEdit
                          ? (delta) => changeBagSlots(bag.id, delta)
                          : undefined
                      }
                      onDeleteBag={
                        canEdit ? () => deleteBag(bag.id) : undefined
                      }
                      onOpenModal={
                        canEdit
                          ? () => setModal({ mode: "create", bagId: bag.id })
                          : undefined
                      }
                      onEdit={
                        canEdit
                          ? (itemId) =>
                              setModal({ mode: "edit", itemId, bagId: bag.id })
                          : undefined
                      }
                      onDelete={
                        canEdit
                          ? (itemId) => handleDelete(itemId, bag.id)
                          : undefined
                      }
                      onDurabilityChange={(itemId, delta) =>
                        handleDurabilityChange(itemId, delta, bag.id)
                      }
                      onZoom={setZoomedImage}
                      onRollDamage={handleRollDamage}
                    />
                  ))}

                  {/* Add bag button */}
                  {canEdit && (
                    <div style={{ padding: "0 0.75rem 1rem" }}>
                      <button
                        onClick={addBag}
                        style={{
                          width: "100%",
                          background: "rgba(200,146,42,0.06)",
                          border: "1px dashed rgba(200,146,42,0.3)",
                          borderRadius: 8,
                          padding: "0.7rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          transition: "background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(200,146,42,0.12)";
                          e.currentTarget.style.borderColor =
                            "rgba(200,146,42,0.55)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(200,146,42,0.06)";
                          e.currentTarget.style.borderColor =
                            "rgba(200,146,42,0.3)";
                        }}
                      >
                        <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>
                          🎒
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.65rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "rgba(200,146,42,0.7)",
                          }}
                        >
                          Adicionar Mochila
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* DragOverlay — ghost card while dragging */}
                <DragOverlay dropAnimation={null}>
                  {(() => {
                    if (!activeItemId) return null;
                    const activeItem =
                      items.find((i) => i.id === activeItemId) ??
                      bags
                        .flatMap((b) => b.items)
                        .find((i) => i.id === activeItemId) ??
                      null;
                    if (!activeItem) return null;
                    const inBag = bags.some((b) =>
                      b.items.find((i) => i.id === activeItemId),
                    );
                    return (
                      <ItemCard
                        item={activeItem}
                        accentColor={inBag ? "#E8B84B" : accentColor}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onDurabilityChange={() => {}}
                        overlay
                      />
                    );
                  })()}
                </DragOverlay>
              </DndContext>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modal !== null && (
          <ItemModal
            key="item-modal"
            isEdit={modal.mode === "edit"}
            initial={editInitial}
            onConfirm={
              modal.mode === "create" ? handleCreateConfirm : handleEditConfirm
            }
            onSelectCatalog={
              modal.mode === "create" ? handleCatalogSelect : undefined
            }
            onCancel={() => setModal(null)}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>

      {/* Image zoom overlay — outside motion.div to avoid transform containment */}
      <ImageZoomOverlay
        src={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </>
  );
}
