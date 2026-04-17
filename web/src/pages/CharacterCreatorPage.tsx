import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character, CharacterSkills, CharacterAttributes } from '@/data/characterTypes'
import { saveCustomCharacter, generateId, getCustomCharacter, calcHP, calcSanidade } from '@/lib/localCharacters'
import { STEPS, EMPTY_SKILLS, EMPTY_ATTRS } from '@/components/creator/types'
import { StepHeader } from '@/components/creator/CreatorUI'
import { Step1Identity } from '@/components/creator/Step1Identity'
import { Step2Attrs }    from '@/components/creator/Step2Attrs'
import { Step3Skills }   from '@/components/creator/Step3Skills'
import { Step4Arcano }   from '@/components/creator/Step4Arcano'
import { Step5History }  from '@/components/creator/Step5History'
import { Step6Historia } from '@/components/creator/Step6Historia'

export function CharacterCreatorPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()

  const existing   = editId ? getCustomCharacter(editId) : undefined
  const isEditing  = !!existing
  const initialStep   = Math.min(6, Math.max(1, Number(searchParams.get('step')) || 1))
  const isSectionEdit = isEditing && searchParams.has('step')

  const [step,      setStep]      = useState(initialStep)
  const [direction, setDirection] = useState(1)

  const [name,     setName]     = useState(existing?.name     ?? '')
  const [race,     setRace]     = useState(existing?.race     ?? '')
  const [concept,  setConcept]  = useState(existing?.concept  ?? '')
  const [quote,    setQuote]    = useState(existing?.quote    ?? '')
  const [attrs,    setAttrs]    = useState<CharacterAttributes>(existing?.attributes ?? EMPTY_ATTRS)
  const [skills,   setSkills]   = useState<CharacterSkills>(existing?.skills ?? EMPTY_SKILLS)
  const [talents,  setTalents]  = useState<string[]>(existing?.talents ?? [])
  const [afinidade,  setAfinidade]  = useState(existing?.afinidade  ?? '')
  const [antitese,   setAntitese]   = useState(existing?.antitese   ?? '')
  const [entropia,   setEntropia]   = useState(existing?.entropia   ?? 0)
  const [runas,      setRunas]      = useState<string[]>(existing?.runas      ?? [])
  const [antecedentes, setAntecedentes] = useState<string[]>(existing?.antecedentes ?? [])
  const [traumas,    setTraumas]    = useState<string[]>(existing?.traumas    ?? [])
  const [historia,   setHistoria]   = useState(existing?.historia   ?? '')
  const [image,      setImage]      = useState<string | null>(existing?.image ?? null)

  const totalLevel = Object.values(skills).reduce((a, b) => a + b, 0)

  useEffect(() => {
    document.title = isEditing ? 'Editar Personagem — Arcádia' : 'Criar Personagem — Arcádia'
    window.scrollTo({ top: 0 })
  }, [isEditing])

  /* ── Navigation ───────────────────────────────────────────────── */

  function goNext() { setDirection(1);  setStep(s => s + 1); window.scrollTo({ top: 0 }) }
  function goBack() {
    if (isSectionEdit) { navigate(`/ficha/${editId}`); return }
    if (step === 1)    { navigate(-1); return }
    setDirection(-1); setStep(s => s - 1); window.scrollTo({ top: 0 })
  }

  /* ── Handlers ─────────────────────────────────────────────────── */

  function handleSkillChange(k: keyof CharacterSkills, v: number) {
    setSkills(prev => ({ ...prev, [k]: v }))
  }
  function handleTalentToggle(k: string) {
    setTalents(prev => prev.includes(k) ? prev.filter(t => t !== k) : [...prev, k])
  }
  const handleArcanoChange = useCallback((k: string, v: string | number | string[]) => {
    if (k === 'afinidade') setAfinidade(v as string)
    else if (k === 'antitese')  setAntitese(v as string)
    else if (k === 'entropia')  setEntropia(v as number)
    else if (k === 'runas')     setRunas(v as string[])
  }, [])

  /* ── Save ─────────────────────────────────────────────────────── */

  function handleSave() {
    const newHp  = calcHP(attrs.fisico)
    const newSan = calcSanidade(attrs.intelecto, attrs.influencia)
    const character: Character = {
      id:      isEditing ? existing!.id : generateId(),
      name:    name.trim()    || 'Sem Nome',
      race:    race.trim()    || 'Desconhecida',
      concept: concept.trim(),
      quote:   quote.trim(),
      image,
      level:   totalLevel,
      attributes: attrs,
      skills,
      talents,
      hp:       newHp,
      sanidade: newSan,
      currentHp:       existing ? Math.min(existing.currentHp ?? existing.hp, newHp) : undefined,
      currentSanidade: existing ? Math.min(existing.currentSanidade ?? existing.sanidade, newSan) : undefined,
      owned:      true,
      afinidade:  afinidade  || 'Energia',
      antitese:   antitese   || 'Anomalia',
      entropia,
      runas,
      traumas,
      antecedentes,
      historia: historia.trim() || undefined,
    }
    saveCustomCharacter(character)
    navigate(`/ficha/${character.id}`)
  }

  function canProceed(): boolean {
    if (step === 1) return name.trim().length > 0 && race.trim().length > 0
    if (step === 4) return afinidade !== '' && antitese !== ''
    return true
  }

  /* ── Render ───────────────────────────────────────────────────── */

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ?  48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -48 :  48, opacity: 0 }),
  }

  return (
    <div style={{ background: 'var(--color-abyss)', minHeight: '100vh' }}>
      <StepHeader current={step} onBack={goBack} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '5.5rem 1.5rem 8rem' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {step === 1 && (
              <Step1Identity
                data={{ name, race, concept, quote }}
                image={image}
                onImageChange={setImage}
                onChange={(k, v) => {
                  if (k === 'name')    setName(v)
                  else if (k === 'race')    setRace(v)
                  else if (k === 'concept') setConcept(v)
                  else if (k === 'quote')   setQuote(v)
                }}
              />
            )}
            {step === 2 && (
              <Step2Attrs attrs={attrs} onChange={(k, v) => setAttrs(prev => ({ ...prev, [k]: v }))} />
            )}
            {step === 3 && (
              <Step3Skills
                skills={skills}
                talents={talents}
                totalLevel={totalLevel}
                onChange={handleSkillChange}
                onTalentToggle={handleTalentToggle}
              />
            )}
            {step === 4 && (
              <Step4Arcano
                afinidade={afinidade}
                antitese={antitese}
                entropia={entropia}
                runas={runas}
                onChange={handleArcanoChange}
              />
            )}
            {step === 5 && (
              <Step5History
                antecedentes={antecedentes}
                traumas={traumas}
                onChange={(k, v) => {
                  if (k === 'antecedentes') setAntecedentes(v)
                  else if (k === 'traumas') setTraumas(v)
                }}
              />
            )}
            {step === 6 && (
              <Step6Historia historia={historia} onChange={setHistoria} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(4,10,20,0.93)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        padding: '0.875rem 1.5rem',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {isSectionEdit ? (
            <div className="flex gap-3">
              <button onClick={goBack}
                style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!canProceed()}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 4, border: 'none', background: canProceed() ? 'var(--color-arcano)' : 'rgba(255,255,255,0.05)', cursor: canProceed() ? 'pointer' : 'not-allowed', color: canProceed() ? '#0A0A0A' : 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Salvar
              </button>
            </div>
          ) : step < STEPS.length ? (
            <button onClick={goNext} disabled={!canProceed()}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 4, border: 'none',
                background: canProceed() ? 'var(--color-arcano)' : 'rgba(255,255,255,0.05)',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                color: canProceed() ? '#0A0A0A' : 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
              {step === 1 && !canProceed() ? 'Preencha nome e raça para continuar' : 'Continuar'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { setDirection(-1); setStep(5) }}
                style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
                ← Revisar
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 4, border: 'none', background: 'var(--color-arcano)', cursor: 'pointer', color: '#0A0A0A', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Finalizar e ver ficha
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
