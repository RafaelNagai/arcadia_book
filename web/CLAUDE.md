# Arcádia Web — Guia do Projeto React para Claude

## Stack

- **React 19** + **TypeScript 5.9**
- **React Router 7** (client-side routing)
- **Tailwind CSS 3** (utility classes)
- **Framer Motion 12** (animações, parallax, transições)
- **@dnd-kit/core** + **@dnd-kit/sortable** (drag-and-drop de runas e inventário)
- **Vite** (bundler, dev server, alias de paths)
- **react-markdown** + **remark-gfm** (renderização de markdown)

## Estrutura de Pastas

```
web/src/
├── App.tsx                        # Rotas principais
├── main.tsx                       # Entry point
├── components/
│   ├── character/                 # Subcomponentes de CharacterPage
│   │   ├── types.ts               # Accent, ELEMENT_COLORS, ELEMENT_DATA, getAccent
│   │   ├── CharacterUI.tsx        # Tag, EditBtn, SectionLabel
│   │   ├── CharacterHero.tsx      # Seção hero com parallax, imagem/fallback, scroll hint
│   │   ├── StatsSection.tsx       # Grids de HP e Sanidade (HoneycombGrid)
│   │   ├── SkillsSection.tsx      # Grid de atributos + perícias (AttributeBlock)
│   │   ├── ArcanoSection.tsx      # Afinidade/antítese, DnD de runas, entropia
│   │   ├── AttributeBlock.tsx     # ATTR_GROUPS, PE checkboxes, skill modifiers inline
│   │   ├── EntropiaDisplay.tsx    # DraggableRuna, DroppableSlot, EntropiaDisplay
│   │   ├── HoneycombGrid.tsx      # Grade hexagonal SVG para HP/Sanidade
│   │   └── EmberParticles.tsx     # Animação canvas de partículas
│   ├── creator/                   # Subcomponentes de CharacterCreatorPage
│   │   ├── types.ts               # RACES, ELEMENTS, ATTR_GROUPS, STEPS, dados de trauma, helpers (d6, d20)
│   │   ├── CreatorUI.tsx          # StepHeader, Field, TextInput, Stepper, TagInput, StatPill, SectionDivider
│   │   ├── Step1Identity.tsx      # Picker de raça + campos nome/conceito/citação
│   │   ├── Step2Attrs.tsx         # Steppers de atributos + pills HP/Sanidade derivados
│   │   ├── Step3Skills.tsx        # Steppers de perícias + toggle de talento (◆/◇)
│   │   ├── Step4Arcano.tsx        # Roller 2D6 + pickers manuais de elemento + entropia + runas
│   │   └── Step5History.tsx       # Antecedentes + gerador de trauma 2D20
│   ├── inventory/                 # Subcomponentes de InventoryPanel
│   │   ├── types.ts               # CatalogEntry, CATALOG, TIER_COLOR, WEIGHT_OPTIONS, labelStyle, inputStyle, ItemFormData, DEFAULT_FORM
│   │   ├── InventoryPanel.tsx     # Painel principal: estado, handlers, DndContext, layout
│   │   ├── ItemModal.tsx          # Shell do modal com tabs (Catálogo / Personalizado)
│   │   ├── CatalogTab.tsx         # Busca + lista do catálogo de equipamentos
│   │   ├── CustomItemForm.tsx     # Formulário completo de item custom/edição
│   │   ├── ItemCard.tsx           # Card de item com drag handle e barra de durabilidade
│   │   ├── BagSection.tsx         # Bolsa com header, contador de slots e delete
│   │   ├── DroppableSection.tsx   # Wrapper dnd-kit droppable + SortableContext
│   │   ├── EmptySlot.tsx          # Botão de slot vazio
│   │   └── WeightBadge.tsx        # Pill de peso do item
│   ├── home/                      # Componentes da HomePage
│   │   ├── CharacterShowcase.tsx  # Carrossel de personagens de exemplo
│   │   ├── MechanicsHighlight.tsx # Cards de mecânicas em destaque
│   │   └── WorldIntro.tsx         # Introdução ao mundo
│   ├── layout/                    # AppShell, Sidebar, TopBar
│   ├── parallax/                  # HeroParallax, ParallaxLayer
│   ├── reader/                    # MarkdownRenderer, TableOfContents
│   ├── search/                    # SearchModal (Cmd+K)
│   └── widgets/                   # Widgets interativos por capítulo
│       ├── CombatWidget.tsx       # slug: combate
│       ├── TraumaWidget.tsx       # slug: condicoes-e-trauma
│       ├── AfinidadeWidget.tsx    # slug: elementos-e-afinidades
│       ├── BestiaryWidget.tsx     # slug: bestiario
│       ├── ShipWidget.tsx         # slug: navios
│       └── CharacterExamplesWidget.tsx  # slug: personagem
├── data/
│   ├── chapterManifest.ts         # CHAPTERS[], ChapterMeta, Part — metadados de todos os capítulos
│   ├── chapterLoader.ts           # Vite glob imports dos .md
│   ├── chapterWidgets.tsx         # Mapa slug → componente widget (CHAPTER_WIDGETS)
│   ├── characterTypes.ts          # Character, CharacterSkills, CharacterAttributes, InventoryItem, InventoryBag, WeightCategory
│   ├── creatureTypes.ts           # Interfaces de criaturas
│   ├── shipTypes.ts               # Interfaces de navios
│   ├── searchIndex.ts             # Índice de busca gerado dos markdowns
│   └── slugify.ts                 # heading → anchor ID
├── hooks/
│   └── useParallax.ts             # Parallax scroll (Framer Motion)
├── lib/
│   └── localCharacters.ts         # Persistência completa no localStorage (fichas, inventário, bolsas, PE, modificadores)
├── pages/
│   ├── HomePage.tsx               # Usa AppShell (com sidebar)
│   ├── ChapterPage.tsx            # Usa AppShell (com sidebar)
│   ├── CharacterListPage.tsx      # Usa AppShell (com sidebar)
│   ├── CharacterPage.tsx          # Standalone (sem sidebar) — importa de character/
│   └── CharacterCreatorPage.tsx   # Standalone (sem sidebar) — importa de creator/
└── styles/
    └── tokens.css                 # CSS custom properties (cores, fontes)
```

> `components/InventoryPanel.tsx` é um re-export shim para compatibilidade retroativa — o código real está em `components/inventory/InventoryPanel.tsx`.

## Rotas

```
/                         → HomePage         (AppShell)
/capitulo/:slug           → ChapterPage      (AppShell)
/personagens              → CharacterListPage (AppShell)
/ficha/:id                → CharacterPage    (standalone, tela cheia)
/criar-ficha              → CharacterCreatorPage (standalone)
/editar-ficha/:id         → CharacterCreatorPage (standalone, com ?step=N para edição de seção)
```

`CharacterPage` e `CharacterCreatorPage` são montados fora do `<AppShell>` para experiência fullscreen sem sidebar.

## Alias de Paths (vite.config.ts)

| Alias | Resolve para |
|---|---|
| `@` | `web/src/` |
| `@chapters` | `../chapters/` (markdown do livro) |
| `@oneshots` | `../one-shots/` |
| `@creatures` | `../creatures.json` |
| `@ships` | `../ships.json` |
| `@characters` | `../characters.json` |
| `@equipment` | `../equipment.json` |
| `@version` | `../version.json` |

> Os capítulos são lidos diretamente de `../chapters/` — não copie, não mova.

## Design System

### Tokens de Cor (tokens.css)

```css
--color-void:           #04060C   /* fundo mais escuro */
--color-abyss:          #0A0F1E   /* fundo principal */
--color-deep:           #0F1729
--color-surface:        #1A2440   /* cards, painéis */
--color-border:         #2A3A60
--color-arcano:         #C8922A   /* dourado — acento principal */
--color-arcano-glow:    #E8B84B
--color-arcano-dim:     (variante mais escura do dourado)
--color-text-primary:   #E8E0D0
--color-text-secondary: #d9cfb2
--color-text-muted:     (ainda mais escuro)
--color-text-accent:    #C8922A
```

### Cores dos Elementos (character/types.ts)

```typescript
const ELEMENT_COLORS = {
  Energia:   { text: '#E8803A', bg: 'rgba(200,90,32,0.18)',  glow: 'rgba(232,128,58,0.45)'  },
  Anomalia:  { text: '#6FC892', bg: 'rgba(42,155,111,0.18)', glow: 'rgba(111,200,146,0.45)' },
  Paradoxo:  { text: '#50C8E8', bg: 'rgba(32,143,168,0.18)', glow: 'rgba(80,200,232,0.45)'  },
  Astral:    { text: '#C090F0', bg: 'rgba(107,63,160,0.18)', glow: 'rgba(192,144,240,0.45)' },
  Cognitivo: { text: '#E8B84B', bg: 'rgba(200,146,42,0.18)', glow: 'rgba(232,184,75,0.45)'  },
}
```

Use sempre `getAccent(element)` de `components/character/types.ts` — nunca duplique essa tabela.

### Fontes

```css
--font-display: 'Cinzel', 'Playfair Display', Georgia, serif   /* títulos */
--font-body:    'EB Garamond', 'Merriweather', Georgia, serif  /* corpo do texto */
--font-ui:      'Inter', 'system-ui', sans-serif               /* UI/labels */
```

## Padrões de Código

### Adicionar um Widget a um Capítulo

1. Crie `src/components/widgets/NomeWidget.tsx`
2. Adicione em `src/data/chapterWidgets.tsx`:
   ```typescript
   import { NomeWidget } from '@/components/widgets/NomeWidget'
   // no objeto CHAPTER_WIDGETS:
   'slug-do-capitulo': <NomeWidget />,
   ```
3. O `ChapterPage` renderiza o widget automaticamente abaixo do conteúdo

### Adicionar um Capítulo

1. Crie o `.md` em `../chapters/`
2. Execute `/sync-mechanics` para atualizar `chapterManifest.ts`
3. Se precisar de widget: execute `/add-widget`

### Persistência no localStorage

`lib/localCharacters.ts` centraliza **toda** a persistência:

| Função | Chave localStorage | Conteúdo |
|---|---|---|
| `loadCustomCharacters()` / `saveCustomCharacter()` | `arcadia_custom_characters` | Fichas criadas pelo usuário |
| `saveCurrentValues(id, hp, san)` | `arcadia_custom_characters` | Atualiza HP/Sanidade sem tocar no resto |
| `loadInventory()` / `saveInventory()` | `arcadia_inventory` | Itens do inventário por personagem |
| `loadBags()` / `saveBags()` | `arcadia_bags` | Bolsas/containers por personagem |
| `loadPeChecks()` / `savePeChecks()` | `arcadia_pe_checks` | Checkboxes de PE por personagem |
| `loadSkillModifiers()` / `saveSkillModifiers()` | `arcadia_skill_modifiers` | Modificadores temporários de perícia |

Fichas customizadas têm `owned: true`. Personagens preset vêm de `characters.json` (readonly).

### Cálculo de HP/Sanidade (localCharacters.ts)

```typescript
const HP_BONUS    = [0, 4, 4, 3, 3, 2, 2, 2, ...]  // índice = valor do atributo
const SANID_BONUS = [0, 4, 4, 3, 3, 2, 2, 2, ...]

function calcHP(fisico: number): number          // base 15 + soma HP_BONUS[1..fisico]
function calcSanidade(intelecto, influencia): number  // base 15 + soma com max(intelecto, influencia)
```

> Nota: os valores reais em `localCharacters.ts` diferem ligeiramente dos documentados no CLAUDE.md raiz — confie sempre no código, não nesta tabela.

### Sistema de Inventário

Capacidade calculada em `InventoryPanel.tsx`:
- **Slots**: `3 + fisico`
- **Peso máximo**: `15 + fisico × 5`
- Slots extras via bolsas (`InventoryBag`), cada bolsa tem `id`, `name`, `slots`, `items[]`
- Drag-and-drop de itens entre slots e bolsas via `@dnd-kit`

### Ficha de Personagem (CharacterPage)

Composta por seções independentes em `components/character/`:
- `CharacterHero` — recebe `scrollY: MotionValue<number>` e calcula transforms internamente
- `StatsSection` — HP/Sanidade via `HoneycombGrid`
- `SkillsSection` — usa `ATTR_GROUPS` de `AttributeBlock.tsx`
- `ArcanoSection` — instancia seu próprio `DndContext` para drag de runas
- Antecedentes e Traumas — renderizados diretamente na page (simples o suficiente)

### Criador de Personagem (CharacterCreatorPage)

5 steps numerados. URL `?step=N` ativa modo de edição de seção (`isSectionEdit`), que mostra botões Cancelar/Salvar em vez de Continuar.

### Animações (Framer Motion)

- Hero parallax: `useScroll` + `useTransform` dentro de cada componente que precisa
- Transições de step: `AnimatePresence` + `slideVariants` com `custom={direction}`
- Sidebar mobile: spring animation com overlay
- Listas: `staggerChildren` para entrada escalonada

### Busca (Cmd+K)

`data/searchIndex.ts` gera entradas a partir dos markdowns:
- Normalização: strip de acentos, lowercase
- Resultados linkam para `/capitulo/:slug#heading-anchor`
- `slugify.ts` converte headings para IDs consistentes

## TypeScript — Interfaces Principais

### Character (characterTypes.ts)
```typescript
interface Character {
  id: string; name: string; race: string; concept: string; quote: string
  image: string | null; level: number
  attributes: CharacterAttributes   // fisico, destreza, intelecto, influencia
  skills: CharacterSkills           // 16 perícias (4 por atributo)
  talents: string[]
  hp: number; sanidade: number
  currentHp?: number; currentSanidade?: number
  owned?: boolean
  afinidade: string; antitese: string; entropia: number
  runas: string[]; traumas: string[]; antecedentes: string[]
}
```

### InventoryItem (characterTypes.ts)
```typescript
interface InventoryItem {
  id: string; name: string; description: string
  weight: WeightCategory; isEquipment: boolean
  maxDurability?: number; currentDurability?: number
  image?: string | null          // URL customizada pelo usuário
  catalogImage?: string | null   // path original do catálogo
  fromCatalog?: boolean
  catalogSubcategory?: string; catalogTier?: string
  damage?: string | null; effects?: string[]
}
```

### ChapterMeta (chapterManifest.ts)
```typescript
interface ChapterMeta {
  id: string      // ex: '04_combate'
  slug: string    // ex: 'combate'
  title: string
  part: Part      // 'Fundamentos' | 'O Arcano' | 'O Navio e a Tripulação' | 'O Mundo' | 'One-Shots'
  order: number
  subtitle?: string
}
```

## O que Nunca Fazer

- Nunca modificar arquivos em `../chapters/` — edite apenas o site
- Nunca copiar conteúdo markdown para dentro de `web/src/`
- Nunca duplicar `ELEMENT_COLORS` — importe sempre de `components/character/types.ts`
- Nunca usar `git add .` sem revisar (pode incluir `dist/` ou `.env`)
- Nunca criar estado global sem necessidade (preferir hooks locais + localStorage)
- Nunca divergir das cores dos elementos definidas em `character/types.ts`

## Executar o Projeto

```bash
cd /Users/naga/Documents/arcadia/book/web
npm run dev    # dev server em http://localhost:5173
npm run build  # build de produção em dist/
```
