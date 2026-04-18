import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Character } from "@/data/characterTypes";
import charactersData from "@characters";
import { InventoryPanel } from "@/components/inventory/InventoryPanel";
import {
  getCustomCharacter,
  isOwnedCharacter,
  saveCurrentValues,
  loadPeChecks,
  savePeChecks,
  loadSkillModifiers,
  saveSkillModifiers,
  loadDefenseModifiers,
  saveDefenseModifiers,
} from "@/lib/localCharacters";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/apiClient";
import { isApiCharacterId, mapApiToCharacter } from "@/lib/apiAdapter";
import { getAccent } from "@/components/character/types";
import { CharacterHero } from "@/components/character/CharacterHero";
import { StatsSection } from "@/components/character/StatsSection";
import { SkillsSection } from "@/components/character/SkillsSection";
import { ArcanoSection } from "@/components/character/ArcanoSection";
import { Tag, SectionLabel } from "@/components/character/CharacterUI";
import { FloatingDiceButton } from "@/components/character/FloatingDiceButton";
import { SkillTestOverlay } from "@/components/character/SkillTestOverlay";
import type { SkillTestData } from "@/components/character/SkillTestOverlay";
import { DamageRollOverlay } from "@/components/character/DamageRollOverlay";
import { DiceLogProvider } from "@/lib/diceLog";
import { DiceLogSidebar } from "@/components/character/DiceLogSidebar";

const PRESET_CHARACTERS = charactersData as Character[];
const EMPTY_PE = {
  fisico: Array(5).fill(false) as boolean[],
  destreza: Array(5).fill(false) as boolean[],
  intelecto: Array(5).fill(false) as boolean[],
  influencia: Array(5).fill(false) as boolean[],
};

export function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [character, setCharacter] = useState<Character | undefined>(undefined);
  const [owned, setOwned] = useState(false);
  const [charLoaded, setCharLoaded] = useState(false);

  const [currentHp, setCurrentHp] = useState(0);
  const [currentSanidade, setCurrentSanidade] = useState(0);
  const [slottedRunas, setSlottedRunas] = useState<(string | null)[]>(Array(5).fill(null));
  const [draggingRuna, setDraggingRuna] = useState<string | null>(null);
  const [peChecks, setPeChecks] = useState<Record<string, boolean[]>>(EMPTY_PE);
  const [skillModifiers, setSkillModifiers] = useState<Record<string, number>>({});
  const [daBase, setDaBase] = useState(1);
  const [daBonus, setDaBonus] = useState(0);
  const [dpBonus, setDpBonus] = useState(0);

  const isApiChar = id ? isApiCharacterId(id) : false;

  useEffect(() => {
    if (!id) { setCharLoaded(true); return; }

    if (isApiCharacterId(id)) {
      Promise.all([
        api.characters.get(id),
        api.state.get(id).catch(() => ({ state: null })),
      ]).then(([charRes, stateRes]) => {
        const raw = (charRes as { character: Record<string, unknown> }).character;
        const char = mapApiToCharacter(raw);
        setCharacter(char);
        setOwned(user?.id != null && raw.userId === user.id);
        setCurrentHp(char.currentHp ?? char.hp);
        setCurrentSanidade(char.currentSanidade ?? char.sanidade);
        const s = ((stateRes as { state: Record<string, unknown> | null }).state) ?? {};
        const pe = (s.peChecks as Record<string, boolean[]>) ?? {};
        setPeChecks({
          fisico:    pe.fisico    ?? Array(5).fill(false),
          destreza:  pe.destreza  ?? Array(5).fill(false),
          intelecto: pe.intelecto ?? Array(5).fill(false),
          influencia: pe.influencia ?? Array(5).fill(false),
        });
        setSkillModifiers((s.skillModifiers as Record<string, number>) ?? {});
        const dm = (s.defenseModifiers as { daBase?: number; daBonus?: number; dpBonus?: number }) ?? {};
        setDaBase(dm.daBase ?? 1);
        setDaBonus(dm.daBonus ?? 0);
        setDpBonus(dm.dpBonus ?? 0);
      }).catch(() => {
        /* character not found or forbidden — leave undefined */
      }).finally(() => setCharLoaded(true));
    } else {
      const char = PRESET_CHARACTERS.find((c) => c.id === id) ?? getCustomCharacter(id);
      setCharacter(char);
      setOwned(isOwnedCharacter(id));
      if (char) {
        setCurrentHp(char.currentHp ?? char.hp);
        setCurrentSanidade(char.currentSanidade ?? char.sanidade);
        const saved = loadPeChecks(id);
        setPeChecks({
          fisico:    saved.fisico    ?? Array(5).fill(false),
          destreza:  saved.destreza  ?? Array(5).fill(false),
          intelecto: saved.intelecto ?? Array(5).fill(false),
          influencia: saved.influencia ?? Array(5).fill(false),
        });
        setSkillModifiers(loadSkillModifiers(id));
        const dm = loadDefenseModifiers(id);
        setDaBase(dm.daBase);
        setDaBonus(dm.daBonus);
        setDpBonus(dm.dpBonus);
      }
      setCharLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const [historiaExpanded, setHistoriaExpanded] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [skillTest, setSkillTest] = useState<SkillTestData | null>(null);
  const [pendingDamageRoll, setPendingDamageRoll] = useState<{
    damageStr: string;
    equipmentName: string;
  } | null>(null);

  const { scrollY } = useScroll();
  const backOpacity = useTransform(scrollY, [0, 150], [1, 0.35]);

  useEffect(() => {
    document.title = character ? `${character.name} — Arcádia` : "Arcádia";
    window.scrollTo({ top: 0 });
  }, [id]);

  /* ── Runa DnD ─────────────────────────────────────────────────── */

  function handleDragStart(event: DragStartEvent) {
    setDraggingRuna(String(event.active.id).replace("runa-", ""));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingRuna(null);
    if (!over || !character) return;
    const runaName = String(active.id).replace("runa-", "");
    const slotIdx = parseInt(String(over.id).replace("slot-", ""), 10);
    if (isNaN(slotIdx) || slotIdx >= character.entropia) return;
    setSlottedRunas((prev) => {
      const next = [...prev];
      const prevSlot = next.indexOf(runaName);
      if (prevSlot !== -1) next[prevSlot] = null;
      next[slotIdx] = runaName;
      return next;
    });
  }

  function handleRemoveRuna(slotIdx: number) {
    setSlottedRunas((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  }

  /* ── Skill modifiers ──────────────────────────────────────────── */

  function handleModifierChange(skillKey: string, delta: number) {
    setSkillModifiers((prev) => {
      const next = { ...prev, [skillKey]: (prev[skillKey] ?? 0) + delta };
      if (id) {
        if (isApiChar) void api.state.updateSkillModifiers(id, next);
        else saveSkillModifiers(id, next);
      }
      return next;
    });
  }

  function handleModifierReset(skillKey: string) {
    setSkillModifiers((prev) => {
      const next = { ...prev };
      delete next[skillKey];
      if (id) {
        if (isApiChar) void api.state.updateSkillModifiers(id, next);
        else saveSkillModifiers(id, next);
      }
      return next;
    });
  }

  /* ── Defense modifiers ───────────────────────────────────────── */

  function handleDaBaseChange(delta: number) {
    setDaBase((prev) => {
      const next = Math.max(0, prev + delta);
      if (id) {
        if (isApiChar) void api.state.updateDefenseModifiers(id, { daBase: next, daBonus, dpBonus });
        else saveDefenseModifiers(id, { daBase: next, daBonus, dpBonus });
      }
      return next;
    });
  }

  function handleDaChange(delta: number) {
    setDaBonus((prev) => {
      const next = prev + delta;
      if (id) {
        if (isApiChar) void api.state.updateDefenseModifiers(id, { daBase, daBonus: next, dpBonus });
        else saveDefenseModifiers(id, { daBase, daBonus: next, dpBonus });
      }
      return next;
    });
  }

  function handleDaReset() {
    setDaBonus(0);
    if (id) {
      if (isApiChar) void api.state.updateDefenseModifiers(id, { daBase, daBonus: 0, dpBonus });
      else saveDefenseModifiers(id, { daBase, daBonus: 0, dpBonus });
    }
  }

  function handleDpChange(delta: number) {
    setDpBonus((prev) => {
      const next = prev + delta;
      if (id) {
        if (isApiChar) void api.state.updateDefenseModifiers(id, { daBase, daBonus, dpBonus: next });
        else saveDefenseModifiers(id, { daBase, daBonus, dpBonus: next });
      }
      return next;
    });
  }

  function handleDpReset() {
    setDpBonus(0);
    if (id) {
      if (isApiChar) void api.state.updateDefenseModifiers(id, { daBase, daBonus, dpBonus: 0 });
      else saveDefenseModifiers(id, { daBase, daBonus, dpBonus: 0 });
    }
  }

  /* ── PE checkboxes ────────────────────────────────────────────── */

  function handlePeToggle(attr: string, idx: number) {
    setPeChecks((prev) => {
      const next = { ...prev, [attr]: [...prev[attr]] };
      next[attr][idx] = !next[attr][idx];
      if (id) {
        if (isApiChar) void api.state.updatePeChecks(id, next);
        else savePeChecks(id, next);
      }
      return next;
    });
  }

  /* ── HP / Sanidade clicks ─────────────────────────────────────── */

  function handleHpClick(idx: number) {
    if (!owned || !id) return;
    const next = idx < currentHp ? idx : idx + 1;
    setCurrentHp(next);
    if (isApiChar) void api.characters.updateCurrentValues(id, { current_hp: next, current_sanidade: currentSanidade });
    else saveCurrentValues(id, next, currentSanidade);
  }

  function handleSanidadeClick(idx: number) {
    if (!owned || !id) return;
    const next = idx < currentSanidade ? idx : idx + 1;
    setCurrentSanidade(next);
    if (isApiChar) void api.characters.updateCurrentValues(id, { current_hp: currentHp, current_sanidade: next });
    else saveCurrentValues(id, currentHp, next);
  }

  function goEdit(step: number) {
    navigate(`/editar-ficha/${id}?step=${step}`);
  }

  /* ── Loading / Not found ─────────────────────────────────────── */

  if (!charLoaded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-abyss)" }}
      >
        <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem" }}>
          Carregando…
        </p>
      </div>
    );
  }

  if (!character) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-abyss)" }}
      >
        <div className="text-center space-y-4">
          <p
            className="font-display text-2xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Personagem não encontrado
          </p>
          <button
            onClick={() => navigate("/personagens")}
            style={{
              color: "var(--color-arcano-glow)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
            }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const accent = getAccent(character.afinidade);
  const antAccent = getAccent(character.antitese);

  return (
    <DiceLogProvider characterId={id}>
      <div style={{ background: "var(--color-abyss)", minHeight: "100vh" }}>
        {/* ── Fixed back button ─────────────────────────────── */}
        <motion.div
          style={{
            opacity: backOpacity,
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 50,
          }}
        >
          <button
            onClick={() => navigate("/personagens")}
            className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(4,10,20,0.75)",
              border: "1px solid rgba(255,255,255,0.13)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              letterSpacing: "0.12em",
            }}
          >
            ← Voltar
          </button>
        </motion.div>

        <CharacterHero
          character={character}
          accent={accent}
          scrollY={scrollY}
        />

        {/* ── SHEET ─────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
          <StatsSection
            character={character}
            accentText={accent.text}
            currentHp={currentHp}
            currentSanidade={currentSanidade}
            owned={owned}
            onHpClick={handleHpClick}
            onSanidadeClick={handleSanidadeClick}
            daBase={daBase}
            daBonus={daBonus}
            dpBonus={dpBonus}
            onDaBaseChange={handleDaBaseChange}
            onDaChange={handleDaChange}
            onDaReset={handleDaReset}
            onDpChange={handleDpChange}
            onDpReset={handleDpReset}
            onEdit={owned ? () => goEdit(1) : undefined}
          />

          <SkillsSection
            character={character}
            accentText={accent.text}
            peChecks={peChecks}
            skillModifiers={skillModifiers}
            onPeToggle={handlePeToggle}
            onModifierChange={handleModifierChange}
            onModifierReset={handleModifierReset}
            onEditAttrs={owned ? () => goEdit(2) : undefined}
            onEditSkills={owned ? () => goEdit(3) : undefined}
            onSkillTest={setSkillTest}
          />

          <ArcanoSection
            character={character}
            accent={accent}
            antAccent={antAccent}
            slottedRunas={slottedRunas}
            draggingRuna={draggingRuna}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onRemoveRuna={handleRemoveRuna}
            onEdit={owned ? () => goEdit(4) : undefined}
          />

          {/* Antecedentes */}
          <section>
            <SectionLabel
              accent={accent.text}
              onEdit={owned ? () => goEdit(5) : undefined}
            >
              Antecedentes
            </SectionLabel>
            <div className="flex flex-wrap gap-2">
              {character.antecedentes.map((ant) => (
                <Tag key={ant} color="#80A8C8" bg="rgba(32,96,160,0.12)">
                  {ant}
                </Tag>
              ))}
            </div>
          </section>

          {/* Traumas */}
          {character.traumas.length > 0 && (
            <section>
              <SectionLabel
                accent={accent.text}
                onEdit={owned ? () => goEdit(5) : undefined}
              >
                Traumas
              </SectionLabel>
              <div className="flex flex-wrap gap-2">
                {character.traumas.map((trauma) => (
                  <Tag key={trauma} color="#C05050" bg="rgba(160,32,32,0.15)">
                    {trauma}
                  </Tag>
                ))}
              </div>
            </section>
          )}

          {/* História */}
          {(character.historia || owned) && (
            <section>
              <div
                className="flex items-center gap-3 mb-4 cursor-pointer select-none"
                onClick={() => setHistoriaExpanded((v) => !v)}
              >
                <div
                  style={{
                    width: 3,
                    height: 16,
                    background: accent.text,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <motion.span
                  animate={{ rotate: historiaExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.75rem",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                >
                  ▶
                </motion.span>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: accent.text, fontFamily: "var(--font-ui)" }}
                >
                  História
                </p>
                {owned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goEdit(6);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 4,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      padding: "0.25rem 0.6rem",
                    }}
                  >
                    ✎
                  </button>
                )}
              </div>

              <AnimatePresence initial={false}>
                {historiaExpanded && (
                  <motion.div
                    key="historia-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="mb-4">
                      {character.historia ? (
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.95rem",
                            lineHeight: 1.8,
                            color: "var(--color-text-secondary)",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {character.historia}
                        </p>
                      ) : (
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.85rem",
                            color: "var(--color-text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Nenhuma história escrita ainda.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}

          <div
            className="pt-6 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <button
              onClick={() => navigate("/personagens")}
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              ← Voltar
            </button>
          </div>
        </div>

        {/* ── Floating backpack button ──────────────────────── */}
        <button
          onClick={() => setInventoryOpen(true)}
          title="Abrir inventário"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 80,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent.bg}, rgba(4,10,20,0.95))`,
            border: `1px solid ${accent.text}55`,
            boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accent.glow}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = `0 6px 32px rgba(0,0,0,0.6), 0 0 24px ${accent.glow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accent.glow}`;
          }}
        >
          🎒
        </button>

        {/* ── Floating dice button ─────────────────────────── */}
        <FloatingDiceButton accentColor={accent.text} />

        {/* ── Skill test overlay ───────────────────────────── */}
        {skillTest && (
          <SkillTestOverlay {...skillTest} onClose={() => setSkillTest(null)} />
        )}

        {/* ── Damage roll overlay ───────────────────────────── */}
        {pendingDamageRoll && (
          <DamageRollOverlay
            damageStr={pendingDamageRoll.damageStr}
            equipmentName={pendingDamageRoll.equipmentName}
            onClose={() => setPendingDamageRoll(null)}
          />
        )}

        {/* ── Inventory panel ───────────────────────────────── */}
        {id && (
          <InventoryPanel
            characterId={id}
            fisico={character.attributes.fisico}
            accentColor={accent.text}
            isOpen={inventoryOpen}
            onClose={() => setInventoryOpen(false)}
            onRollDamage={(damageStr, equipmentName) =>
              setPendingDamageRoll({ damageStr, equipmentName })
            }
          />
        )}

        {/* ── Dice log sidebar ─────────────────────────────── */}
        <DiceLogSidebar />
      </div>
    </DiceLogProvider>
  );
}
