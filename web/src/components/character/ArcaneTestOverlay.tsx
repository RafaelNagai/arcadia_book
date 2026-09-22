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
  getChosenIndices,
  ParticleLayer,
  STATE_META,
} from "./ArcaneStates";
import {
  ArcaneConfigPanel,
  MOD_LABELS,
  elementRelation,
  diceCountFor,
  ENTROPIA_DIE,
  type ModKey,
} from "./ArcaneConfigPanel";

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
  initialPericia: ModKey;
  periciaModifier?: number;
  onClose: () => void;
}

interface RollResult {
  diceRolled: number[];
  chosenIndices: number[];
  entropiaDie: number | null;
  specialState: SpecialState;
  bonusApplied: boolean;
  exhaustionApplied: boolean;
  total: number;
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
  initialPericia,
  periciaModifier = 0,
  exhaustionPenalty = 0,
  onClose,
}: ArcaneTestOverlayProps) {
  const { addEntry } = useDiceLog();
  const [phase, setPhase] = useState<Phase>("config");
  const [selectedElement, setSelectedElement] = useState<string>(afinidade);
  const [diceCount, setDiceCount] = useState<number>(() =>
    diceCountFor(elementRelation(afinidade, antitese, afinidade)),
  );
  const [result, setResult] = useState<RollResult | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [lockedRoll, setLockedRoll] = useState<{
    diceCount: number;
    entropiaDie: number | null;
  } | null>(null);
  const shakeControls = useAnimation();
  const shookRef = useRef(false);

  const pericia = initialPericia;
  const relation = elementRelation(afinidade, antitese, selectedElement);
  const typeColor = getAccent(selectedElement).text;
  const periciaBase = modificadores[pericia] ?? 0;
  const periciaScore = periciaBase + periciaModifier;

  const diceRequest = useMemo<DiceRollRequest[]>(() => {
    if (phase !== "rolling" || !lockedRoll) return [];
    const { diceCount: n, entropiaDie } = lockedRoll;
    const req: DiceRollRequest[] = [];
    if (n > 0) req.push({ dieType: 12, count: n });
    if (entropiaDie !== null) req.push({ dieType: entropiaDie as 4 | 8 | 12 | 20, count: 1 });
    return req;
  }, [phase, lockedRoll]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    if (phase === "settled" && result?.specialState === "desastre" && !shookRef.current) {
      shookRef.current = true;
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
        transition: { duration: 0.7, ease: "easeInOut" },
      });
    }
  }, [phase, result, shakeControls]);

  const handleRoll = useCallback(() => {
    if (diceCount === 0) return;
    const entropiaDie = ENTROPIA_DIE[entropia];
    setLockedRoll({ diceCount, entropiaDie });
    shookRef.current = false;
    setSceneKey((k) => k + 1);
    setPhase("rolling");
  }, [diceCount, entropia]);

  const handleAllSettled = useCallback(
    (vals: number[]) => {
      if (!lockedRoll) return;
      const { diceCount: n, entropiaDie } = lockedRoll;
      const diceRolled = vals.slice(0, n);
      const entropiaResult = entropiaDie !== null ? vals[n] : null;

      const chosen = getChosenIndices(diceRolled, Math.min(2, diceRolled.length));
      const chosenIndices = [...chosen];
      const chosenValues = chosenIndices.map((i) => diceRolled[i]);
      const specialState = detectSpecialState(chosenValues);

      const isCritOrMiracle = specialState === "critico" || specialState === "milagre";
      const isFailOrDisaster = specialState === "falha_critica" || specialState === "desastre";
      const bonusApplied = !isFailOrDisaster;
      const exhaustionApplied = !isCritOrMiracle;

      const diceSum = chosenValues.reduce((a, b) => a + b, 0);
      const bonusSum = bonusApplied ? arcano + periciaScore : 0;
      const entropiaAdd = entropiaResult ?? 0;
      const penalty = exhaustionApplied ? exhaustionPenalty : 0;
      const total = diceSum + bonusSum + entropiaAdd + penalty;

      const r: RollResult = {
        diceRolled,
        chosenIndices,
        entropiaDie: entropiaResult,
        specialState,
        bonusApplied,
        exhaustionApplied,
        total,
      };
      setResult(r);
      setPhase("settled");

      addEntry({
        type: "arcano",
        pericia,
        periciaScore,
        arcano,
        selectedElement,
        afinidade,
        antitese,
        elementRelation: relation,
        diceRolled,
        chosenIndices,
        entropiaLevel: entropia,
        entropiaDie: entropiaResult,
        exhaustionPenalty: exhaustionApplied ? exhaustionPenalty : 0,
        total,
        specialState,
      });
    },
    [
      lockedRoll,
      arcano,
      periciaScore,
      pericia,
      selectedElement,
      afinidade,
      antitese,
      relation,
      entropia,
      exhaustionPenalty,
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
            pericia={pericia}
            periciaScore={periciaScore}
            periciaModifier={periciaModifier}
            diceCount={diceCount}
            onDiceCountChange={setDiceCount}
            exhaustionPenalty={exhaustionPenalty}
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

            {phase === "settled" && result?.specialState && (
              <ParticleLayer state={result.specialState} />
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
              {phase === "settled" && result && (
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
                  {(() => {
                    const ss = result.specialState;
                    const ssColor = ss ? STATE_META[ss].color : typeColor;
                    const chosenSet = new Set(result.chosenIndices);
                    return (
                      <div
                        style={{
                          background: "rgba(4,8,20,0.97)",
                          border: `1px solid ${ss ? ssColor + "66" : "rgba(180,90,240,0.25)"}`,
                          borderRadius: 10,
                          padding: "14px 18px",
                          boxShadow: ss ? `0 0 24px ${ssColor}22` : "none",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          maxWidth: 340,
                        }}
                      >
                        {/* Perícia + element */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(180,90,240,0.8)" }}>
                            {MOD_LABELS[pericia]}
                          </p>
                          <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
                          <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.1em", color: typeColor }}>
                            {selectedElement}
                          </p>
                          {ss && (
                            <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: ssColor, background: ssColor + "22", border: `1px solid ${ssColor}44`, borderRadius: 3, padding: "1px 6px" }}>
                              {STATE_META[ss].label}
                            </span>
                          )}
                        </div>

                        {/* Dice */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                          {result.diceRolled.map((v, i) => {
                            const chosen = chosenSet.has(i);
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.4 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.07 + 0.1, type: "spring", stiffness: 300 }}
                                style={{
                                  width: 36, height: 36, borderRadius: 8,
                                  border: `1px solid ${!chosen ? "rgba(100,120,150,0.25)" : v === 12 ? "#ffd700" : v === 1 ? "#ff4050" : "rgba(100,120,150,0.5)"}`,
                                  background: "rgba(8,14,30,0.95)",
                                  opacity: chosen ? 1 : 0.4,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontFamily: "Cinzel, serif",
                                  fontSize: 16, fontWeight: 700,
                                  color: !chosen ? "rgba(160,180,200,0.5)" : v === 12 ? "#ffd700" : v === 1 ? "#ff4050" : "#a0c8f8",
                                  boxShadow: chosen && v === 12 ? "0 0 14px #ffd70066" : chosen && v === 1 ? "0 0 14px #ff405066" : "none",
                                }}
                              >
                                {v}
                              </motion.div>
                            );
                          })}
                          {result.entropiaDie !== null && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.4 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: result.diceRolled.length * 0.07 + 0.15, type: "spring", stiffness: 300 }}
                              style={{
                                width: 36, height: 36, borderRadius: 8,
                                border: "1px solid rgba(200,146,42,0.6)",
                                background: "rgba(8,14,30,0.95)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "Cinzel, serif",
                                fontSize: 16, fontWeight: 700,
                                color: "#C8922A",
                              }}
                            >
                              {result.entropiaDie}
                            </motion.div>
                          )}
                        </div>

                        {/* Total */}
                        <motion.p
                          animate={ss === "milagre" ? { textShadow: [`0 0 20px ${ssColor}`, `0 0 50px ${ssColor}`, `0 0 20px ${ssColor}`] } : {}}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          style={{
                            fontFamily: "Cinzel, serif",
                            fontWeight: 800,
                            fontSize: 40,
                            lineHeight: 1,
                            color: ss ? ssColor : "#EEF4FC",
                            textShadow: ss ? `0 0 20px ${ssColor}55` : "none",
                          }}
                        >
                          {result.total}
                        </motion.p>

                        {/* Breakdown */}
                        <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.03em", textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4 }}>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>
                            {result.chosenIndices.map((i) => result.diceRolled[i]).join(" + ") || "0"}
                            {result.bonusApplied ? ` + ${arcano + periciaScore} (Arcano+Perícia)` : " + 0 (bônus anulado)"}
                            {result.entropiaDie !== null ? ` + ${result.entropiaDie} (Entropia)` : ""}
                          </span>
                          {result.exhaustionApplied && exhaustionPenalty !== 0 && (
                            <span style={{ color: "#D04040", fontWeight: 700 }}>
                              Exaustão {exhaustionPenalty}
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })()}

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
