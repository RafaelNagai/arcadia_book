import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import type { Character } from "@/data/characterTypes"
import charactersData from "@characters"
import { InventoryPanel } from "@/components/inventory/InventoryPanel"
import {
  getCustomCharacter,
  isOwnedCharacter,
  saveCurrentValues,
  loadPeChecks,
  savePeChecks,
  loadSkillModifiers,
  saveSkillModifiers,
} from "@/lib/localCharacters"
import { getAccent } from "@/components/character/types"
import { CharacterHero } from "@/components/character/CharacterHero"
import { StatsSection } from "@/components/character/StatsSection"
import { SkillsSection } from "@/components/character/SkillsSection"
import { ArcanoSection } from "@/components/character/ArcanoSection"
import { Tag, SectionLabel } from "@/components/character/CharacterUI"
import { FloatingDiceButton } from "@/components/character/FloatingDiceButton"
import { SkillTestOverlay } from "@/components/character/SkillTestOverlay"
import type { SkillTestData } from "@/components/character/SkillTestOverlay"
import { DamageRollOverlay } from "@/components/character/DamageRollOverlay"

const PRESET_CHARACTERS = charactersData as Character[]

export function CharacterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const character = id
    ? (PRESET_CHARACTERS.find((c) => c.id === id) ?? getCustomCharacter(id))
    : undefined
  const owned = id ? isOwnedCharacter(id) : false

  const [currentHp, setCurrentHp] = useState<number>(() =>
    character ? (character.currentHp ?? character.hp) : 0,
  )
  const [currentSanidade, setCurrentSanidade] = useState<number>(() =>
    character ? (character.currentSanidade ?? character.sanidade) : 0,
  )
  const [slottedRunas, setSlottedRunas] = useState<(string | null)[]>(
    Array(5).fill(null),
  )
  const [draggingRuna, setDraggingRuna] = useState<string | null>(null)

  const [peChecks, setPeChecks] = useState<Record<string, boolean[]>>(() => {
    const saved = id ? loadPeChecks(id) : {}
    return {
      fisico:     saved.fisico     ?? Array(5).fill(false),
      destreza:   saved.destreza   ?? Array(5).fill(false),
      intelecto:  saved.intelecto  ?? Array(5).fill(false),
      influencia: saved.influencia ?? Array(5).fill(false),
    }
  })

  const [skillModifiers, setSkillModifiers] = useState<Record<string, number>>(
    () => (id ? loadSkillModifiers(id) : {}),
  )

  const [inventoryOpen,     setInventoryOpen]     = useState(false)
  const [skillTest,         setSkillTest]         = useState<SkillTestData | null>(null)
  const [pendingDamageRoll, setPendingDamageRoll] = useState<string | null>(null)

  const { scrollY } = useScroll()
  const backOpacity = useTransform(scrollY, [0, 150], [1, 0.35])

  useEffect(() => {
    document.title = character ? `${character.name} — Arcádia` : "Arcádia"
    window.scrollTo({ top: 0 })
  }, [id])

  /* ── Runa DnD ─────────────────────────────────────────────────── */

  function handleDragStart(event: DragStartEvent) {
    setDraggingRuna(String(event.active.id).replace("runa-", ""))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDraggingRuna(null)
    if (!over || !character) return
    const runaName = String(active.id).replace("runa-", "")
    const slotIdx  = parseInt(String(over.id).replace("slot-", ""), 10)
    if (isNaN(slotIdx) || slotIdx >= character.entropia) return
    setSlottedRunas((prev) => {
      const next = [...prev]
      const prevSlot = next.indexOf(runaName)
      if (prevSlot !== -1) next[prevSlot] = null
      next[slotIdx] = runaName
      return next
    })
  }

  function handleRemoveRuna(slotIdx: number) {
    setSlottedRunas((prev) => {
      const next = [...prev]
      next[slotIdx] = null
      return next
    })
  }

  /* ── Skill modifiers ──────────────────────────────────────────── */

  function handleModifierChange(skillKey: string, delta: number) {
    setSkillModifiers((prev) => {
      const next = { ...prev, [skillKey]: (prev[skillKey] ?? 0) + delta }
      if (id) saveSkillModifiers(id, next)
      return next
    })
  }

  function handleModifierReset(skillKey: string) {
    setSkillModifiers((prev) => {
      const next = { ...prev }
      delete next[skillKey]
      if (id) saveSkillModifiers(id, next)
      return next
    })
  }

  /* ── PE checkboxes ────────────────────────────────────────────── */

  function handlePeToggle(attr: string, idx: number) {
    setPeChecks((prev) => {
      const next = { ...prev, [attr]: [...prev[attr]] }
      next[attr][idx] = !next[attr][idx]
      if (id) savePeChecks(id, next)
      return next
    })
  }

  /* ── HP / Sanidade clicks ─────────────────────────────────────── */

  function handleHpClick(idx: number) {
    if (!owned || !id) return
    const next = idx < currentHp ? idx : idx + 1
    setCurrentHp(next)
    saveCurrentValues(id, next, currentSanidade)
  }

  function handleSanidadeClick(idx: number) {
    if (!owned || !id) return
    const next = idx < currentSanidade ? idx : idx + 1
    setCurrentSanidade(next)
    saveCurrentValues(id, currentHp, next)
  }

  function goEdit(step: number) {
    navigate(`/editar-ficha/${id}?step=${step}`)
  }

  /* ── Not found ────────────────────────────────────────────────── */

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
    )
  }

  const accent    = getAccent(character.afinidade)
  const antAccent = getAccent(character.antitese)

  return (
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

      <CharacterHero character={character} accent={accent} scrollY={scrollY} />

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
          e.currentTarget.style.transform = "scale(1.1)"
          e.currentTarget.style.boxShadow = `0 6px 32px rgba(0,0,0,0.6), 0 0 24px ${accent.glow}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accent.glow}`
        }}
      >
        🎒
      </button>

      {/* ── Floating dice button ─────────────────────────── */}
      <FloatingDiceButton accentColor={accent.text} />

      {/* ── Skill test overlay ───────────────────────────── */}
      {skillTest && (
        <SkillTestOverlay
          {...skillTest}
          onClose={() => setSkillTest(null)}
        />
      )}

      {/* ── Damage roll overlay ───────────────────────────── */}
      {pendingDamageRoll && (
        <DamageRollOverlay
          damageStr={pendingDamageRoll}
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
          onRollDamage={setPendingDamageRoll}
        />
      )}
    </div>
  )
}
