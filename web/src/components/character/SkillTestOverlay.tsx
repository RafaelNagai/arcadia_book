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
import {
  type SpecialState,
  detectSpecialState,
  getChosenIndices,
  ParticleLayer,
  STATE_META,
  SpecialBanner,
} from "./ArcaneStates";
import { useDiceLog } from "@/lib/diceLog";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

export interface SkillTestData {
  skillLabel: string;
  skillValue: number; // base value from character.skills[key]
  modifier: number; // from skillModifiers[key] ?? 0
  hasTalent: boolean;
  defaultAttr: "fisico" | "destreza" | "intelecto" | "influencia";
  attrColor: string;
  attributes: {
    fisico: number;
    destreza: number;
    intelecto: number;
    influencia: number;
  };
}

interface SkillTestOverlayProps extends SkillTestData {
  onClose: () => void;
}

const ATTR_META = [
  { key: "fisico" as const, label: "Físico", color: "#C04040" },
  { key: "destreza" as const, label: "Destreza", color: "#20A080" },
  { key: "intelecto" as const, label: "Intelecto", color: "#4080C0" },
  { key: "influencia" as const, label: "Influência", color: "#A060C0" },
];

/* ────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────── */

export function SkillTestOverlay({
  skillLabel,
  skillValue,
  modifier,
  hasTalent,
  defaultAttr,
  attrColor,
  attributes,
  onClose,
}: SkillTestOverlayProps) {
  const { addEntry } = useDiceLog();
  const defaultDice = hasTalent ? 3 : 2;
  const [phase, setPhase] = useState<"config" | "rolling" | "settled">(
    "config",
  );
  const [diceCount, setDiceCount] = useState(defaultDice);
  const [selectedAttr, setSelectedAttr] = useState(defaultAttr);
  const [results, setResults] = useState<number[]>([]);
  const [sceneKey, setSceneKey] = useState(0);
  const shakeControls = useAnimation();

  const skillTotal = skillValue + modifier;
  const attrValue = attributes[selectedAttr];
  const attrMeta = ATTR_META.find((a) => a.key === selectedAttr)!;

  // "used dice" = indices of the 2 highest values (or 1 if only 1 die rolled)
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
  const noBonus =
    specialState === "falha_critica" || specialState === "desastre";
  const finalResult = noBonus ? diceSum : diceSum + attrValue + skillTotal;

  const diceRequest = useMemo<DiceRollRequest[]>(
    () => (diceCount > 0 ? [{ dieType: 12, count: diceCount }] : []),
    [diceCount],
  );

  // ESC closes
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Screen shake on Desastre
  const shookRef = useRef(false);
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

  const handleAllSettled = useCallback(
    (vals: number[]) => {
      setResults(vals);
      setPhase("settled");
      // Compute log data from vals directly (state hasn't propagated yet)
      const usedN = Math.min(2, vals.length);
      const chosenIdx = getChosenIndices(vals, usedN);
      const chosenVals = vals.filter((_, i) => chosenIdx.has(i));
      const ss = detectSpecialState(chosenVals);
      const dSum = chosenVals.reduce((a, b) => a + b, 0);
      const noBonus = ss === "falha_critica" || ss === "desastre";
      const finalRes = noBonus ? dSum : dSum + attrValue + skillTotal;
      addEntry({
        type: "skill",
        skillLabel,
        skillValue,
        modifier,
        attrLabel: selectedAttr,
        attrValue,
        results: vals,
        chosenIndices: [...chosenIdx],
        diceSum: dSum,
        finalResult: finalRes,
        specialState: ss,
      });
    },
    [
      addEntry,
      attrValue,
      skillTotal,
      skillLabel,
      skillValue,
      modifier,
      selectedAttr,
    ],
  );

  const resultColor = useMemo(() => {
    if (!specialState) return "var(--color-arcano-glow)";
    return STATE_META[specialState].color;
  }, [specialState]);

  const resultGlow = useMemo(() => {
    if (!specialState) return "rgba(232,184,75,0.7)";
    return STATE_META[specialState].glow;
  }, [specialState]);

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
        {/* ── CONFIG PHASE ── */}
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
                border: `1px solid ${attrColor}55`,
                borderRadius: 16,
                padding: "28px 32px",
                minWidth: 320,
                maxWidth: 380,
                width: "90vw",
                boxShadow: `0 16px 60px rgba(0,0,0,0.7), 0 0 40px ${attrColor}22`,
              }}
            >
              {/* Skill header */}
              <div
                style={{
                  marginBottom: 22,
                  borderBottom: `1px solid ${attrColor}33`,
                  paddingBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: attrColor,
                      fontFamily: "var(--font-ui)",
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    Teste de Perícia
                  </span>
                  {hasTalent && (
                    <span
                      style={{
                        fontSize: 10,
                        color: attrColor,
                        fontFamily: "var(--font-ui)",
                        background: attrColor + "22",
                        border: `1px solid ${attrColor}55`,
                        borderRadius: 4,
                        padding: "1px 6px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      ◆ TALENTO
                    </span>
                  )}
                </div>
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
                    {skillLabel}
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 28,
                        color: attrColor,
                      }}
                    >
                      {skillTotal}
                    </span>
                    {modifier !== 0 && (
                      <div
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: 10,
                          color: modifier > 0 ? "#6EC840" : "#D04040",
                          letterSpacing: "0.08em",
                        }}
                      >
                        base {skillValue}{" "}
                        {modifier > 0 ? `+${modifier}` : modifier}
                      </div>
                    )}
                  </div>
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
                  Dados D12
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
                        ? "2× desvantagem"
                        : diceCount === 2
                          ? "padrão"
                          : diceCount === 3 && hasTalent
                            ? "talento"
                            : `+${diceCount - 2} vantagem`}
                  </span>
                </div>
              </div>

              {/* Attribute selector */}
              <div style={{ marginBottom: 24 }}>
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
                  Atributo
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}
                >
                  {ATTR_META.map((a) => {
                    const active = selectedAttr === a.key;
                    return (
                      <button
                        key={a.key}
                        onClick={() => setSelectedAttr(a.key)}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: `1px solid ${active ? a.color : "var(--color-border)"}`,
                          background: active ? a.color + "22" : "transparent",
                          color: active ? a.color : "var(--color-text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                          transition: "all 0.12s",
                          fontFamily: "var(--font-ui)",
                          boxShadow: active ? `0 0 10px ${a.color}33` : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: active ? 700 : 400,
                            letterSpacing: "0.06em",
                          }}
                        >
                          {a.label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 15,
                          }}
                        >
                          {attributes[a.key]}
                        </span>
                      </button>
                    );
                  })}
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
                <span>2 maiores D12</span>
                <span>+</span>
                <span style={{ color: attrMeta.color }}>
                  {attrMeta.label} ({attrValue})
                </span>
                <span>+</span>
                <span style={{ color: attrColor }}>
                  {skillLabel} ({skillTotal})
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
                  border: `1px solid ${diceCount > 0 ? attrColor : "var(--color-border)"}`,
                  background: diceCount > 0 ? attrColor + "28" : "transparent",
                  color: diceCount > 0 ? attrColor : "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.22em",
                  cursor: diceCount === 0 ? "not-allowed" : "pointer",
                  opacity: diceCount === 0 ? 0.4 : 1,
                  transition: "all 0.15s",
                  boxShadow: diceCount > 0 ? `0 0 18px ${attrColor}44` : "none",
                }}
              >
                ROLAR {diceCount > 0 ? `${diceCount}D12` : ""}
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

        {/* ── ROLLING & SETTLED PHASES (share the 3D canvas) ── */}
        {(phase === "rolling" || phase === "settled") && (
          <motion.div
            key="dice-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0 }}
          >
            {/* 3D canvas */}
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

            {/* Particle layer (only on settled + special state) */}
            {phase === "settled" && specialState && (
              <ParticleLayer state={specialState} />
            )}

            {/* Rolling pulse */}
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
                    color: "rgba(232,184,75,0.55)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  ROLANDO…
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── SETTLED RESULT PANEL ── */}
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

                  {/* Dice bubbles — chosen vs discarded */}
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
                      const isSpecial12 = isChosen && v === 12;
                      const isSpecial1 = isChosen && v === 1;
                      const bubbleColor = isSpecial12
                        ? "#ffd700"
                        : isSpecial1
                          ? "#ff4050"
                          : isChosen
                            ? "#a0c8f8"
                            : "#6a7a90";
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
                            border: `${isChosen ? 2 : 1}px solid ${bubbleColor}`,
                            background: isChosen
                              ? "rgba(8,14,30,0.95)"
                              : "rgba(8,14,30,0.70)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "Cinzel, serif",
                            fontSize: isChosen ? 20 : 15,
                            fontWeight: 700,
                            color: bubbleColor,
                            boxShadow: isChosen
                              ? `0 0 ${isSpecial12 || isSpecial1 ? 24 : 12}px ${bubbleColor}66`
                              : "none",
                            opacity: isChosen ? 1 : 0.65,
                          }}
                        >
                          {v}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Result calculation */}
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
                        {chosenValues.join(" + ")}
                      </span>
                      {!noBonus && (
                        <>
                          <span>+</span>
                          <span style={{ color: attrMeta.color }}>
                            {attrMeta.label} {attrValue}
                          </span>
                          <span>+</span>
                          <span style={{ color: attrColor }}>
                            {skillLabel} {skillTotal}
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

            {/* ESC hint (rolling phase) */}
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
