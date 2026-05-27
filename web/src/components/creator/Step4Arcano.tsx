import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ELEMENTS, ELEMENT_COLORS, D6_MAP, d6 } from "./types";
import type { ElementName } from "./types";
import type { CharacterModificadores } from "@/data/characterTypes";
import { Field, Stepper, SectionDivider } from "./CreatorUI";

interface DiceRollState {
  dice: [number, number];
  picks: [ElementName | null, ElementName | null];
  swapped: boolean;
}

export function Step4Arcano({
  afinidade,
  antitese,
  modificadores,
  onChange,
}: {
  afinidade: string;
  antitese: string;
  modificadores: CharacterModificadores;
  onChange: (k: string, v: string | number | CharacterModificadores) => void;
}) {
  const [diceRoll, setDiceRoll] = useState<DiceRollState | null>(null);
  const [rolling, setRolling] = useState(false);

  const doRoll = useCallback(() => {
    setRolling(true);
    setDiceRoll(null);
    setTimeout(() => {
      const d1 = d6(),
        d2 = d6();
      const p1 = D6_MAP[d1];
      const p2 = D6_MAP[d2];
      const state: DiceRollState = {
        dice: [d1, d2],
        picks: [p1, p2],
        swapped: false,
      };
      setDiceRoll(state);
      setRolling(false);
      if (p1 && p2) {
        onChange("afinidade", p1);
        onChange("antitese", p2);
      } else if (p1 && !p2) {
        onChange("afinidade", p1);
      } else if (!p1 && p2) {
        onChange("afinidade", p2);
      }
    }, 350);
  }, [onChange]);

  function applyDiceResult(state: DiceRollState) {
    const el0 = state.picks[0],
      el1 = state.picks[1];
    if (!el0 || !el1) return;
    onChange("afinidade", state.swapped ? el1 : el0);
    onChange("antitese", state.swapped ? el0 : el1);
  }

  function handleFreePick(idx: 0 | 1, el: ElementName) {
    if (!diceRoll) return;
    const next: DiceRollState = {
      ...diceRoll,
      picks: [...diceRoll.picks] as [ElementName | null, ElementName | null],
    };
    next.picks[idx] = el;
    setDiceRoll(next);
    if (next.picks[0] && next.picks[1]) applyDiceResult(next);
    else if (idx === 0 && next.picks[0]) onChange("afinidade", next.picks[0]);
    else if (idx === 1 && next.picks[1]) onChange("antitese", next.picks[1]);
  }

  function handleSwap() {
    if (!diceRoll || !diceRoll.picks[0] || !diceRoll.picks[1]) return;
    const next = { ...diceRoll, swapped: !diceRoll.swapped };
    setDiceRoll(next);
    applyDiceResult(next);
  }

  const resolvedEl0 = diceRoll
    ? diceRoll.swapped
      ? diceRoll.picks[1]
      : diceRoll.picks[0]
    : null;
  const resolvedEl1 = diceRoll
    ? diceRoll.swapped
      ? diceRoll.picks[0]
      : diceRoll.picks[1]
    : null;
  const diceReady = resolvedEl0 && resolvedEl1;

  function handleModificador(key: keyof CharacterModificadores, v: number) {
    onChange("modificadores", { ...modificadores, [key]: v });
  }

  return (
    <div className="space-y-6">
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.85rem",
          color: "var(--color-text-secondary)",
        }}
      >
        O Arcano define a relação do personagem com as forças elementais. Role
        os dados ou escolha manualmente.
      </p>

      {/* ── 2D6 roller ─────────────────────────────────── */}
      <div
        className="rounded-sm p-4 space-y-4"
        style={{
          background: "rgba(200,146,42,0.06)",
          border: "1px solid rgba(200,146,42,0.2)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-arcano-dim)",
          }}
        >
          ✦ Gerador — Rolar 2D6
        </p>
        <button
          onClick={doRoll}
          disabled={rolling}
          style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: 4,
            background: rolling
              ? "rgba(200,146,42,0.1)"
              : "var(--color-arcano)",
            border: "none",
            cursor: rolling ? "not-allowed" : "pointer",
            color: "#0A0A0A",
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
        >
          {rolling ? "Rolando…" : diceRoll ? "Rolar Novamente" : "Rolar 2D6"}
        </button>

        <AnimatePresence>
          {diceRoll && !rolling && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Dice display */}
              <div className="flex gap-3 justify-center">
                {([0, 1] as const).map((i) => {
                  const die = diceRoll.dice[i];
                  const isFree = die === 6;
                  const el = diceRoll.picks[i];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 8,
                          background: isFree
                            ? "rgba(200,146,42,0.18)"
                            : "rgba(15,23,41,0.7)",
                          border: `1px solid ${isFree ? "var(--color-arcano)" : "rgba(255,255,255,0.15)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "1.6rem",
                          color: isFree
                            ? "var(--color-arcano-glow)"
                            : "#EEF4FC",
                        }}
                      >
                        {die}
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.6rem",
                          color: el
                            ? (ELEMENT_COLORS[el]?.text ??
                              "var(--color-text-muted)")
                            : "var(--color-arcano-dim)",
                        }}
                      >
                        {isFree ? "livre" : (el ?? "?")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Free choice pickers */}
              {diceRoll.dice[0] === 6 && !diceRoll.picks[0] && (
                <div className="space-y-1.5">
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      color: "var(--color-arcano-glow)",
                      textAlign: "center",
                    }}
                  >
                    Dado 1 — Livre escolha
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {ELEMENTS.map((el) => {
                      const ac = ELEMENT_COLORS[el];
                      return (
                        <button
                          key={el}
                          onClick={() => handleFreePick(0, el)}
                          style={{
                            padding: "0.3rem 0.7rem",
                            borderRadius: 4,
                            background: ac.bg,
                            border: `1px solid ${ac.border}`,
                            color: ac.text,
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                          }}
                        >
                          {el}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {diceRoll.dice[1] === 6 && !diceRoll.picks[1] && (
                <div className="space-y-1.5">
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      color: "var(--color-arcano-glow)",
                      textAlign: "center",
                    }}
                  >
                    Dado 2 — Livre escolha
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {ELEMENTS.map((el) => {
                      const ac = ELEMENT_COLORS[el];
                      return (
                        <button
                          key={el}
                          onClick={() => handleFreePick(1, el)}
                          style={{
                            padding: "0.3rem 0.7rem",
                            borderRadius: 4,
                            background: ac.bg,
                            border: `1px solid ${ac.border}`,
                            color: ac.text,
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                          }}
                        >
                          {el}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Result + swap */}
              {diceReady && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {(
                      [
                        {
                          label: "Afinidade",
                          hint: "sem penalidade",
                          el: resolvedEl0!,
                        },
                        {
                          label: "Antítese",
                          hint: "−10 nos testes",
                          el: resolvedEl1!,
                        },
                      ] as { label: string; hint: string; el: ElementName }[]
                    ).map(({ label, hint, el }) => {
                      const ac = ELEMENT_COLORS[el];
                      return (
                        <div
                          key={label}
                          className="flex-1 rounded-sm px-3 py-2"
                          style={{
                            background: ac.bg,
                            border: `1px solid ${ac.border}`,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontSize: "0.55rem",
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: ac.text,
                              opacity: 0.75,
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: ac.text,
                            }}
                          >
                            {el}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontSize: "0.55rem",
                              color: ac.text,
                              opacity: 0.6,
                            }}
                          >
                            {hint}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {resolvedEl0 !== resolvedEl1 && (
                    <button
                      onClick={handleSwap}
                      style={{
                        width: "100%",
                        padding: "0.45rem",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                      }}
                    >
                      ⇄ Inverter — Afinidade ↔ Antítese
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Manual override ─────────────────────────────── */}
      <SectionDivider label="Ou escolha manualmente" />

      <Field
        label="Afinidade"
        hint="Elemento natural — sem penalidade nos testes"
      >
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => {
            const ac = ELEMENT_COLORS[el];
            const active = afinidade === el;
            return (
              <button
                key={el}
                onClick={() => onChange("afinidade", el)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active ? ac.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? ac.border : "rgba(255,255,255,0.1)"}`,
                  color: active ? ac.text : "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  boxShadow: active ? `0 0 12px ${ac.border}` : "none",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {el}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Antítese" hint="Elemento parasita — −10 nos testes arcanos">
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => {
            const ac = ELEMENT_COLORS[el];
            const active = antitese === el;
            return (
              <button
                key={el}
                onClick={() => onChange("antitese", el)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active ? ac.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? ac.border : "rgba(255,255,255,0.1)"}`,
                  color: active ? ac.text : "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  boxShadow: active ? `0 0 12px ${ac.border}` : "none",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {el}
              </button>
            );
          })}
        </div>
      </Field>

      <SectionDivider label="Modificadores" />

      <div
        style={{
          padding: "1.25rem",
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(7, 22, 24, 0.18) 0%, rgba(60, 181, 200,0.9) 120%)",
          border: "1px solid rgba(60, 181, 200, 0.28)",
        }}
        className="space-y-3"
      >
        {(
          [
            {
              key: "potencia",
              label: "Potência",
              hint: "Força e grandeza da magia",
            },
            {
              key: "forma",
              label: "Forma",
              hint: "Modelagem, direção e área da magia",
            },
            {
              key: "complexidade",
              label: "Complexidade",
              hint: "Condições, gatilhos e efeitos",
            },
            {
              key: "controle",
              label: "Controle",
              hint: "Precisão, estabilidade e duração",
            },
          ] as {
            key: keyof CharacterModificadores;
            label: string;
            hint: string;
          }[]
        ).map(({ key, label, hint }) => (
          <Field key={key} label={label} hint={hint}>
            <Stepper
              value={modificadores[key]}
              onChange={(v) => handleModificador(key, v)}
              color="#60c5d0"
            />
          </Field>
        ))}
      </div>
    </div>
  );
}
