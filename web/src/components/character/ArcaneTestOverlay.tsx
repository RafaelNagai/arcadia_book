import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
} from "react";
import type { CharacterModificadores } from "@/data/characterTypes";
import { useDiceLog } from "@/lib/diceLog";
import type { ArcanoModResult } from "@/lib/diceLog";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  DiceScene,
  CameraSetup,
  PHYSICS,
} from "@/components/widgets/DiceRollerWidget";
import type { DiceRollRequest } from "@/components/widgets/DiceRollerWidget";
import { getAccent } from "./types";
import {
  type SpecialState,
  detectSpecialState,
  ParticleLayer,
  STATE_META,
} from "./ArcaneStates";
import { ArcaneConfigPanel, type ModKey, MOD_KEYS, MOD_LABELS } from "./ArcaneConfigPanel";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

type Phase = "config" | "rolling" | "settled";

export interface ArcaneTestData {
  afinidade: string;
  antitese: string;
  entropia: number;
  arcano: number;
  modificadores: CharacterModificadores;
  exhaustionPenalty?: number;
}

interface ArcaneTestOverlayProps extends ArcaneTestData {
  onClose: () => void;
}

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

const STATE_PRIORITY: Record<NonNullable<SpecialState>, number> = {
  milagre:      4,
  desastre:     3,
  critico:      2,
  falha_critica: 1,
};

function highestState(states: SpecialState[]): SpecialState {
  let best: SpecialState = null;
  let bestP = 0;
  for (const s of states) {
    if (s && STATE_PRIORITY[s] > bestP) {
      best = s;
      bestP = STATE_PRIORITY[s];
    }
  }
  return best;
}

/* ────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────── */

export function ArcaneTestOverlay({
  afinidade,
  antitese,
  entropia,
  arcano,
  modificadores,
  exhaustionPenalty = 0,
  onClose,
}: ArcaneTestOverlayProps) {
  const { addEntry } = useDiceLog();
  const [phase, setPhase] = useState<Phase>("config");
  const [selectedElement, setSelectedElement] = useState<string>(afinidade);
  const [modResults, setModResults] = useState<Record<ModKey, ArcanoModResult> | null>(null);
  const [allDiceResults, setAllDiceResults] = useState<number[]>([]);
  const [sceneKey, setSceneKey] = useState(0);
  const [diceToRoll, setDiceToRoll] = useState(0);
  const shakeControls = useAnimation();
  const shookRef = useRef(false);

  // Refs hold the allocation snapshot set when user clicks Roll
  const rollingAllocRef = useRef<Record<ModKey, number>>({ potencia: 0, complexidade: 0, forma: 0, controle: 0 });
  const rollingEAllocRef = useRef<Record<ModKey, number>>({ potencia: 0, complexidade: 0, forma: 0, controle: 0 });

  const entropiaBonus = arcano * entropia;
  const elementBonus =
    afinidade === antitese && selectedElement === afinidade ? 10 :
    selectedElement === antitese && afinidade !== antitese ? -10 :
    0;
  const typeColor = getAccent(selectedElement).text;

  const diceRequest = useMemo<DiceRollRequest[]>(
    () => (diceToRoll > 0 ? [{ dieType: 12, count: diceToRoll }] : []),
    [diceToRoll],
  );

  // ── Global special state (highest across all modifiers) ───────
  const globalSpecialState = useMemo<SpecialState>(() => {
    if (!modResults) return null;
    return highestState(MOD_KEYS.map((k) => modResults[k].specialState));
  }, [modResults]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    if (phase === "settled" && globalSpecialState === "desastre" && !shookRef.current) {
      shookRef.current = true;
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
        transition: { duration: 0.7, ease: "easeInOut" },
      });
    }
  }, [phase, globalSpecialState, shakeControls]);

  // ── Roll handler — receives final allocation from the config panel ───
  const handleRoll = useCallback((alloc: Record<ModKey, number>, eAlloc: Record<ModKey, number>) => {
    rollingAllocRef.current = alloc;
    rollingEAllocRef.current = eAlloc;
    setDiceToRoll(MOD_KEYS.reduce((s, k) => s + alloc[k], 0));
    shookRef.current = false;
    setSceneKey((k) => k + 1);
    setPhase("rolling");
  }, []);

  const handleAllSettled = useCallback(
    (vals: number[]) => {
      const alloc = rollingAllocRef.current;
      const eAlloc = rollingEAllocRef.current;
      let idx = 0;
      const results = {} as Record<ModKey, ArcanoModResult>;
      for (const k of MOD_KEYS) {
        const n = alloc[k];
        const dice = vals.slice(idx, idx + n);
        idx += n;
        const ss = detectSpecialState(dice);
        const diceSum = dice.reduce((a, b) => a + b, 0);
        const score = modificadores[k] ?? 0;
        const bonus = eAlloc[k];
        results[k] = {
          dice,
          score,
          total: diceSum + score + bonus + elementBonus + exhaustionPenalty,
          specialState: ss,
        };
      }
      setModResults(results);
      setAllDiceResults(vals);
      setPhase("settled");

      addEntry({
        type: "arcano",
        selectedElement,
        afinidade,
        antitese,
        entropiaBonus,
        elementBonus,
        allocation: { ...alloc },
        modifierResults: results as Record<string, ArcanoModResult>,
        allDiceResults: vals,
        exhaustionPenalty,
      });
    },
    [
      modificadores,
      elementBonus,
      exhaustionPenalty,
      selectedElement,
      afinidade,
      antitese,
      entropiaBonus,
      addEntry,
    ],
  );

  return createPortal(
    <AnimatePresence>
      <motion.div
        animate={shakeControls}
        style={{ position: "fixed", inset: 0, zIndex: 9998, overflow: "hidden" }}
      >
        {/* ── CONFIG ── */}
        {phase === "config" && (
          <ArcaneConfigPanel
            afinidade={afinidade}
            antitese={antitese}
            arcano={arcano}
            entropia={entropia}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            modificadores={modificadores}
            onRoll={handleRoll}
            onClose={onClose}
          />
        )}

        {/* ── ROLLING + SETTLED ── */}
        {(phase === "rolling" || phase === "settled") && (
          <motion.div
            key="dice-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(2,4,12,0.70)",
                backdropFilter: "blur(2px)",
              }}
            >
              <Canvas
                key={sceneKey}
                camera={{ position: [0, 11, 3.5], fov: 50, near: 0.5, far: 80 }}
                shadows
                gl={{ antialias: true, alpha: true }}
                style={{ position: "absolute", inset: 0, background: "transparent" }}
              >
                <CameraSetup />
                <Suspense fallback={null}>
                  <Physics gravity={[0, PHYSICS.gravity, 0]}>
                    <DiceScene dice={diceRequest} onAllSettled={handleAllSettled} />
                  </Physics>
                </Suspense>
              </Canvas>
            </div>

            {phase === "settled" && globalSpecialState && (
              <ParticleLayer state={globalSpecialState} />
            )}

            <AnimatePresence>
              {phase === "rolling" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0.3, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    bottom: 44,
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "Cinzel, serif",
                    fontSize: 12,
                    letterSpacing: "0.28em",
                    color: `${typeColor}88`,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  ROLANDO…
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── Result panel ── */}
            <AnimatePresence>
              {phase === "settled" && modResults && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 5,
                    background: "linear-gradient(to top, rgba(2,4,14,0.98) 0%, rgba(2,4,14,0.90) 70%, transparent 100%)",
                    padding: "16px 16px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {/* All dice rolled */}
                  {allDiceResults.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                      {allDiceResults.map((v, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.07 + 0.1, type: "spring", stiffness: 300 }}
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: `1px solid ${v === 12 ? "#ffd700" : v === 1 ? "#ff4050" : "rgba(100,120,150,0.5)"}`,
                            background: "rgba(8,14,30,0.95)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "Cinzel, serif",
                            fontSize: 16, fontWeight: 700,
                            color: v === 12 ? "#ffd700" : v === 1 ? "#ff4050" : "#a0c8f8",
                            boxShadow: v === 12 ? "0 0 14px #ffd70066" : v === 1 ? "0 0 14px #ff405066" : "none",
                          }}
                        >
                          {v}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Per-modifier result cards — 2×2 grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      width: "100%",
                      maxWidth: 480,
                    }}
                  >
                    {MOD_KEYS.map((k, i) => {
                      const res = modResults[k];
                      const ss = res.specialState;
                      const ssColor = ss ? STATE_META[ss].color : typeColor;
                      const hasDice = res.dice.length > 0;
                      return (
                        <motion.div
                          key={k}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.07, type: "spring", stiffness: 280, damping: 22 }}
                          style={{
                            background: "rgba(4,8,20,0.97)",
                            border: `1px solid ${ss ? ssColor + "66" : "rgba(180,90,240,0.25)"}`,
                            borderRadius: 10,
                            padding: "10px 12px",
                            boxShadow: ss ? `0 0 20px ${ssColor}22` : "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          {/* Modifier name */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(180,90,240,0.7)", lineHeight: 1 }}>
                              {MOD_LABELS[k]}
                            </p>
                            {ss && (
                              <span style={{ fontFamily: "var(--font-ui)", fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: ssColor, background: ssColor + "22", border: `1px solid ${ssColor}44`, borderRadius: 3, padding: "1px 5px" }}>
                                {STATE_META[ss].label}
                              </span>
                            )}
                          </div>

                          {/* Dice chips for this modifier */}
                          {hasDice && (
                            <div style={{ display: "flex", gap: 4 }}>
                              {res.dice.map((v, di) => (
                                <div
                                  key={di}
                                  style={{
                                    width: 26, height: 26, borderRadius: 5,
                                    border: `1px solid ${v === 12 ? "#ffd700" : v === 1 ? "#ff4050" : "rgba(100,120,160,0.5)"}`,
                                    background: "rgba(8,14,30,0.95)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "Cinzel, serif", fontSize: 12, fontWeight: 700,
                                    color: v === 12 ? "#ffd700" : v === 1 ? "#ff4050" : "#a0c8f8",
                                    boxShadow: v === 12 ? "0 0 8px #ffd70066" : v === 1 ? "0 0 8px #ff405066" : "none",
                                  }}
                                >
                                  {v}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Total */}
                          <motion.p
                            animate={ss === "milagre" ? { textShadow: [`0 0 20px ${ssColor}`, `0 0 50px ${ssColor}`, `0 0 20px ${ssColor}`] } : {}}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{
                              fontFamily: "Cinzel, serif",
                              fontWeight: 800,
                              fontSize: hasDice ? 32 : 24,
                              lineHeight: 1,
                              color: ss ? ssColor : hasDice ? "#EEF4FC" : "rgba(255,255,255,0.45)",
                              textShadow: ss ? `0 0 20px ${ssColor}55` : "none",
                            }}
                          >
                            {res.total}
                          </motion.p>

                          {/* Breakdown hint */}
                          <p style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.03em", lineHeight: 1.3, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            <span style={{ color: "rgba(255,255,255,0.3)" }}>
                              {(() => {
                                const bonus = rollingEAllocRef.current[k];
                                const bonusPart = bonus > 0 ? ` + ${bonus}` : "";
                                const elPart = elementBonus !== 0 ? ` ${elementBonus > 0 ? `+ ${elementBonus}` : `− ${Math.abs(elementBonus)}`}` : "";
                                return hasDice
                                  ? `${res.dice.reduce((a,b)=>a+b,0)} + ${res.score}${bonusPart}${elPart}`
                                  : `${res.score}${bonusPart}${elPart} (sem dado)`;
                              })()}
                            </span>
                            {exhaustionPenalty !== 0 && (
                              <span style={{ color: "#D04040", fontWeight: 700 }}>
                                Exaustão {exhaustionPenalty}
                              </span>
                            )}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <p
                    onClick={onClose}
                    style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em", cursor: "pointer", marginTop: 2 }}
                  >
                    ESC · clique para fechar
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === "rolling" && (
              <p style={{ position: "absolute", top: 20, right: 24, zIndex: 2, fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.18)", pointerEvents: "none" }}>
                ESC para fechar
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
