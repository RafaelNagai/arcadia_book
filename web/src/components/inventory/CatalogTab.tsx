import { useState, useMemo } from "react"
import { WEIGHT_LABELS, WEIGHT_VALUES } from "@/data/characterTypes"
import { CATALOG, TIER_COLOR, inputStyle, resolveCatalogImage } from "./types"
import type { CatalogEntry } from "./types"

export function CatalogTab({
  onSelectCatalog,
  accentColor,
}: {
  onSelectCatalog?: (entry: CatalogEntry) => void
  accentColor: string
}) {
  const [search, setSearch] = useState("")

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return CATALOG
    return CATALOG.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.tier.toLowerCase() === q,
    )
  }, [search])

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, categoria ou tier (ex: A, espada...)"
        style={{ ...inputStyle, marginBottom: "0.75rem" }}
        autoFocus
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
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
          const tierColor = TIER_COLOR[entry.tier] ?? "#A09880"
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
                e.currentTarget.style.background = `${accentColor}12`
                e.currentTarget.style.borderColor = `${accentColor}44`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.025)"
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
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
          )
        })}
      </div>
    </div>
  )
}
