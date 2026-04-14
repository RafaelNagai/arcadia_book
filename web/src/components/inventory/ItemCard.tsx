import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { InventoryItem } from "@/data/characterTypes";
import { WeightBadge } from "./WeightBadge";
import { TIER_COLOR } from "./types";

function ItemDescriptionBlock({
  item,
  onRollDamage,
}: {
  item: InventoryItem;
  onRollDamage?: (s: string) => void;
}) {
  if (
    !item.fromCatalog &&
    !item.description &&
    !item.damage &&
    !(item.effects && item.effects.length > 0)
  ) {
    return null;
  }

  return (
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
      {item.fromCatalog ? (
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
      ) : (
        item.description && <p>{item.description}</p>
      )}
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
            onClick={() => item.damage && onRollDamage?.(item.damage)}
            style={{
              color: "#E8803A",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              cursor: onRollDamage ? "pointer" : "default",
              textDecoration: onRollDamage ? "underline dotted" : "none",
              textUnderlineOffset: 3,
            }}
          >
            {item.damage}
          </span>
        </p>
      )}
      {item.effects &&
        item.effects.length > 0 &&
        item.effects.map((effect, i) => (
          <p key={i} style={{ color: "rgba(192,144,240,0.85)" }}>
            • {effect}
          </p>
        ))}
    </div>
  );
}

export function ItemCard({
  item,
  accentColor,
  onEdit,
  onDelete,
  onDurabilityChange,
  onZoom,
  onRollDamage,
  overlay = false,
}: {
  item: InventoryItem;
  accentColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onDurabilityChange: (delta: number) => void;
  onZoom?: (src: string) => void;
  onRollDamage?: (damageStr: string) => void;
  /** When true, renders as DragOverlay (no sortable hooks, full opacity) */
  overlay?: boolean;
}) {
  const sortable = useSortable({ id: item.id, disabled: overlay });
  const dur = item.currentDurability ?? item.maxDurability ?? 0;
  const maxDur = item.maxDurability ?? 0;
  const durPct = maxDur > 0 ? dur / maxDur : 0;
  const durColor =
    durPct > 0.6 ? "#6EC840" : durPct > 0.3 ? "#C8922A" : "#C05050";
  const displayImage = item.image || item.catalogImage || null;

  return (
    <div
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.35 : 1,
      }}
    >
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
        {/* Drag handle */}
        <div
          {...sortable.listeners}
          {...sortable.attributes}
          style={{
            width: 18,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: overlay ? "grabbing" : "grab",
            color: "rgba(255,255,255,0.18)",
            fontSize: "0.7rem",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          ⠿
        </div>

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
          onClick={() => displayImage && onZoom?.(displayImage)}
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

        {/* Content */}
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
          <ItemDescriptionBlock item={item} onRollDamage={onRollDamage} />

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
    </div>
  );
}
