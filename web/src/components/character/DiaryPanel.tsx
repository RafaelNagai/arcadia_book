import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BookOpen, X, Plus, FolderPlus, GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { DiaryData, DiaryBlock, DiaryCategory } from '@/data/characterTypes'

interface DiaryPanelProps {
  isOpen: boolean
  onClose: () => void
  diaryData: DiaryData
  onChangeDiary: (data: DiaryData) => void
  canEdit: boolean
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/* ── Sortable block ─────────────────────────────────────────────── */

interface SortableBlockProps {
  block: DiaryBlock
  categories: DiaryCategory[]
  canEdit: boolean
  onContentChange: (id: string, content: string) => void
  onDelete: (id: string) => void
  onCategoryChange: (id: string, categoryId: string | undefined) => void
}

function SortableBlock({ block, categories, canEdit, onContentChange, onDelete, onCategoryChange }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'rgba(15,23,41,0.7)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '8px 10px',
      }}
    >
      {canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              {...listeners}
              {...attributes}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'grab',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <GripVertical size={14} />
            </button>
            <select
              value={block.categoryId ?? ''}
              onChange={(e) => onCategoryChange(block.id, e.target.value || undefined)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                padding: '2px 4px',
                cursor: 'pointer',
              }}
            >
              <option value="">Sem pasta</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onDelete(block.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(200,80,80,0.6)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
      <textarea
        value={block.content}
        onChange={(e) => onContentChange(block.id, e.target.value)}
        readOnly={!canEdit}
        rows={3}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          lineHeight: 1.6,
          resize: 'vertical',
          width: '100%',
          cursor: canEdit ? 'text' : 'default',
        }}
        placeholder={canEdit ? 'Escreva aqui...' : ''}
      />
    </div>
  )
}

/* ── Category section ───────────────────────────────────────────── */

interface CategorySectionProps {
  category: DiaryCategory
  blocks: DiaryBlock[]
  allCategories: DiaryCategory[]
  canEdit: boolean
  onBlockContentChange: (id: string, content: string) => void
  onBlockDelete: (id: string) => void
  onBlockCategoryChange: (id: string, categoryId: string | undefined) => void
  onBlockDragEnd: (event: DragEndEvent, categoryId: string | undefined) => void
  onCategoryNameChange: (id: string, name: string) => void
  onCategoryDelete: (id: string) => void
}

function CategorySection({
  category,
  blocks,
  allCategories,
  canEdit,
  onBlockContentChange,
  onBlockDelete,
  onBlockCategoryChange,
  onBlockDragEnd,
  onCategoryNameChange,
  onCategoryDelete,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [nameFocused, setNameFocused] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <input
          value={category.name}
          onChange={(e) => onCategoryNameChange(category.id, e.target.value)}
          readOnly={!canEdit}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          style={{
            flex: 1,
            background: nameFocused ? 'rgba(255,255,255,0.04)' : 'transparent',
            border: 'none',
            borderBottom: canEdit ? `1px solid ${nameFocused ? 'var(--color-arcano)' : 'transparent'}` : 'none',
            outline: 'none',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: canEdit ? 'text' : 'default',
            padding: '1px 3px',
            borderRadius: 3,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        />
        {canEdit && (
          <button
            onClick={() => onCategoryDelete(category.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,80,80,0.5)', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="cat-blocks"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onBlockDragEnd(e, category.id)}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 8 }}>
                  {blocks.map(block => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      categories={allCategories}
                      canEdit={canEdit}
                      onContentChange={onBlockContentChange}
                      onDelete={onBlockDelete}
                      onCategoryChange={onBlockCategoryChange}
                    />
                  ))}
                  {blocks.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                      Pasta vazia
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main panel ─────────────────────────────────────────────────── */

export function DiaryPanel({ isOpen, onClose, diaryData, onChangeDiary, canEdit }: DiaryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  /* ── Handlers ─────────────────────────────────────────────────── */

  function addBlock() {
    const maxOrder = diaryData.blocks.reduce((m, b) => Math.max(m, b.order), -1)
    const newBlock: DiaryBlock = { id: generateId(), content: '', order: maxOrder + 1 }
    onChangeDiary({ ...diaryData, blocks: [...diaryData.blocks, newBlock] })
  }

  function addCategory() {
    const maxOrder = diaryData.categories.reduce((m, c) => Math.max(m, c.order), -1)
    const newCat: DiaryCategory = { id: generateId(), name: 'Nova Pasta', order: maxOrder + 1 }
    onChangeDiary({ ...diaryData, categories: [...diaryData.categories, newCat] })
  }

  function handleBlockContentChange(id: string, content: string) {
    const blocks = diaryData.blocks.map(b => b.id === id ? { ...b, content } : b)
    onChangeDiary({ ...diaryData, blocks })
  }

  function handleBlockDelete(id: string) {
    const blocks = diaryData.blocks.filter(b => b.id !== id)
    onChangeDiary({ ...diaryData, blocks })
  }

  function handleBlockCategoryChange(id: string, categoryId: string | undefined) {
    const blocks = diaryData.blocks.map(b => b.id === id ? { ...b, categoryId } : b)
    onChangeDiary({ ...diaryData, blocks })
  }

  function handleCategoryNameChange(id: string, name: string) {
    const categories = diaryData.categories.map(c => c.id === id ? { ...c, name } : c)
    onChangeDiary({ ...diaryData, categories })
  }

  function handleCategoryDelete(id: string) {
    const categories = diaryData.categories.filter(c => c.id !== id)
    const blocks = diaryData.blocks.map(b => b.categoryId === id ? { ...b, categoryId: undefined } : b)
    onChangeDiary({ ...diaryData, categories, blocks })
  }

  function handleBlockDragEnd(event: DragEndEvent, categoryId: string | undefined) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const sectionBlocks = diaryData.blocks
      .filter(b => b.categoryId === categoryId)
      .sort((a, b) => a.order - b.order)
    const oldIndex = sectionBlocks.findIndex(b => b.id === active.id)
    const newIndex = sectionBlocks.findIndex(b => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(sectionBlocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }))
    const otherBlocks = diaryData.blocks.filter(b => b.categoryId !== categoryId)
    onChangeDiary({ ...diaryData, blocks: [...otherBlocks, ...reordered] })
  }

  const sortedCategories = [...diaryData.categories].sort((a, b) => a.order - b.order)
  const freeBlocks = diaryData.blocks
    .filter(b => !b.categoryId || !diaryData.categories.find(c => c.id === b.categoryId))
    .sort((a, b) => a.order - b.order)

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="diary-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2,4,12,0.55)',
              zIndex: 9000,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            key="diary-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 340,
              maxWidth: '90vw',
              background: 'var(--color-deep)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 9001,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 16px 14px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '0.06em',
                }}>
                  Diário
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {canEdit && (
                  <>
                    <button
                      onClick={addCategory}
                      title="Nova pasta"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 5,
                        border: '1px solid var(--color-border)',
                        background: 'none',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                      }}
                    >
                      <FolderPlus size={12} /> Pasta
                    </button>
                    <button
                      onClick={addBlock}
                      title="Novo bloco"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 5,
                        border: '1px solid var(--color-border)',
                        background: 'none',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={12} /> Bloco
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              {/* Categories */}
              {sortedCategories.map(cat => {
                const catBlocks = diaryData.blocks
                  .filter(b => b.categoryId === cat.id)
                  .sort((a, b) => a.order - b.order)
                return (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    blocks={catBlocks}
                    allCategories={diaryData.categories}
                    canEdit={canEdit}
                    onBlockContentChange={handleBlockContentChange}
                    onBlockDelete={handleBlockDelete}
                    onBlockCategoryChange={handleBlockCategoryChange}
                    onBlockDragEnd={handleBlockDragEnd}
                    onCategoryNameChange={handleCategoryNameChange}
                    onCategoryDelete={handleCategoryDelete}
                  />
                )
              })}

              {/* Free blocks */}
              {freeBlocks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sortedCategories.length > 0 && (
                    <p style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--color-border)',
                      paddingBottom: 4,
                    }}>
                      Sem pasta
                    </p>
                  )}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleBlockDragEnd(e, undefined)}>
                    <SortableContext items={freeBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {freeBlocks.map(block => (
                          <SortableBlock
                            key={block.id}
                            block={block}
                            categories={diaryData.categories}
                            canEdit={canEdit}
                            onContentChange={handleBlockContentChange}
                            onDelete={handleBlockDelete}
                            onCategoryChange={handleBlockCategoryChange}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {diaryData.blocks.length === 0 && diaryData.categories.length === 0 && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingTop: 60,
                }}>
                  <BookOpen size={28} style={{ opacity: 0.2, color: 'var(--color-text-muted)' }} />
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                  }}>
                    {canEdit ? 'Adicione um bloco ou pasta para começar.' : 'Nenhuma anotação ainda.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
