import { WEIGHT_LABELS, WEIGHT_VALUES } from "@/data/characterTypes"
import { TIER_COLOR, resolveCatalogImage } from "./types"
import type { CatalogEntry } from "./types"

export function CatalogItemCard({
  entry,
  accentColor,
  onSelect,
}: {
  entry: CatalogEntry
  accentColor: string
  onSelect?: (entry: CatalogEntry) => void
}) {
  const tierColor = TIER_COLOR[entry.tier] ?? "#A09880"
  const image = resolveCatalogImage(entry.image)
  const hasDamage = Boolean(entry.damage)
  const hasDa = entry.da != null
  const hasEffects = entry.effects.length > 0

  return (
    <button
      onClick={() => onSelect?.(entry)}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 6,
        padding: "0.65rem 0.75rem",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s, border-color 0.12s",
        display: "flex",
        gap: "0.6rem",
        alignItems: "flex-start",
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${accentColor}12`
        e.currentTarget.style.borderColor = `${accentColor}44`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.025)"
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 4,
          overflow: "hidden",
          background: "rgba(0,0,0,0.3)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {image ? (
          <img
            src={image}
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
            style={{ fontSize: "1.1rem", lineHeight: 1, opacity: 0.25, userSelect: "none" }}
          >
            ?
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#EEF4FC",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
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
          {entry.subcategory} · {WEIGHT_LABELS[entry.weight]} ({WEIGHT_VALUES[entry.weight]})
          {entry.isEquipment && entry.maxDurability != null ? ` · Dur. ${entry.maxDurability}` : ""}
        </p>

        {(hasDamage || hasDa) && (
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            {hasDamage && (
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.62rem" }}>
                <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                  Dano{" "}
                </span>
                <span
                  style={{ color: "#E8803A", fontFamily: "var(--font-display)", fontWeight: 700 }}
                >
                  {entry.damage}
                </span>
              </span>
            )}
            {hasDa && (
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.62rem" }}>
                <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                  DA{" "}
                </span>
                <span
                  style={{ color: "#50C8E8", fontFamily: "var(--font-display)", fontWeight: 700 }}
                >
                  {entry.da}
                </span>
              </span>
            )}
          </div>
        )}

        {hasEffects && (
          <p
            style={{
              color: "rgba(192,144,240,0.85)",
              fontFamily: "var(--font-body)",
              fontSize: "0.68rem",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            • {entry.effects.join(" · ")}
          </p>
        )}
      </div>
    </button>
  )
}
