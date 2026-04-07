import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ship, ShipSector } from "@/data/shipTypes";
import shipsData from "@ships";

const SHIPS = shipsData as Ship[];

/* ─── Design tokens ──────────────────────────────────────────────── */
const ACCENT_MID = "#2060A0";
const ACCENT_GLOW = "#60A8D8";
const ACCENT_DIM = "rgba(32,96,160,0.3)";
const CARD_BG = "rgba(4,10,20,0.97)";
const SECTION_BG = "rgba(32,96,160,0.07)";

/* ─── Category colors ────────────────────────────────────────────── */
const CATEGORY_COLOR: Record<string, string> = {
  Armamento: "#C04040",
  Casco: "#A08020",
  Velas: "#20A080",
  Radar: "#6040C0",
  Dormitório: "#406080",
  Cozinha: "#804020",
  Biblioteca: "#406020",
  Armazém: "#604040",
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function SlotPips({ total, used }: { total: number; used: number }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            width: 10,
            height: 10,
            background: i < used ? ACCENT_MID : "rgba(255,255,255,0.08)",
            border: `1px solid ${i < used ? ACCENT_GLOW : "rgba(255,255,255,0.12)"}`,
          }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.22em] mb-2"
      style={{ color: ACCENT_GLOW, fontFamily: "var(--font-ui)" }}
    >
      {children}
    </p>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center py-3 px-2">
      <span
        className="text-xs uppercase tracking-wider mb-1"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-ui)",
        }}
      >
        {label}
      </span>
      <span
        className="font-display font-bold text-xl"
        style={{ color: "#C8E0F0" }}
      >
        {value}
      </span>
    </div>
  );
}

function SectorRow({ sector }: { sector: ShipSector }) {
  const color = CATEGORY_COLOR[sector.category] ?? ACCENT_GLOW;
  return (
    <div
      className="flex items-start gap-3 py-2"
      style={{ borderBottom: `1px solid rgba(32,96,160,0.12)` }}
    >
      {/* Category pill */}
      <span
        className="flex-shrink-0 text-xs px-2 py-0.5 rounded-sm mt-0.5"
        style={{
          background: `${color}22`,
          color,
          border: `1px solid ${color}55`,
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          minWidth: 80,
          textAlign: "center",
        }}
      >
        {sector.category}
      </span>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "#C8E0F0", fontFamily: "var(--font-ui)" }}
          >
            {sector.name}
          </span>
          <span
            className="text-xs flex-shrink-0"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
            }}
          >
            {sector.slots} slot{sector.slots > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs" style={{ color: ACCENT_GLOW }}>
            {sector.effect}
          </span>
          {sector.test !== "—" && (
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              · Teste: {sector.test}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Ship Card ──────────────────────────────────────────────────── */
function ShipCard({ ship }: { ship: Ship }) {
  // Group sectors by category for the summary bar
  const totalSlotsUsed = ship.sectors.reduce((s, r) => s + r.slots, 0);

  return (
    <div
      className="rounded-sm overflow-hidden w-full"
      style={{
        background: CARD_BG,
        border: `1px solid ${ACCENT_DIM}`,
        boxShadow: `0 4px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(32,96,160,0.2)`,
      }}
    >
      {/* Ship image */}
      {ship.image && (
        <div className="relative overflow-hidden" style={{ height: 300 }}>
          <img
            src={ship.image}
            alt={ship.name}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(4,10,20,0.1) 0%, rgba(4,10,20,0.65) 100%)`,
            }}
          />
        </div>
      )}

      {/* Header */}
      <div
        className="px-6 py-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(26,74,122,0.4) 0%, rgba(26,74,122,0.12) 100%)`,
          borderBottom: `1px solid ${ACCENT_DIM}`,
        }}
      >
        {/* Decorative compass lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${ACCENT_GLOW} 0px, ${ACCENT_GLOW} 1px, transparent 1px, transparent 40px),
                              repeating-linear-gradient(90deg, ${ACCENT_GLOW} 0px, ${ACCENT_GLOW} 1px, transparent 1px, transparent 40px)`,
            }}
          />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: ACCENT_GLOW, fontFamily: "var(--font-ui)" }}
              >
                {ship.size}
              </span>
              <span style={{ color: ACCENT_DIM }}>·</span>
              <span
                className="text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {ship.captainAttribute}
              </span>
            </div>
            <h3
              className="font-display text-2xl font-bold"
              style={{ color: "#C8E0F0", letterSpacing: "0.03em" }}
            >
              {ship.name}
            </h3>
            <p
              className="text-xs mt-1"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-ui)",
              }}
            >
              {ship.type}
            </p>
          </div>

          {/* Slot visual */}
          <div className="flex-shrink-0 text-right">
            <p
              className="text-xs uppercase tracking-wider mb-1.5"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-ui)",
              }}
            >
              Slots
            </p>
            <SlotPips total={ship.slots.total} used={totalSlotsUsed} />
            <p
              className="text-xs mt-1"
              style={{ color: ACCENT_GLOW, fontFamily: "var(--font-ui)" }}
            >
              {totalSlotsUsed}/{ship.slots.total} usados
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Lore */}
        <p
          className="font-body text-sm leading-relaxed italic"
          style={{
            color: "var(--color-text-secondary)",
            borderLeft: `2px solid ${ACCENT_DIM}`,
            paddingLeft: "0.75rem",
          }}
        >
          {ship.lore}
        </p>

        {/* Stats strip */}
        <div
          className="grid grid-cols-3 rounded-sm overflow-hidden"
          style={{ border: `1px solid ${ACCENT_DIM}` }}
        >
          {[
            { label: "HP", value: `${ship.hp} / ${ship.hp}` },
            { label: "DN", value: ship.dn },
            { label: "Porte", value: ship.size },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                background: i % 2 === 0 ? SECTION_BG : "transparent",
                borderRight: i < 2 ? `1px solid ${ACCENT_DIM}` : "none",
              }}
            >
              <StatBox label={s.label} value={s.value} />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: ACCENT_DIM }} />

        {/* Sectors */}
        <div>
          <SectionLabel>Setores Instalados</SectionLabel>
          <div>
            {ship.sectors.map((sector, i) => (
              <SectorRow key={i} sector={sector} />
            ))}
          </div>
        </div>

        {/* Traits */}
        {ship.traits.length > 0 && (
          <div>
            <SectionLabel>Características</SectionLabel>
            <ul className="space-y-2">
              {ship.traits.map((trait, i) => {
                const [title, ...rest] = trait.split(" — ");
                return (
                  <li key={i} className="flex gap-2 text-sm">
                    <span
                      className="flex-shrink-0 font-semibold"
                      style={{ color: "#C8E0F0", fontFamily: "var(--font-ui)" }}
                    >
                      {title}
                    </span>
                    {rest.length > 0 && (
                      <>
                        <span style={{ color: ACCENT_DIM }}>—</span>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          {rest.join(" — ")}
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
export function ShipWidget() {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-sm overflow-x-auto"
        style={{
          background: "rgba(32,96,160,0.08)",
          border: `1px solid ${ACCENT_DIM}`,
        }}
      >
        {SHIPS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSelected(i)}
            className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-150 whitespace-nowrap"
            style={{
              fontFamily: "var(--font-ui)",
              background: selected === i ? ACCENT_MID : "transparent",
              color: selected === i ? "#C8E0F0" : "var(--color-text-muted)",
              border:
                selected === i
                  ? `1px solid ${ACCENT_GLOW}`
                  : "1px solid transparent",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <ShipCard ship={SHIPS[selected]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
