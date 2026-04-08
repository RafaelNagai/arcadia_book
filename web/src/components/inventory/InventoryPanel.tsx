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
import { generateItemId, resolveCatalogImage } from "./types";
import type { CatalogEntry, ItemFormData } from "./types";
import { ItemCard } from "./ItemCard";
import { ItemModal } from "./ItemModal";
import { EmptySlot } from "./EmptySlot";
import { DroppableSection } from "./DroppableSection";
import { BagSection } from "./BagSection";

export function InventoryPanel({
  characterId,
  fisico,
  accentColor,
  isOpen,
  onClose,
}: {
  characterId: string;
  fisico: number;
  accentColor: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const totalSlots = 3 + fisico;
  const maxWeight = 15 + fisico * 5;

  const [items, setItems] = useState<InventoryItem[]>(() =>
    loadInventory(characterId),
  );
  const [bags, setBags] = useState<InventoryBag[]>(() =>
    loadBags(characterId),
  );
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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

  /* ── Persistence helpers ──────────────────────────────────────── */

  function persist(next: InventoryItem[]) {
    setItems(next);
    saveInventory(characterId, next);
  }

  function persistBags(next: InventoryBag[]) {
    setBags(next);
    saveBags(characterId, next);
  }

  function updateBag(bagId: string, fn: (bag: InventoryBag) => InventoryBag) {
    persistBags(bags.map((b) => (b.id === bagId ? fn(b) : b)));
  }

  /* ── Bag management ───────────────────────────────────────────── */

  function addBag() {
    const newBag: InventoryBag = {
      id: `bag_${Date.now()}`,
      name: "Mochila",
      slots: 4,
      items: [],
    };
    persistBags([...bags, newBag]);
  }

  function deleteBag(bagId: string) {
    persistBags(bags.filter((b) => b.id !== bagId));
  }

  function renameBag(bagId: string, name: string) {
    updateBag(bagId, (b) => ({ ...b, name }));
  }

  function changeBagSlots(bagId: string, delta: number) {
    updateBag(bagId, (b) => ({
      ...b,
      slots: Math.max(1, b.slots + delta),
    }));
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
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainerId = findContainerIdOf(activeId);
    const overContainerId =
      findContainerIdOf(overId) ??
      (overId === "base" || bags.find((b) => b.id === overId) ? overId : null);

    if (!activeContainerId || !overContainerId) return;

    if (activeContainerId === overContainerId) {
      // Same container: reorder
      if (activeContainerId === "base") {
        const oldIdx = items.findIndex((i) => i.id === activeId);
        const newIdx = items.findIndex((i) => i.id === overId);
        if (oldIdx < 0 || newIdx < 0) return;
        persist(arrayMove(items, oldIdx, newIdx));
      } else {
        persistBags(
          bags.map((b) => {
            if (b.id !== activeContainerId) return b;
            const oldIdx = b.items.findIndex((i) => i.id === activeId);
            const newIdx = b.items.findIndex((i) => i.id === overId);
            if (oldIdx < 0 || newIdx < 0) return b;
            return { ...b, items: arrayMove(b.items, oldIdx, newIdx) };
          }),
        );
      }
    } else {
      // Cross-container: move item
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
        setItems(newSrc);
        saveInventory(characterId, newSrc);
        persistBags(
          bags.map((b) =>
            b.id === overContainerId ? { ...b, items: newDst } : b,
          ),
        );
      } else if (overContainerId === "base") {
        persist(newDst);
        persistBags(
          bags.map((b) =>
            b.id === activeContainerId ? { ...b, items: newSrc } : b,
          ),
        );
      } else {
        persistBags(
          bags.map((b) => {
            if (b.id === activeContainerId) return { ...b, items: newSrc };
            if (b.id === overContainerId) return { ...b, items: newDst };
            return b;
          }),
        );
      }
    }
  }

  /* ── Modal state ──────────────────────────────────────────────── */

  const [modal, setModal] = useState<
    | null
    | { mode: "create"; slotIdx: number; bagId?: string }
    | { mode: "edit"; slotIdx: number; bagId?: string }
  >(null);

  /* ── Item CRUD ────────────────────────────────────────────────── */

  function buildItem(data: ItemFormData): InventoryItem {
    return {
      id: generateItemId(),
      name: data.name.trim(),
      description: data.description.trim(),
      weight: data.weight,
      isEquipment: data.isEquipment,
      maxDurability: data.isEquipment ? data.maxDurability : undefined,
      currentDurability: data.isEquipment ? data.maxDurability : undefined,
      image: data.image.trim() || undefined,
      damage: data.damage.trim() || null,
      effects: data.effects.filter((e) => e.trim()),
    };
  }

  function handleCatalogSelect(entry: CatalogEntry) {
    if (modal?.mode !== "create") return;
    const { slotIdx, bagId } = modal;
    const newItem: InventoryItem = {
      id: generateItemId(),
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
      effects: entry.effects,
    };
    if (bagId) {
      updateBag(bagId, (b) => {
        const next = [...b.items];
        next.splice(slotIdx, 0, newItem);
        return { ...b, items: next.slice(0, b.slots) };
      });
    } else {
      const next = [...items];
      next.splice(slotIdx, 0, newItem);
      persist(next.slice(0, totalSlots));
    }
    setModal(null);
  }

  function handleCreateConfirm(data: ItemFormData) {
    if (modal?.mode !== "create") return;
    const { slotIdx, bagId } = modal;
    const newItem = buildItem(data);
    if (bagId) {
      updateBag(bagId, (b) => {
        const next = [...b.items];
        next.splice(slotIdx, 0, newItem);
        return { ...b, items: next.slice(0, b.slots) };
      });
    } else {
      const next = [...items];
      next.splice(slotIdx, 0, newItem);
      persist(next.slice(0, totalSlots));
    }
    setModal(null);
  }

  function handleEditConfirm(data: ItemFormData) {
    if (modal?.mode !== "edit") return;
    const { slotIdx, bagId } = modal;
    if (bagId) {
      updateBag(bagId, (b) => {
        const existing = b.items[slotIdx];
        const customUrl = data.image.trim();
        const updated: InventoryItem = {
          ...existing,
          name: data.name.trim(),
          description: data.description.trim(),
          weight: data.weight,
          isEquipment: data.isEquipment,
          maxDurability: data.isEquipment ? data.maxDurability : undefined,
          currentDurability: data.isEquipment
            ? Math.min(
                existing.currentDurability ?? data.maxDurability,
                data.maxDurability,
              )
            : undefined,
          image: customUrl || undefined,
          damage: data.damage.trim() || null,
          effects: data.effects.filter((e) => e.trim()),
        };
        const next = [...b.items];
        next[slotIdx] = updated;
        return { ...b, items: next };
      });
    } else {
      const existing = items[slotIdx];
      const customUrl = data.image.trim();
      const updated: InventoryItem = {
        ...existing,
        name: data.name.trim(),
        description: data.description.trim(),
        weight: data.weight,
        isEquipment: data.isEquipment,
        maxDurability: data.isEquipment ? data.maxDurability : undefined,
        currentDurability: data.isEquipment
          ? Math.min(
              existing.currentDurability ?? data.maxDurability,
              data.maxDurability,
            )
          : undefined,
        image: customUrl || undefined,
        damage: data.damage.trim() || null,
        effects: data.effects.filter((e) => e.trim()),
      };
      const next = [...items];
      next[slotIdx] = updated;
      persist(next);
    }
    setModal(null);
  }

  function handleDelete(slotIdx: number, bagId?: string) {
    if (bagId) {
      updateBag(bagId, (b) => ({
        ...b,
        items: b.items.filter((_, i) => i !== slotIdx),
      }));
    } else {
      persist(items.filter((_, i) => i !== slotIdx));
    }
  }

  function handleDurabilityChange(
    slotIdx: number,
    delta: number,
    bagId?: string,
  ) {
    function applyDelta(list: InventoryItem[]) {
      return list.map((item, i) => {
        if (i !== slotIdx || !item.isEquipment) return item;
        const maxDur = item.maxDurability ?? 0;
        const cur = item.currentDurability ?? maxDur;
        return {
          ...item,
          currentDurability: Math.max(0, Math.min(maxDur, cur + delta)),
        };
      });
    }
    if (bagId) {
      updateBag(bagId, (b) => ({ ...b, items: applyDelta(b.items) }));
    } else {
      persist(applyDelta(items));
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
      ? modal.bagId
        ? bags.find((b) => b.id === modal.bagId)?.items[modal.slotIdx]
        : items[modal.slotIdx]
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
                width: 520,
                maxWidth: "100vw",
                zIndex: 100,
                background:
                  "linear-gradient(180deg, #0A0F1E 0%, #080C18 100%)",
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
                            onEdit={() => setModal({ mode: "edit", slotIdx: i })}
                            onDelete={() => handleDelete(i)}
                            onDurabilityChange={(delta) =>
                              handleDurabilityChange(i, delta)
                            }
                            onZoom={setZoomedImage}
                          />
                        );
                      }
                      return (
                        <EmptySlot
                          key={`empty-${i}`}
                          accentColor={accentColor}
                          onClick={() =>
                            setModal({ mode: "create", slotIdx: i })
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
                      onRename={(name) => renameBag(bag.id, name)}
                      onChangeSlots={(delta) => changeBagSlots(bag.id, delta)}
                      onDeleteBag={() => deleteBag(bag.id)}
                      onOpenModal={(slotIdx) =>
                        setModal({ mode: "create", slotIdx, bagId: bag.id })
                      }
                      onEdit={(slotIdx) =>
                        setModal({ mode: "edit", slotIdx, bagId: bag.id })
                      }
                      onDelete={(slotIdx) => handleDelete(slotIdx, bag.id)}
                      onDurabilityChange={(slotIdx, delta) =>
                        handleDurabilityChange(slotIdx, delta, bag.id)
                      }
                      onZoom={setZoomedImage}
                    />
                  ))}

                  {/* Add bag button */}
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
      {zoomedImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt=""
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 6,
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
