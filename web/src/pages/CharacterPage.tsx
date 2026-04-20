import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import {
  isApiCharacterId,
  mapApiToCharacter,
  buildInventoryFromApi,
  type ApiRawBag,
  type ApiRawItem,
} from "@/lib/apiAdapter";
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
import type { DiceLogEntry } from "@/lib/diceLog";
import { DiceLogSidebar } from "@/components/character/DiceLogSidebar";
import { useCharacterRealtime } from "@/hooks/useCharacterRealtime";

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
  const location = useLocation();
  const locationState = location.state as { fromCampaignId?: string; fromCampaignView?: string } | null;
  const fromCampaignId: string | null =
    locationState?.fromCampaignId ??
    new URLSearchParams(location.search).get('campaignId');
  const fromCampaignView: string | null = locationState?.fromCampaignView ?? null;
  const { user } = useAuth();

  const [character, setCharacter] = useState<Character | undefined>(undefined);
  const [owned, setOwned] = useState(false);
  const [charLoaded, setCharLoaded] = useState(false);
  const [initialDiceLog, setInitialDiceLog] = useState<DiceLogEntry[] | undefined>(undefined);
  const [inventorySnapshot, setInventorySnapshot] = useState<{ bags: ApiRawBag[]; items: ApiRawItem[] } | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [historiaExpanded, setHistoriaExpanded] = useState(false);
  const diceLogSetterRef = useRef<((entries: DiceLogEntry[]) => void) | null>(null);

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
        setInitialDiceLog((s.diceLog as DiceLogEntry[]) ?? []);
        const pub = (raw.isPublic as boolean) ?? false;
        setIsPublic(pub);
        if (pub && raw.userId !== user?.id) setHistoriaExpanded(true);
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

  useEffect(() => {
    if (initialDiceLog !== undefined && diceLogSetterRef.current) {
      diceLogSetterRef.current(initialDiceLog);
    }
  }, [initialDiceLog]);

  const [inventoryOpen, setInventoryOpen] = useState(false);

  const [isGmOfCampaign, setIsGmOfCampaign] = useState(false);
  const canEdit = owned || isGmOfCampaign;

  // If navigated from a campaign, check if user is GM (to show edit buttons)
  useEffect(() => {
    if (!fromCampaignId || !user || !charLoaded) return;
    api.campaigns.get(fromCampaignId)
      .then(res => {
        const c = (res as { campaign: { isGm: boolean } }).campaign;
        setIsGmOfCampaign(c.isGm);
      })
      .catch(() => {});
  }, [fromCampaignId, user, charLoaded]);

  // Realtime sync — only for API characters
  const builtInventorySnapshot = inventorySnapshot
    ? buildInventoryFromApi(inventorySnapshot.bags, inventorySnapshot.items)
    : null;

  useCharacterRealtime(isApiChar ? id : undefined, {
    onCharacterUpdate: (data) => {
      // Realtime payload is snake_case from DB — update display values directly
      if ('current_hp' in data && data.current_hp != null)
        setCurrentHp(data.current_hp as number)
      if ('current_sanidade' in data && data.current_sanidade != null)
        setCurrentSanidade(data.current_sanidade as number)
      // Re-fetch full character for other field changes
      if (id) {
        api.characters.get(id)
          .then(res => {
            const raw = (res as { character: Record<string, unknown> }).character
            setCharacter(mapApiToCharacter(raw))
          })
          .catch(() => {})
      }
    },
    onStateUpdate: (data) => {
      if (data.pe_checks) {
        const pe = data.pe_checks;
        setPeChecks({
          fisico:     pe.fisico     ?? Array(5).fill(false),
          destreza:   pe.destreza   ?? Array(5).fill(false),
          intelecto:  pe.intelecto  ?? Array(5).fill(false),
          influencia: pe.influencia ?? Array(5).fill(false),
        });
      }
      if (data.skill_modifiers) setSkillModifiers(data.skill_modifiers);
      if (data.defense_modifiers) {
        setDaBase(data.defense_modifiers.daBase);
        setDaBonus(data.defense_modifiers.daBonus);
        setDpBonus(data.defense_modifiers.dpBonus);
      }
      if (data.dice_log) diceLogSetterRef.current?.(data.dice_log);
    },
    onInventoryChange: async () => {
      if (!id) return;
      try {
        const res = await api.inventory.get(id) as { bags: ApiRawBag[]; items: ApiRawItem[] };
        setInventorySnapshot({ bags: res.bags, items: res.items });
      } catch { /* ignore */ }
    },
  });

  // Campaign membership
  interface CampaignMembership { id: string; campaignId: string; campaign: { id: string; title: string } }
  const [membership, setMembership] = useState<CampaignMembership | null | undefined>(undefined)
  const [joinCode, setJoinCode] = useState('')
  const [joiningCampaign, setJoiningCampaign] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
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
    if (!canEdit || !id) return;
    const next = idx < currentHp ? idx : idx + 1;
    setCurrentHp(next);
    if (isApiChar) void api.characters.updateCurrentValues(id, { current_hp: next, current_sanidade: currentSanidade });
    else saveCurrentValues(id, next, currentSanidade);
  }

  function handleSanidadeClick(idx: number) {
    if (!canEdit || !id) return;
    const next = idx < currentSanidade ? idx : idx + 1;
    setCurrentSanidade(next);
    if (isApiChar) void api.characters.updateCurrentValues(id, { current_hp: currentHp, current_sanidade: next });
    else saveCurrentValues(id, currentHp, next);
  }

  function goEdit(step: number) {
    navigate(`/editar-ficha/${id}?step=${step}`);
  }

  // Load campaign membership for owned API chars
  useEffect(() => {
    if (!id || !isApiChar || !owned) { setMembership(null); return; }
    api.campaigns.getMembership(id)
      .then(res => setMembership((res as { membership: CampaignMembership | null }).membership))
      .catch(() => setMembership(null))
  }, [id, isApiChar, owned]);

  async function handleJoinCampaign() {
    if (!id || !joinCode.trim()) return;
    setJoiningCampaign(true);
    setJoinError(null);
    try {
      await api.campaigns.join(joinCode.trim().toUpperCase(), id);
      const res = await api.campaigns.getMembership(id);
      setMembership((res as { membership: CampaignMembership | null }).membership);
      setJoinCode('');
    } catch (err) {
      setJoinError((err as Error).message);
    } finally {
      setJoiningCampaign(false);
    }
  }

  async function handleLeaveCampaign() {
    if (!id || !membership) return;
    await api.campaigns.leave(membership.campaignId, id);
    setMembership(null);
  }

  async function handleToggleVisibility() {
    if (!id) return;
    const next = !isPublic;
    setIsPublic(next);
    try {
      await api.characters.setVisibility(id, next);
    } catch {
      setIsPublic(!next);
    }
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
            onClick={() => fromCampaignId ? navigate(`/campanha/${fromCampaignId}${fromCampaignView ? `?view=${fromCampaignView}` : ''}`) : navigate("/personagens")}
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
    <DiceLogProvider
      characterId={id}
      initialEntries={isApiChar ? (initialDiceLog ?? []) : undefined}
      persistEntry={isApiChar && !!user && !!id ? (entry) => void api.state.appendDiceLog(id, entry) : undefined}
      persistClear={isApiChar && !!user && !!id ? () => void api.state.clearDiceLog(id) : undefined}
      setterRef={isApiChar ? diceLogSetterRef : undefined}
    >
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
            onClick={() => fromCampaignId ? navigate(`/campanha/${fromCampaignId}${fromCampaignView ? `?view=${fromCampaignView}` : ''}`) : navigate("/personagens")}
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
            owned={canEdit}
            onHpClick={handleHpClick}
            onSanidadeClick={handleSanidadeClick}
            daBase={daBase}
            daBonus={daBonus}
            dpBonus={dpBonus}
            onDaBaseChange={canEdit ? handleDaBaseChange : undefined}
            onDaChange={canEdit ? handleDaChange : undefined}
            onDaReset={canEdit ? handleDaReset : undefined}
            onDpChange={canEdit ? handleDpChange : undefined}
            onDpReset={canEdit ? handleDpReset : undefined}
            onEdit={canEdit ? () => goEdit(1) : undefined}
          />

          <SkillsSection
            character={character}
            accentText={accent.text}
            peChecks={peChecks}
            skillModifiers={skillModifiers}
            onPeToggle={canEdit ? handlePeToggle : undefined}
            onModifierChange={canEdit ? handleModifierChange : undefined}
            onModifierReset={canEdit ? handleModifierReset : undefined}
            onEditAttrs={canEdit ? () => goEdit(2) : undefined}
            onEditSkills={canEdit ? () => goEdit(3) : undefined}
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
            onEdit={canEdit ? () => goEdit(4) : undefined}
          />

          {/* Antecedentes */}
          <section>
            <SectionLabel
              accent={accent.text}
              onEdit={canEdit ? () => goEdit(5) : undefined}
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
                onEdit={canEdit ? () => goEdit(5) : undefined}
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
          {(character.historia || canEdit) && (
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
                {canEdit && (
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

          {/* ── Visibilidade ─────────────────────────────────── */}
          {owned && isApiChar && (
            <section>
              <SectionLabel accent={accent.text}>Visibilidade</SectionLabel>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isPublic ? 'rgba(110,200,64,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 4, gap: '0.75rem', flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 600, color: isPublic ? '#6EC840' : 'var(--color-text-secondary)', marginBottom: '0.15rem' }}>
                    {isPublic ? 'Ficha pública' : 'Ficha privada'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {isPublic
                      ? 'Visível para todos. Somente você e o mestre podem editar.'
                      : 'Visível apenas para você e o mestre da campanha.'}
                  </p>
                </div>
                <button
                  onClick={handleToggleVisibility}
                  style={{
                    padding: '0.4rem 0.85rem', borderRadius: 4,
                    background: isPublic ? 'rgba(200,60,60,0.1)' : 'rgba(110,200,64,0.1)',
                    border: `1px solid ${isPublic ? 'rgba(200,60,60,0.3)' : 'rgba(110,200,64,0.3)'}`,
                    color: isPublic ? '#E07070' : '#6EC840',
                    fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {isPublic ? 'Tornar privada' : 'Tornar pública'}
                </button>
              </div>
            </section>
          )}

          {/* ── Campanha ─────────────────────────────────────── */}
          {owned && isApiChar && membership !== undefined && (
            <section>
              <SectionLabel accent={accent.text}>Campanha</SectionLabel>
              {membership ? (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4, gap: "0.75rem", flexWrap: "wrap",
                }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.2rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Vinculado a
                    </p>
                    <button
                      onClick={() => navigate(`/campanha/${membership.campaignId}`)}
                      style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: accent.text, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {membership.campaign.title}
                    </button>
                  </div>
                  <button
                    onClick={handleLeaveCampaign}
                    style={{
                      padding: "0.4rem 0.85rem", borderRadius: 4,
                      background: "rgba(200,60,60,0.1)",
                      border: "1px solid rgba(200,60,60,0.3)",
                      color: "#E07070", fontFamily: "var(--font-ui)",
                      fontSize: "0.72rem", cursor: "pointer",
                    }}
                  >
                    Sair da campanha
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    Este personagem não está em nenhuma campanha.
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Código de convite"
                      maxLength={10}
                      style={{
                        flex: 1, padding: "0.55rem 0.75rem",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 4, color: "var(--color-text-primary)",
                        fontFamily: "var(--font-display)", fontSize: "0.95rem",
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        outline: "none",
                      }}
                      onKeyDown={e => e.key === "Enter" && handleJoinCampaign()}
                    />
                    <button
                      onClick={handleJoinCampaign}
                      disabled={joiningCampaign || !joinCode.trim()}
                      style={{
                        padding: "0.55rem 1rem", borderRadius: 4, border: "none",
                        background: joinCode.trim() && !joiningCampaign ? accent.text : "rgba(255,255,255,0.05)",
                        color: joinCode.trim() && !joiningCampaign ? "#0A0A0A" : "rgba(255,255,255,0.2)",
                        fontFamily: "var(--font-ui)", fontSize: "0.75rem", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        cursor: joinCode.trim() && !joiningCampaign ? "pointer" : "not-allowed",
                      }}
                    >
                      {joiningCampaign ? "…" : "Entrar"}
                    </button>
                  </div>
                  {joinError && (
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#E07070" }}>
                      {joinError}
                    </p>
                  )}
                </div>
              )}
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
            canEdit={canEdit}
            inventorySnapshot={builtInventorySnapshot}
          />
        )}

        {/* ── Dice log sidebar ─────────────────────────────── */}
        <DiceLogSidebar />
      </div>
    </DiceLogProvider>
  );
}
