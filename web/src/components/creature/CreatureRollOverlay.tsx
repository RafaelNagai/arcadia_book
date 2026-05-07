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
import type { DiceRollRequest, DieType } from "@/components/widgets/DiceRollerWidget";
import {
  type SpecialState,
  detectSpecialState,
  ParticleLayer,
  STATE_META,
  SpecialBanner,
} from "@/components/character/ArcaneStates";
import { CREATURE_ACCENT_GLOW } from "./constants";

interface Props {
  attrLabel: string;
  attrValue: number;
  diceCount: number;
  dieType: DieType;
  onClose: () => void;
}

const ACCENT = CREATURE_ACCENT_GLOW;

export function CreatureRollOverlay({
  attrLabel,
  attrValue,
  diceCount: initialDiceCount,
  dieType,
  onClose,
}: Props) {
  const [phase, setPhase] = useState<"config" | "rolling" | "settled">("config");
  const [diceCount, setDiceCount] = useState(initialDiceCount);
  const [results, setResults] = useState<number[]>([]);
  const [sceneKey, setSceneKey] = useState(0);
  const shakeControls = useAnimation();

  const specialState = useMemo<SpecialState>(
    () => detectSpecialState(results),
    [results],
  );
  const diceSum = results.reduce((a, b) => a + b, 0);
  const noBonus = specialState === "falha_critica" || specialState === "desastre";
  const finalResult = noBonus ? diceSum : diceSum + attrValue;

  const diceRequest = useMemo<DiceRollRequest[]>(
    () => (diceCount > 0 ? [{ dieType, count: diceCount }] : []),
    [diceCount, dieType],
  );

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const shookRef = useRef(false);
  useEffect(() => {
    if (phase === "settled" && specialState === "desastre" && !shookRef.current) {
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

  const resultColor = useMemo(
    () => (specialState ? STATE_META[specialState].color : ACCENT),
    [specialState],
  );
  const resultGlow = useMemo(
    () => (specialState ? STATE_META[specialState].glow : "rgba(192,64,48,0.5)"),
    [specialState],
  );

  const attrSign = attrValue >= 0 ? `+${attrValue}` : String(attrValue);

  return createPortal(
    <AnimatePresence>
      <motion.div
        animate={shakeControls}
        style={{ position: "fixed", inset: 0, zIndex: 9998, overflow: "hidden" }}
      >
        {/* ── CONFIG ── */}
        {phase === "config" && (
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(2,4,12,0.88)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-deep)",
                border: `1px solid ${ACCENT}55`,
                borderRadius: 16,
                padding: "28px 32px",
                minWidth: 300,
                maxWidth: 360,
                width: "90vw",
                boxShadow: `0 16px 60px rgba(0,0,0,0.7), 0 0 40px ${ACCENT}22`,
              }}
            >
              {/* Header */}
              <div
                style={{
                  marginBottom: 22,
                  borderBottom: `1px solid ${ACCENT}33`,
                  paddingBottom: 16,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 10,
                    color: ACCENT,
                    fontFamily: "var(--font-ui)",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Teste de Atributo
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {attrLabel}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 28,
                      color: ACCENT,
                    }}
                  >
                    {attrSign}
                  </span>
                </div>
              </div>

              {/* Dice count */}
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: 10,
                  }}
                >
                  Dados D{dieType}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => setDiceCount((c) => Math.max(0, c - 1))}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid var(--color-border)",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--color-text-secondary)",
                      fontSize: 18,
                      cursor: "pointer",
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
                      fontWeight: 800,
                      fontSize: 26,
                      color: "var(--color-text-primary)",
                      minWidth: 24,
                      textAlign: "center",
                    }}
                  >
                    {diceCount}
                  </span>
                  <button
                    onClick={() => setDiceCount((c) => c + 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid var(--color-border)",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--color-text-secondary)",
                      fontSize: 18,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {diceCount === 0
                      ? "sem dados"
                      : diceCount === 1
                        ? "desvantagem"
                        : diceCount === 2
                          ? "padrão"
                          : `+${diceCount - 2} vantagem`}
                  </span>
                </div>
              </div>

              {/* Formula preview */}
              <div
                style={{
                  marginBottom: 20,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span>todos os D{dieType}</span>
                <span>+</span>
                <span style={{ color: ACCENT }}>
                  {attrLabel} ({attrSign})
                </span>
              </div>

              {/* Roll button */}
              <button
                onClick={handleRoll}
                disabled={diceCount === 0}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 8,
                  border: `1px solid ${diceCount > 0 ? ACCENT : "var(--color-border)"}`,
                  background: diceCount > 0 ? ACCENT + "28" : "transparent",
                  color: diceCount > 0 ? ACCENT : "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.22em",
                  cursor: diceCount === 0 ? "not-allowed" : "pointer",
                  opacity: diceCount === 0 ? 0.4 : 1,
                  transition: "all 0.15s",
                  boxShadow: diceCount > 0 ? `0 0 18px ${ACCENT}44` : "none",
                }}
              >
                ROLAR {diceCount > 0 ? `${diceCount}D${dieType}` : ""}
              </button>

              <button
                onClick={onClose}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "7px 0",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  fontFamily: "var(--font-ui)",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                }}
              >
                cancelar
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── ROLLING & SETTLED ── */}
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
                    color: `${ACCENT}88`,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  ROLANDO…
                </motion.p>
              )}
            </AnimatePresence>

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
                      const isSpecMax = v === dieType;
                      const isSpec1 = v === 1;
                      const bubbleColor = isSpecMax
                        ? "#ffd700"
                        : isSpec1
                          ? "#ff4050"
                          : "#a0c8f8";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1.0 }}
                          transition={{
                            delay: i * 0.07 + 0.15,
                            type: "spring",
                            stiffness: 300,
                          }}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 9,
                            border: `2px solid ${bubbleColor}`,
                            background: "rgba(8,14,30,0.95)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "Cinzel, serif",
                            fontSize: 20,
                            fontWeight: 700,
                            color: bubbleColor,
                            boxShadow: `0 0 ${isSpecMax || isSpec1 ? 24 : 12}px ${bubbleColor}66`,
                          }}
                        >
                          {v}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Result */}
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
                      }}
                    >
                      <span style={{ color: "#a0c8f8" }}>
                        {results.join(" + ")}
                      </span>
                      {!noBonus && (
                        <>
                          <span>+</span>
                          <span style={{ color: ACCENT }}>
                            {attrLabel} {attrSign}
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
                      resultado final
                    </p>
                  </motion.div>

                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.22)",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                    }}
                    onClick={onClose}
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
