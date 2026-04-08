import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryBag, InventoryItem, WeightCategory } from "@/data/characterTypes";
import { WEIGHT_VALUES, WEIGHT_LABELS } from "@/data/characterTypes";
import { loadInventory, saveInventory, loadBags, saveBags } from "@/lib/localCharacters";
import catalogData from "@equipment";

/* ─── Catalog types ─────────────────────────────────────────────── */

interface CatalogEntry {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  tier: string;
  damage: string | null;
  weight: WeightCategory;
  isEquipment: boolean;
  maxDurability: number | null;
  effects: string[];
  description: string;
  image: string | null;
}

const CATALOG: CatalogEntry[] = catalogData as CatalogEntry[];

const TIER_COLOR: Record<string, string> = {
  SS: "#E8B84B",
  S: "#C8922A",
  A: "#C090F0",
  B: "#50C8E8",
  C: "#6FC892",
  D: "#A09880",
  E: "#6A7080",
};

/* ─── Helpers ───────────────────────────────────────────────────── */

function generateItemId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

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

/* ─── Item form data ────────────────────────────────────────────── */

interface ItemFormData {
  name: string;
  description: string;
  weight: WeightCategory;
  isEquipment: boolean;
  maxDurability: number;
  image: string;
  damage: string;
  effects: string[];
}

const DEFAULT_FORM: ItemFormData = {
  name: "",
  description: "",
  weight: "medio",
  isEquipment: false,
  maxDurability: 5,
  image: "",
  damage: "",
  effects: [],
};

/** Resolve a catalog image path to a web-accessible URL. */
function resolveCatalogImage(path: string | null | undefined): string | null {
  if (!path) return null;
  // Paths in equipment.json are relative to public/ — prefix with /
  return path.startsWith("http") ? path : `/${path}`;
}

/* ─── Modal ─────────────────────────────────────────────────────── */

type ModalTab = "catalog" | "custom";

function ItemModal({
  initial,
  isEdit,
  onConfirm,
  onSelectCatalog,
  onCancel,
  accentColor,
}: {
  initial?: ItemFormData;
  isEdit: boolean;
  onConfirm: (data: ItemFormData) => void;
  onSelectCatalog?: (entry: CatalogEntry) => void;
  onCancel: () => void;
  accentColor: string;
}) {
  const [tab, setTab] = useState<ModalTab>(isEdit ? "custom" : "catalog");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ItemFormData>(initial ?? DEFAULT_FORM);
  const [nameError, setNameError] = useState(false);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.tier.toLowerCase() === q,
    );
  }, [search]);

  function handleConfirm() {
    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    onConfirm(form);
  }

  const confirmBtnStyle: React.CSSProperties = {
    background: accentColor + "22",
    border: `1px solid ${accentColor}88`,
    borderRadius: 4,
    color: accentColor,
    fontFamily: "var(--font-ui)",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
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
          width: 420,
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.85)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "1.1rem 1.25rem 0",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#EEF4FC",
              marginBottom: "0.9rem",
            }}
          >
            {isEdit ? "Editar Item" : "Adicionar ao Inventário"}
          </p>

          {/* Tabs — only show when creating */}
          {!isEdit && (
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 0,
              }}
            >
              {(["catalog", "custom"] as ModalTab[]).map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: active
                        ? `2px solid ${accentColor}`
                        : "2px solid transparent",
                      color: active ? accentColor : "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      padding: "0.45rem 0.75rem",
                      cursor: "pointer",
                      marginBottom: -1,
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {t === "catalog" ? "Catálogo" : "Personalizado"}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem" }}>
          {tab === "catalog" ? (
            /* ── Catalog search ── */
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, categoria ou tier (ex: A, espada...)"
                style={{ ...inputStyle, marginBottom: "0.75rem" }}
                autoFocus
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {filteredCatalog.length === 0 && (
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      padding: "1.5rem 0",
                    }}
                  >
                    Nenhum item encontrado
                  </p>
                )}
                {filteredCatalog.map((entry) => {
                  const tierColor = TIER_COLOR[entry.tier] ?? "#A09880";
                  return (
                    <button
                      key={entry.id}
                      onClick={() => onSelectCatalog?.(entry)}
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 5,
                        padding: "0.6rem 0.75rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.12s, border-color 0.12s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${accentColor}12`;
                        e.currentTarget.style.borderColor = `${accentColor}44`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.025)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.07)";
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 4,
                          overflow: "hidden",
                          background: "rgba(0,0,0,0.3)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {resolveCatalogImage(entry.image) ? (
                          <img
                            src={resolveCatalogImage(entry.image)!}
                            alt={entry.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "1.1rem",
                              lineHeight: 1,
                              opacity: 0.25,
                              userSelect: "none",
                            }}
                          >
                            ?
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#EEF4FC",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {entry.name}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontSize: "0.55rem",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              color: tierColor,
                              background: `${tierColor}18`,
                              border: `1px solid ${tierColor}44`,
                              borderRadius: 3,
                              padding: "1px 4px",
                              flexShrink: 0,
                            }}
                          >
                            {entry.tier}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.6rem",
                            color: "rgba(255,255,255,0.3)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {entry.subcategory} · {WEIGHT_LABELS[entry.weight]} (
                          {WEIGHT_VALUES[entry.weight]})
                          {entry.isEquipment && entry.maxDurability != null
                            ? ` · Dur. ${entry.maxDurability}`
                            : ""}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: `${accentColor}88`,
                          flexShrink: 0,
                        }}
                      >
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Custom / edit form ── */
            <div>
              {false && !isEdit && (
                <div
                  style={{
                    background: `${accentColor}12`,
                    border: `1px solid ${accentColor}33`,
                    borderRadius: 4,
                    padding: "0.5rem 0.7rem",
                    marginBottom: "0.875rem",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.65rem",
                    color: accentColor,
                    letterSpacing: "0.05em",
                  }}
                >
                  Preenchido com dados do catálogo — edite à vontade antes de
                  confirmar.
                </div>
              )}

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
                  autoFocus={isEdit}
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
                  style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
                />
              </label>

              {/* Damage */}
              <label style={{ display: "block", marginBottom: "0.875rem" }}>
                <span style={labelStyle}>Damage</span>
                <input
                  type="text"
                  value={form.damage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, damage: e.target.value }))
                  }
                  placeholder="Ex: 2D6, 1D8+2..."
                  style={inputStyle}
                />
              </label>

              {/* Effects */}
              <div style={{ marginBottom: "0.875rem" }}>
                <span style={labelStyle}>Efeitos</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  {form.effects.map((effect, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={effect}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...f.effects];
                            next[i] = e.target.value;
                            return { ...f, effects: next };
                          })
                        }
                        placeholder={`Efeito ${i + 1}`}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            effects: f.effects.filter((_, idx) => idx !== i),
                          }))
                        }
                        style={{
                          background: "none",
                          border: "1px solid rgba(200,60,60,0.3)",
                          borderRadius: 4,
                          color: "rgba(200,60,60,0.6)",
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.85rem",
                          width: 28,
                          height: 28,
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, effects: [...f.effects, ""] }))
                    }
                    style={{
                      background: `${accentColor}0D`,
                      border: `1px dashed ${accentColor}44`,
                      borderRadius: 4,
                      color: accentColor,
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "0.35rem 0.6rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    + Adicionar efeito
                  </button>
                </div>
              </div>

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
                  marginBottom: "0.875rem",
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
                <label style={{ display: "block", marginBottom: "0.875rem" }}>
                  <span style={labelStyle}>Durabilidade Máxima</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={form.maxDurability}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxDurability: Math.max(
                          1,
                          parseInt(e.target.value) || 1,
                        ),
                      }))
                    }
                    style={{ ...inputStyle, width: 80 }}
                  />
                </label>
              )}

              {/* Image URL */}
              <label style={{ display: "block", marginBottom: "1.25rem" }}>
                <span style={labelStyle}>URL da imagem</span>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                  placeholder={
                    isEdit && initial && !initial.image
                      ? "Deixe em branco para manter a imagem original"
                      : "https://..."
                  }
                  style={inputStyle}
                />
                {form.image && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      borderRadius: 4,
                      overflow: "hidden",
                      height: 80,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <img
                      src={form.image}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <button onClick={onCancel} style={cancelBtnStyle}>
            Cancelar
          </button>
          {tab === "custom" || isEdit ? (
            <button onClick={handleConfirm} style={confirmBtnStyle}>
              {isEdit ? "Salvar" : "Adicionar"}
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Weight badge ──────────────────────────────────────────────── */

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

/* ─── Item card ─────────────────────────────────────────────────── */

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
  const [zoomed, setZoomed] = useState(false);
  const dur = item.currentDurability ?? item.maxDurability ?? 0;
  const maxDur = item.maxDurability ?? 0;
  const durPct = maxDur > 0 ? dur / maxDur : 0;
  const durColor =
    durPct > 0.6 ? "#6EC840" : durPct > 0.3 ? "#C8922A" : "#C05050";
  // Custom URL overrides catalog image; catalog image is the fallback
  const displayImage = item.image || item.catalogImage || null;

  return (
    <>
      {/* Zoom overlay */}
      {zoomed && displayImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setZoomed(false)}
        >
          <img
            src={displayImage}
            alt={item.name}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 6,
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
          />
        </div>
      )}

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 5,
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
        }}
      >
        {/* Left image column */}
        <div
          style={{
            width: 88,
            flexShrink: 0,
            background: "rgba(0,0,0,0.3)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: displayImage ? "zoom-in" : "default",
          }}
          onClick={() => displayImage && setZoomed(true)}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={item.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          ) : (
            <span
              style={{ fontSize: "1.4rem", opacity: 0.15, userSelect: "none" }}
            >
              ?
            </span>
          )}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "0.7rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {/* Header row */}
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}
          >
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
          {item.fromCatalog ? (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                color: "rgba(200, 220, 240, 0.8)",
                lineHeight: 1.4,
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
              }}
            >
              {/* Header line: subcategory[tier]: description */}
              <p>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>
                  {item.catalogSubcategory}
                  {item.catalogTier && (
                    <span
                      style={{
                        color: TIER_COLOR[item.catalogTier] ?? "#A09880",
                      }}
                    >
                      [{item.catalogTier}]
                    </span>
                  )}
                  {item.description ? ": " : ""}
                </span>
                {item.description}
              </p>
              {/* Damage */}
              {item.damage && (
                <p>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Damage:{" "}
                  </span>
                  <span
                    style={{
                      color: "#E8803A",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {item.damage}
                  </span>
                </p>
              )}
              {/* Effects */}
              {item.effects &&
                item.effects.length > 0 &&
                item.effects.map((effect, i) => (
                  <p key={i} style={{ color: "rgba(192,144,240,0.85)" }}>
                    • {effect}
                  </p>
                ))}
            </div>
          ) : item.description ||
            item.damage ||
            (item.effects && item.effects.length > 0) ? (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                color: "rgba(200, 220, 240, 0.8)",
                lineHeight: 1.4,
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
              }}
            >
              {item.description && <p>{item.description}</p>}
              {item.damage && (
                <p>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Damage:{" "}
                  </span>
                  <span
                    style={{
                      color: "#E8803A",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {item.damage}
                  </span>
                </p>
              )}
              {item.effects &&
                item.effects.map((effect, i) => (
                  <p key={i} style={{ color: "rgba(192,144,240,0.85)" }}>
                    • {effect}
                  </p>
                ))}
            </div>
          ) : null}

          {/* Durability */}
          {item.isEquipment && (
            <div style={{ marginTop: 2 }}>
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
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
                      dur < maxDur
                        ? `${accentColor}18`
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${dur < maxDur ? accentColor + "55" : "rgba(255,255,255,0.07)"}`,
                    color:
                      dur < maxDur ? accentColor : "rgba(255,255,255,0.15)",
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
      </div>
    </>
  );
}

/* ─── Empty slot ────────────────────────────────────────────────── */

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
        flexShrink: 0,
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
        style={{ fontSize: "1rem", color: `${accentColor}66`, lineHeight: 1 }}
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
  const [bags, setBags] = useState<InventoryBag[]>(() =>
    loadBags(characterId),
  );

  const [modal, setModal] = useState<
    | null
    | { mode: "create"; slotIdx: number; bagId?: string }
    | { mode: "edit"; slotIdx: number; bagId?: string }
  >(null);

  const allItems = [
    ...items,
    ...bags.flatMap((b) => b.items),
  ];
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
      currentDurability: entry.isEquipment ? (entry.maxDurability ?? 5) : undefined,
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
            ? Math.min(existing.currentDurability ?? data.maxDurability, data.maxDurability)
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
          ? Math.min(existing.currentDurability ?? data.maxDurability, data.maxDurability)
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
      updateBag(bagId, (b) => ({ ...b, items: b.items.filter((_, i) => i !== slotIdx) }));
    } else {
      persist(items.filter((_, i) => i !== slotIdx));
    }
  }

  function handleDurabilityChange(slotIdx: number, delta: number, bagId?: string) {
    function applyDelta(list: InventoryItem[]) {
      return list.map((item, i) => {
        if (i !== slotIdx || !item.isEquipment) return item;
        const maxDur = item.maxDurability ?? 0;
        const cur = item.currentDurability ?? maxDur;
        return { ...item, currentDurability: Math.max(0, Math.min(maxDur, cur + delta)) };
      });
    }
    if (bagId) {
      updateBag(bagId, (b) => ({ ...b, items: applyDelta(b.items) }));
    } else {
      persist(applyDelta(items));
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const editItem = modal?.mode === "edit"
    ? (modal.bagId
        ? bags.find((b) => b.id === modal.bagId)?.items[modal.slotIdx]
        : items[modal.slotIdx])
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
                    {items.length}/{totalSlots} slots base · Físico {fisico}{bags.length > 0 ? ` · ${bags.length} mochila${bags.length > 1 ? "s" : ""}` : ""}
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
                <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
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
                          onDurabilityChange={(delta) => handleDurabilityChange(i, delta)}
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

                {/* Bag sections */}
                {bags.map((bag) => (
                  <div
                    key={bag.id}
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
                        onChange={(e) => renameBag(bag.id, e.target.value)}
                        style={{
                          flex: 1,
                          background: "none",
                          border: "none",
                          outline: "none",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          color: "#E8B84B",
                          minWidth: 0,
                        }}
                      />
                      {/* Slot counter */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                        <button
                          disabled={bag.slots <= 1}
                          onClick={() => changeBagSlots(bag.id, -1)}
                          style={{
                            width: 20, height: 20, borderRadius: 3,
                            background: bag.slots > 1 ? "rgba(200,146,42,0.2)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${bag.slots > 1 ? "rgba(200,146,42,0.5)" : "rgba(255,255,255,0.07)"}`,
                            color: bag.slots > 1 ? "#E8B84B" : "rgba(255,255,255,0.15)",
                            fontSize: "0.85rem", lineHeight: 1,
                            cursor: bag.slots > 1 ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >−</button>
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", minWidth: 40, textAlign: "center" }}>
                          {bag.items.length}/{bag.slots} slots
                        </span>
                        <button
                          onClick={() => changeBagSlots(bag.id, +1)}
                          style={{
                            width: 20, height: 20, borderRadius: 3,
                            background: "rgba(200,146,42,0.2)",
                            border: "1px solid rgba(200,146,42,0.5)",
                            color: "#E8B84B",
                            fontSize: "0.85rem", lineHeight: 1,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >+</button>
                      </div>
                      {/* Delete bag */}
                      <button
                        onClick={() => deleteBag(bag.id)}
                        title="Remover mochila"
                        style={{
                          background: "none", border: "none",
                          color: "rgba(200,60,60,0.45)", fontSize: "1rem",
                          cursor: "pointer", lineHeight: 1, flexShrink: 0, padding: "0 2px",
                        }}
                      >×</button>
                    </div>

                    {/* Bag item slots */}
                    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {Array.from({ length: bag.slots }, (_, i) => {
                        const item = bag.items[i];
                        if (item) {
                          return (
                            <ItemCard
                              key={item.id}
                              item={item}
                              accentColor="#E8B84B"
                              onEdit={() => setModal({ mode: "edit", slotIdx: i, bagId: bag.id })}
                              onDelete={() => handleDelete(i, bag.id)}
                              onDurabilityChange={(delta) => handleDurabilityChange(i, delta, bag.id)}
                            />
                          );
                        }
                        return (
                          <EmptySlot
                            key={`bag-${bag.id}-empty-${i}`}
                            accentColor="#E8B84B"
                            onClick={() => setModal({ mode: "create", slotIdx: i, bagId: bag.id })}
                          />
                        );
                      })}
                    </div>
                  </div>
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
                      e.currentTarget.style.background = "rgba(200,146,42,0.12)";
                      e.currentTarget.style.borderColor = "rgba(200,146,42,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(200,146,42,0.06)";
                      e.currentTarget.style.borderColor = "rgba(200,146,42,0.3)";
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>🎒</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,146,42,0.7)" }}>
                      Adicionar Mochila
                    </span>
                  </button>
                </div>
              </div>
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
    </>
  );
}
