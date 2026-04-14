import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
} from "react";
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
  SpecialBanner,
} from "./ArcaneStates";
import { ArcaneConfigPanel } from "./ArcaneConfigPanel";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

type Phase = "config" | "rolling" | "settled";

export interface ArcaneTestData {
  afinidade: string;
  antitese: string;
  entropia: number;
  slottedRunas: (string | null)[];
}

interface ArcaneTestOverlayProps extends ArcaneTestData {
  onClose: () => void;
}

/* ────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────── */

export function ArcaneTestOverlay({
  afinidade,
  antitese,
  entropia: _entropia,
  slottedRunas,
  onClose,
}: ArcaneTestOverlayProps) {
  const [phase, setPhase] = useState<Phase>("config");
  const [selectedElement, setSelectedElement] = useState<string>(afinidade);
  const [diceCount, setDiceCount] = useState(2);
  const [results, setResults] = useState<number[]>([]);
  const [sceneKey, setSceneKey] = useState(0);
  const shakeControls = useAnimation();
  const shookRef = useRef(false);

  // ── Bonus computation ────────────────────────────────────────
  const afinidadeBonus = selectedElement === afinidade ? 4 : 0;
  const antiteseBonus = selectedElement === antitese ? 2 : 0;
  const elementBonus = afinidadeBonus + antiteseBonus;
  const runaCount = slottedRunas.filter((r) => r !== null).length;
  const runaBonus = runaCount * 2;
  const totalBonus = elementBonus + runaBonus;

  const typeColor = getAccent(selectedElement).text;

  // ── Dice / results ────────────────────────────────────────────
  const diceRequest = useMemo<DiceRollRequest[]>(
    () => (diceCount > 0 ? [{ dieType: 12, count: diceCount }] : []),
    [diceCount],
  );

  const usedCount = Math.min(2, results.length);
  const chosenIndices = useMemo(
    () => getChosenIndices(results, usedCount),
    [results, usedCount],
  );
  const chosenValues = useMemo(
    () => results.filter((_, i) => chosenIndices.has(i)),
    [results, chosenIndices],
  );
  const specialState = useMemo<SpecialState>(
    () => detectSpecialState(chosenValues),
    [chosenValues],
  );
  const diceSum = chosenValues.reduce((a, b) => a + b, 0);
  const finalResult = diceSum + totalBonus;

  const resultColor = !specialState
    ? typeColor
    : STATE_META[specialState].color;
  const resultGlow = !specialState
    ? typeColor + "88"
    : STATE_META[specialState].glow;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    if (
      phase === "settled" &&
      specialState === "desastre" &&
      !shookRef.current
    ) {
      shookRef.current = true;
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
        transition: { duration: 0.7, ease: "easeInOut" },
      });
    }
  }, [phase, specialState, shakeControls]);

  const handleRoll = useCallback(() => {
    if (diceCount === 0) return;
    shookRef.current = false;
    setSceneKey((k) => k + 1);
    setPhase("rolling");
  }, [diceCount]);

  const handleAllSettled = useCallback((vals: number[]) => {
    setResults(vals);
    setPhase("settled");
  }, []);

  return createPortal(
    <AnimatePresence>
      <motion.div
        animate={shakeControls}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          overflow: "hidden",
        }}
      >
        {/* ── CONFIG ── */}
        {phase === "config" && (
          <ArcaneConfigPanel
            afinidade={afinidade}
            antitese={antitese}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            diceCount={diceCount}
            onDiceCountChange={(fn) => setDiceCount(fn)}
            runaCount={runaCount}
            runaBonus={runaBonus}
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
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "transparent",
                }}
              >
                <CameraSetup />
                <Suspense fallback={null}>
                  <Physics gravity={[0, PHYSICS.gravity, 0]}>
                    <DiceScene
                      dice={diceRequest}
                      onAllSettled={handleAllSettled}
                    />
                  </Physics>
                </Suspense>
              </Canvas>
            </div>

            {phase === "settled" && specialState && (
              <ParticleLayer state={specialState} />
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

            {/* Result panel */}
            <AnimatePresence>
              {phase === "settled" && results.length > 0 && (
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
                    background:
                      "linear-gradient(to top, rgba(2,4,14,0.98) 0%, rgba(2,4,14,0.90) 70%, transparent 100%)",
                    padding: "20px 24px 36px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {specialState && <SpecialBanner state={specialState} />}

                  {/* Dice bubbles */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {results.map((v, i) => {
                      const isChosen = chosenIndices.has(i);
                      const isSpec12 = isChosen && v === 12;
                      const isSpec1 = isChosen && v === 1;
                      const col = isSpec12
                        ? "#ffd700"
                        : isSpec1
                          ? "#ff4050"
                          : isChosen
                            ? "#a0c8f8"
                            : "rgba(100,120,150,0.4)";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: isChosen ? 1.0 : 0.78 }}
                          transition={{
                            delay: i * 0.07 + 0.15,
                            type: "spring",
                            stiffness: 300,
                          }}
                          style={{
                            position: "relative",
                            width: isChosen ? 46 : 36,
                            height: isChosen ? 46 : 36,
                            borderRadius: 9,
                            border: `${isChosen ? 2 : 1}px solid ${col}`,
                            background: "rgba(8,14,30,0.95)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "Cinzel, serif",
                            fontSize: isChosen ? 20 : 15,
                            fontWeight: 700,
                            color: col,
                            boxShadow: isChosen
                              ? `0 0 ${isSpec12 || isSpec1 ? 24 : 12}px ${col}66`
                              : "none",
                            opacity: isChosen ? 1 : 0.45,
                          }}
                        >
                          {v}
                          {!isChosen && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 9,
                                background: "rgba(0,0,0,0.35)",
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Result card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.35,
                      type: "spring",
                      stiffness: 280,
                      damping: 22,
                    }}
                    style={{
                      background: "rgba(4,8,20,0.97)",
                      border: `2px solid ${resultColor}55`,
                      borderRadius: 14,
                      padding: "16px 32px",
                      textAlign: "center",
                      boxShadow: `0 0 40px ${resultGlow}33`,
                      minWidth: 260,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        marginBottom: 8,
                        fontFamily: "var(--font-ui)",
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        letterSpacing: "0.08em",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#a0c8f8" }}>
                        {chosenValues.join(" + ")}
                      </span>
                      {elementBonus > 0 && (
                        <>
                          <span>+</span>
                          <span style={{ color: typeColor }}>
                            {selectedElement} +{elementBonus}
                          </span>
                        </>
                      )}
                      {runaBonus > 0 && (
                        <>
                          <span>+</span>
                          <span style={{ color: "#d0a8f8" }}>
                            Runas +{runaBonus}
                          </span>
                        </>
                      )}
                    </div>
                    <motion.p
                      animate={
                        specialState === "milagre"
                          ? {
                              textShadow: [
                                `0 0 40px ${resultGlow}`,
                                `0 0 90px ${resultGlow}, 0 0 150px ${resultGlow}`,
                                `0 0 40px ${resultGlow}`,
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        fontFamily: "Cinzel, serif",
                        fontWeight: 800,
                        fontSize: 72,
                        lineHeight: 1,
                        color: resultColor,
                        textShadow: `0 0 40px ${resultGlow}`,
                      }}
                    >
                      {finalResult}
                    </motion.p>
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        color: "var(--color-text-muted)",
                        marginTop: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      resultado arcano
                    </p>
                  </motion.div>

                  <p
                    onClick={onClose}
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.22)",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                    }}
                  >
                    ESC · clique para fechar
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === "rolling" && (
              <p
                style={{
                  position: "absolute",
                  top: 20,
                  right: 24,
                  zIndex: 2,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.18)",
                  pointerEvents: "none",
                }}
              >
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
