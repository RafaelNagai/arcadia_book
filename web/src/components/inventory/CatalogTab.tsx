import { useState, useMemo } from "react"
import { CATALOG, TIER_COLOR, inputStyle, labelStyle } from "./types"
import type { CatalogEntry } from "./types"
import { CatalogItemCard } from "./CatalogItemCard"

const ALL = "all"

export function CatalogTab({
  onSelectCatalog,
  accentColor,
}: {
  onSelectCatalog?: (entry: CatalogEntry) => void
  accentColor: string
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>(ALL)
  const [tier, setTier] = useState<string>(ALL)

  const categories = useMemo(
    () =>
      Array.from(new Set(CATALOG.map((e) => e.category))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [],
  )

  const tiers = useMemo(
    () => Object.keys(TIER_COLOR).filter((t) => CATALOG.some((e) => e.tier === t)),
    [],
  )

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CATALOG.filter((e) => {
      if (category !== ALL && e.category !== category) return false
      if (tier !== ALL && e.tier !== tier) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.tier.toLowerCase() === q
      )
    })
  }, [search, category, tier])

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, categoria ou tier (ex: A, espada...)"
        style={{ ...inputStyle, marginBottom: "0.6rem" }}
        autoFocus
      />

      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value={ALL} style={{ background: "#0A0F1E" }}>
              Todas
            </option>
            {categories.map((c) => (
              <option key={c} value={c} style={{ background: "#0A0F1E" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Tier</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value={ALL} style={{ background: "#0A0F1E" }}>
              Todos
            </option>
            {tiers.map((t) => (
              <option key={t} value={t} style={{ background: "#0A0F1E" }}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
          gap: "0.5rem",
        }}
      >
        {filteredCatalog.length === 0 && (
          <p
            style={{
              gridColumn: "1 / -1",
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
        {filteredCatalog.map((entry) => (
          <CatalogItemCard
            key={entry.id}
            entry={entry}
            accentColor={accentColor}
            onSelect={onSelectCatalog}
          />
        ))}
      </div>
    </div>
  )
}
