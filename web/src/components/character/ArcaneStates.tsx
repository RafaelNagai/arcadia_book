import { useMemo } from "react";
import { motion } from "framer-motion";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

export type SpecialState =
  | "milagre"
  | "critico"
  | "desastre"
  | "falha_critica"
  | null;

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

export function detectSpecialState(chosen: number[]): SpecialState {
  if (chosen.length < 1) return null;
  const allTwelve = chosen.every((v) => v === 12);
  const anyTwelve = chosen.some((v) => v === 12);
  const allOne = chosen.every((v) => v === 1);
  const anyOne = chosen.some((v) => v === 1);
  if (allTwelve) return "milagre";
  if (allOne) return "desastre";
  if (anyTwelve) return "critico";
  if (anyOne) return "falha_critica";
  return null;
}

/** Returns the N highest values from an array, preserving original order via index. */
export function getChosenIndices(values: number[], n: number): Set<number> {
  return new Set(
    [...values.keys()]
      .sort((a, b) => values[b] - values[a])
      .slice(0, Math.min(n, values.length)),
  );
}

/* ────────────────────────────────────────────────────────────────
   Particles
   ──────────────────────────────────────────────────────────────── */

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  dir: 1 | -1;
}

function makeParticles(state: SpecialState, count: number): Particle[] {
  const palettes: Record<NonNullable<SpecialState>, string[]> = {
    milagre: ["#fff8c0", "#ffe060", "#ffd700", "#ffffff", "#e8b84b", "#fffbe0"],
    critico: ["#e8b84b", "#ffd700", "#ffec80", "#c8922a"],
    desastre: ["#c01820", "#800010", "#ff3040", "#400008"],
    falha_critica: ["#c04040", "#803030", "#ff6060"],
  };
  const palette = palettes[state!];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 20 + Math.random() * 60,
    size: 4 + Math.random() * 8,
    color: palette[Math.floor(Math.random() * palette.length)],
    delay: Math.random() * 0.6,
    duration: 1.2 + Math.random() * 1.4,
    dir: (state === "desastre" ? 1 : -1) as 1 | -1,
  }));
}

export function ParticleLayer({ state }: { state: SpecialState }) {
  const particles = useMemo(
    () => (state ? makeParticles(state, state === "milagre" ? 80 : 40) : []),
    [state],
  );
  if (!particles.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 1, scale: 1 }}
          animate={{
            y: p.dir === -1 ? `${p.y - 55}vh` : `${p.y + 55}vh`,
            opacity: 0,
            scale: p.dir === -1 ? 0.3 : 1.5,
            rotate: Math.random() * 360 - 180,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: state === "milagre" ? "50%" : 3,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            top: 0,
            left: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Special state metadata + banner
   ──────────────────────────────────────────────────────────────── */

export const STATE_META: Record<
  NonNullable<SpecialState>,
  { label: string; sub: string; color: string; glow: string }
> = {
  milagre: {
    label: "MILAGRE",
    sub: "Dois 12 naturais · Feito lendário",
    color: "#ffe060",
    glow: "rgba(255,224,96,0.9)",
  },
  critico: {
    label: "CRÍTICO",
    sub: "12 natural · Sucesso amplificado",
    color: "#e8b84b",
    glow: "rgba(232,184,75,0.8)",
  },
  desastre: {
    label: "DESASTRE",
    sub: "Dois 1 naturais · Catástrofe imediata",
    color: "#ff3040",
    glow: "rgba(255,48,64,0.8)",
  },
  falha_critica: {
    label: "ATENÇÃO",
    sub: "1 natural nos dados · Possível Falha Crítica",
    color: "#ff8060",
    glow: "rgba(255,128,96,0.7)",
  },
};

export function SpecialBanner({ state }: { state: NonNullable<SpecialState> }) {
  const meta = STATE_META[state];
  const isMilagre = state === "milagre";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
      style={{ textAlign: "center", marginBottom: 12 }}
    >
      <motion.p
        animate={
          isMilagre
            ? {
                textShadow: [
                  `0 0 30px ${meta.glow}`,
                  `0 0 70px ${meta.glow}, 0 0 120px ${meta.glow}`,
                  `0 0 30px ${meta.glow}`,
                ],
              }
            : {}
        }
        transition={isMilagre ? { duration: 1.4, repeat: Infinity } : {}}
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: isMilagre ? 28 : 22,
          fontWeight: 800,
          letterSpacing: "0.28em",
          color: meta.color,
          textShadow: `0 0 30px ${meta.glow}`,
        }}
      >
        {meta.label}
      </motion.p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: meta.color + "bb",
          marginTop: 3,
        }}
      >
        {meta.sub}
      </p>
    </motion.div>
  );
}
