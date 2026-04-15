import type { InventoryBag } from "@/data/characterTypes";
import { DroppableSection } from "./DroppableSection";
import { ItemCard } from "./ItemCard";
import { EmptySlot } from "./EmptySlot";

const BAG_ACCENT = "#E8B84B";

export function BagSection({
  bag,
  onRename,
  onChangeSlots,
  onDeleteBag,
  onOpenModal,
  onEdit,
  onDelete,
  onDurabilityChange,
  onZoom,
  onRollDamage,
}: {
  bag: InventoryBag;
  onRename: (name: string) => void;
  onChangeSlots: (delta: number) => void;
  onDeleteBag: () => void;
  onOpenModal: (slotIdx: number) => void;
  onEdit: (slotIdx: number) => void;
  onDelete: (slotIdx: number) => void;
  onDurabilityChange: (slotIdx: number, delta: number) => void;
  onZoom: (src: string) => void;
  onRollDamage?: (damageStr: string, name: string) => void;
}) {
  return (
    <div
      style={{
        margin: "0 0.75rem 0.75rem",
        borderRadius: 8,
        border: "1px solid rgba(200,146,42,0.22)",
        background: "rgba(200,146,42,0.04)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Bag header */}
      <div
        style={{
          padding: "0.6rem 0.75rem",
          background: "rgba(200,146,42,0.09)",
          borderBottom: "1px solid rgba(200,146,42,0.18)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.9rem", lineHeight: 1, flexShrink: 0 }}>🎒</span>
        <input
          value={bag.name}
          onChange={(e) => onRename(e.target.value)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: BAG_ACCENT,
            minWidth: 0,
          }}
        />

        {/* Slot counter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
          <button
            disabled={bag.slots <= 1}
            onClick={() => onChangeSlots(-1)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 3,
              background: bag.slots > 1 ? "rgba(200,146,42,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${bag.slots > 1 ? "rgba(200,146,42,0.5)" : "rgba(255,255,255,0.07)"}`,
              color: bag.slots > 1 ? BAG_ACCENT : "rgba(255,255,255,0.15)",
              fontSize: "0.85rem",
              lineHeight: 1,
              cursor: bag.slots > 1 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            −
          </button>
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              minWidth: 40,
              textAlign: "center",
            }}
          >
            {bag.items.length}/{bag.slots} slots
          </span>
          <button
            onClick={() => onChangeSlots(+1)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 3,
              background: "rgba(200,146,42,0.2)",
              border: "1px solid rgba(200,146,42,0.5)",
              color: BAG_ACCENT,
              fontSize: "0.85rem",
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>

        {/* Delete bag */}
        <button
          onClick={onDeleteBag}
          title="Remover mochila"
          style={{
            background: "none",
            border: "none",
            color: "rgba(200,60,60,0.45)",
            fontSize: "1rem",
            cursor: "pointer",
            lineHeight: 1,
            flexShrink: 0,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>

      {/* Bag item slots */}
      <DroppableSection
        id={bag.id}
        itemIds={bag.items.map((i) => i.id)}
        style={{
          padding: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {Array.from({ length: bag.slots }, (_, i) => {
          const item = bag.items[i];
          if (item) {
            return (
              <ItemCard
                key={item.id}
                item={item}
                accentColor={BAG_ACCENT}
                onEdit={() => onEdit(i)}
                onDelete={() => onDelete(i)}
                onDurabilityChange={(delta) => onDurabilityChange(i, delta)}
                onZoom={onZoom}
                onRollDamage={onRollDamage}
              />
            );
          }
          return (
            <EmptySlot
              key={`bag-${bag.id}-empty-${i}`}
              accentColor={BAG_ACCENT}
              onClick={() => onOpenModal(i)}
            />
          );
        })}
      </DroppableSection>
    </div>
  );
}
