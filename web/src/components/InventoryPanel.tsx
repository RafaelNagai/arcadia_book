import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem, WeightCategory } from "@/data/characterTypes";
import { WEIGHT_VALUES, WEIGHT_LABELS } from "@/data/characterTypes";
import { loadInventory, saveInventory } from "@/lib/localCharacters";

/* ─── Constants ─────────────────────────────────────────────────── */

const WEIGHT_OPTIONS: { value: WeightCategory; num: number }[] = [
  { value: "nulo", num: 0 },
  { value: "super_leve", num: 1 },
  { value: "leve", num: 2 },
  { value: "medio", num: 4 },
  { value: "pesado", num: 8 },
  { value: "super_pesado", num: 16 },
  { value: "massivo", num: 32 },
  { value: "hyper_massivo", num: 64 },
];

function generateItemId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ─── Shared styles ─────────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-ui)",
  fontSize: "0.6rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "0.3rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 4,
  color: "#EEF4FC",
  fontFamily: "var(--font-ui)",
  fontSize: "0.85rem",
  padding: "0.4rem 0.55rem",
  outline: "none",
  boxSizing: "border-box",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 4,
  color: "rgba(255,255,255,0.45)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.75rem",
  letterSpacing: "0.1em",
  padding: "0.4rem 0.9rem",
  cursor: "pointer",
};

/* ─── Item form ─────────────────────────────────────────────────── */

interface ItemFormData {
  name: string;
  description: string;
  weight: WeightCategory;
  isEquipment: boolean;
  maxDurability: number;
}

const DEFAULT_FORM: ItemFormData = {
  name: "",
  description: "",
  weight: "medio",
  isEquipment: false,
  maxDurability: 5,
};

function ItemModal({
  initial,
  onConfirm,
  onCancel,
  accentColor,
}: {
  initial?: ItemFormData;
  onConfirm: (data: ItemFormData) => void;
  onCancel: () => void;
  accentColor: string;
}) {
  const [form, setForm] = useState<ItemFormData>(initial ?? DEFAULT_FORM);
  const [nameError, setNameError] = useState(false);

  function handleConfirm() {
    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    onConfirm(form);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        style={{
          background: "#0A0F1E",
          border: "1px solid rgba(42,58,96,0.9)",
          borderRadius: 8,
          padding: "1.5rem",
          width: 380,
          maxWidth: "calc(100vw - 2rem)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#EEF4FC",
            marginBottom: "1.25rem",
          }}
        >
          {initial ? "Editar Item" : "Novo Item"}
        </p>

        {/* Name */}
        <label style={{ display: "block", marginBottom: "0.875rem" }}>
          <span style={labelStyle}>Nome *</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setNameError(false);
              setForm((f) => ({ ...f, name: e.target.value }));
            }}
            placeholder="Ex: Espada do Viajante"
            style={{
              ...inputStyle,
              borderColor: nameError
                ? "rgba(200,60,60,0.7)"
                : "rgba(255,255,255,0.12)",
            }}
            autoFocus
          />
          {nameError && (
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.65rem",
                color: "#D04040",
                marginTop: 3,
                display: "block",
              }}
            >
              O nome é obrigatório
            </span>
          )}
        </label>

        {/* Description */}
        <label style={{ display: "block", marginBottom: "0.875rem" }}>
          <span style={labelStyle}>Descrição</span>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Descreva o item..."
            rows={2}
            style={{ ...inputStyle, resize: "vertical", minHeight: 150 }}
          />
        </label>

        {/* Weight */}
        <label style={{ display: "block", marginBottom: "0.875rem" }}>
          <span style={labelStyle}>Peso</span>
          <select
            value={form.weight}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                weight: e.target.value as WeightCategory,
              }))
            }
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {WEIGHT_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                style={{ background: "#0A0F1E" }}
              >
                {WEIGHT_LABELS[o.value]} ({o.num})
              </option>
            ))}
          </select>
        </label>

        {/* isEquipment */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: form.isEquipment ? "0.875rem" : "1.25rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isEquipment}
            onChange={(e) =>
              setForm((f) => ({ ...f, isEquipment: e.target.checked }))
            }
            style={{ width: 14, height: 14, accentColor }}
          />
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Possui durabilidade (equipamento)
          </span>
        </label>

        {/* maxDurability */}
        {form.isEquipment && (
          <label style={{ display: "block", marginBottom: "1.25rem" }}>
            <span style={labelStyle}>Durabilidade Máxima</span>
            <input
              type="number"
              min={1}
              max={99}
              value={form.maxDurability}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  maxDurability: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              style={{ ...inputStyle, width: 80 }}
            />
          </label>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onCancel} style={cancelBtnStyle}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              background: accentColor + "22",
              border: `1px solid ${accentColor}88`,
              borderRadius: 4,
              color: accentColor,
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              padding: "0.4rem 0.9rem",
              cursor: "pointer",
            }}
          >
            {initial ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Slot card ─────────────────────────────────────────────────── */

function WeightBadge({ weight }: { weight: WeightCategory }) {
  const val = WEIGHT_VALUES[weight];
  const label = WEIGHT_LABELS[weight];
  const color =
    val === 0
      ? "rgba(255,255,255,0.25)"
      : val <= 2
        ? "#6EC840"
        : val <= 8
          ? "#C8922A"
          : "#C05050";

  return (
    <span
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.55rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 3,
        padding: "1px 5px",
        flexShrink: 0,
      }}
    >
      {label} · {val}
    </span>
  );
}

function ItemCard({
  item,
  accentColor,
  onEdit,
  onDelete,
  onDurabilityChange,
}: {
  item: InventoryItem;
  accentColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onDurabilityChange: (delta: number) => void;
}) {
  const dur = item.currentDurability ?? item.maxDurability ?? 0;
  const maxDur = item.maxDurability ?? 0;
  const durPct = maxDur > 0 ? dur / maxDur : 0;
  const durColor =
    durPct > 0.6 ? "#6EC840" : durPct > 0.3 ? "#C8922A" : "#C05050";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 5,
        padding: "0.7rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#EEF4FC",
            flex: 1,
            lineHeight: 1.2,
          }}
        >
          {item.name}
        </p>
        <button
          onClick={onEdit}
          title="Editar item"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.25)",
            fontSize: "0.75rem",
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          title="Remover item"
          style={{
            background: "none",
            border: "none",
            color: "rgba(200,60,60,0.45)",
            fontSize: "0.8rem",
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Weight badge */}
      <div>
        <WeightBadge weight={item.weight} />
      </div>

      {/* Description */}
      {item.description && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "rgba(200, 220, 240, 0.85)",
            fontStyle: "normal",
            lineHeight: 1.35,
          }}
        >
          {item.description}
        </p>
      )}

      {/* Durability */}
      {item.isEquipment && (
        <div style={{ marginTop: 2 }}>
          {/* Bar */}
          <div
            style={{
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.07)",
              marginBottom: "0.4rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${durPct * 100}%`,
                background: durColor,
                borderRadius: 2,
                transition: "width 0.2s, background 0.2s",
              }}
            />
          </div>
          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                flex: 1,
              }}
            >
              Durabilidade
            </span>
            <button
              disabled={dur <= 0}
              onClick={() => onDurabilityChange(-1)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 3,
                background:
                  dur > 0 ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${dur > 0 ? accentColor + "55" : "rgba(255,255,255,0.07)"}`,
                color: dur > 0 ? accentColor : "rgba(255,255,255,0.15)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.9rem",
                lineHeight: 1,
                cursor: dur > 0 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: durColor,
                minWidth: 28,
                textAlign: "center",
              }}
            >
              {dur}
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 400,
                }}
              >
                /{maxDur}
              </span>
            </span>
            <button
              disabled={dur >= maxDur}
              onClick={() => onDurabilityChange(+1)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 3,
                background:
                  dur < maxDur ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${dur < maxDur ? accentColor + "55" : "rgba(255,255,255,0.07)"}`,
                color: dur < maxDur ? accentColor : "rgba(255,255,255,0.15)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.9rem",
                lineHeight: 1,
                cursor: dur < maxDur ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptySlot({
  onClick,
  accentColor,
}: {
  onClick: () => void;
  accentColor: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px dashed rgba(255,255,255,0.1)",
        borderRadius: 5,
        padding: "0.9rem 0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        width: "100%",
        textAlign: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${accentColor}0A`;
        e.currentTarget.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.015)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <span
        style={{
          fontSize: "1rem",
          color: `${accentColor}66`,
          lineHeight: 1,
        }}
      >
        +
      </span>
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        Slot vazio
      </span>
    </button>
  );
}

/* ─── Main panel ────────────────────────────────────────────────── */

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

  // modal state: null = closed, 'create' = new item, slotIdx = edit slot item
  const [modal, setModal] = useState<
    | null
    | { mode: "create"; slotIdx: number }
    | { mode: "edit"; slotIdx: number }
  >(null);

  const currentWeight = items.reduce(
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

  function persist(next: InventoryItem[]) {
    setItems(next);
    saveInventory(characterId, next);
  }

  function handleCreateConfirm(data: ItemFormData) {
    if (modal?.mode !== "create") return;
    const slotIdx = modal.slotIdx;
    const newItem: InventoryItem = {
      id: generateItemId(),
      name: data.name.trim(),
      description: data.description.trim(),
      weight: data.weight,
      isEquipment: data.isEquipment,
      maxDurability: data.isEquipment ? data.maxDurability : undefined,
      currentDurability: data.isEquipment ? data.maxDurability : undefined,
    };
    // Insert at slotIdx position (fill the specific slot)
    const next = [...items];
    // Remove any existing item at that slot position if somehow set
    // items are stored in order by slot; just splice at slotIdx
    next.splice(slotIdx, 0, newItem);
    persist(next.slice(0, totalSlots));
    setModal(null);
  }

  function handleEditConfirm(data: ItemFormData) {
    if (modal?.mode !== "edit") return;
    const slotIdx = modal.slotIdx;
    const existing = items[slotIdx];
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
    };
    const next = [...items];
    next[slotIdx] = updated;
    persist(next);
    setModal(null);
  }

  function handleDelete(slotIdx: number) {
    const next = items.filter((_, i) => i !== slotIdx);
    persist(next);
  }

  function handleDurabilityChange(slotIdx: number, delta: number) {
    const next = items.map((item, i) => {
      if (i !== slotIdx || !item.isEquipment) return item;
      const maxDur = item.maxDurability ?? 0;
      const cur = item.currentDurability ?? maxDur;
      return {
        ...item,
        currentDurability: Math.max(0, Math.min(maxDur, cur + delta)),
      };
    });
    persist(next);
  }

  const modalInitial =
    modal?.mode === "edit"
      ? {
          name: items[modal.slotIdx].name,
          description: items[modal.slotIdx].description,
          weight: items[modal.slotIdx].weight,
          isEquipment: items[modal.slotIdx].isEquipment,
          maxDurability: items[modal.slotIdx].maxDurability ?? 5,
        }
      : undefined;

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
                width: 460,
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
                    {items.length}/{totalSlots} slots · Físico {fisico}
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

              {/* Weight summary */}
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
                      color: overEncumbered ? "#C05050" : weightColor,
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
                      background: overEncumbered ? "#C05050" : weightColor,
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

              {/* Slots list */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
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
                      />
                    );
                  }
                  return (
                    <EmptySlot
                      key={`empty-${i}`}
                      accentColor={accentColor}
                      onClick={() => setModal({ mode: "create", slotIdx: i })}
                    />
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal !== null && (
          <ItemModal
            key="item-modal"
            initial={modalInitial}
            onConfirm={
              modal.mode === "create" ? handleCreateConfirm : handleEditConfirm
            }
            onCancel={() => setModal(null)}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>
    </>
  );
}
