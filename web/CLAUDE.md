# Arcádia Web — Guia do Projeto React para Claude

## Stack

- **React 19** + **TypeScript 5.9**
- **React Router 7** (client-side routing)
- **Tailwind CSS 3** (utility classes)
- **Framer Motion 12** (animações, parallax, transições)
- **Vite** (bundler, dev server, alias de paths)
- **react-markdown** + **remark-gfm** (renderização de markdown)

## Estrutura de Pastas

```
web/src/
├── App.tsx                   # Rotas principais
├── main.tsx                  # Entry point
├── components/
│   ├── home/                 # Componentes da HomePage
│   ├── layout/               # AppShell, Sidebar, TopBar
│   ├── parallax/             # HeroParallax, ParallaxLayer
│   ├── reader/               # MarkdownRenderer, TableOfContents
│   ├── search/               # SearchModal (Cmd+K)
│   └── widgets/              # Widgets interativos por capítulo
├── data/
│   ├── chapterManifest.ts    # Metadados dos capítulos (slug, title, part, order)
│   ├── chapterLoader.ts      # Vite glob imports dos .md
│   ├── chapterWidgets.tsx    # Mapa slug → componente widget
│   ├── characterTypes.ts     # Interfaces TypeScript de personagem
│   ├── creatureTypes.ts      # Interfaces TypeScript de criaturas
│   ├── shipTypes.ts          # Interfaces TypeScript de navios
│   ├── searchIndex.ts        # Índice de busca gerado dos markdowns
│   └── slugify.ts            # heading → anchor ID
├── hooks/
│   └── useParallax.ts        # Parallax scroll (Framer Motion)
├── lib/
│   └── localCharacters.ts    # Persistência de fichas no localStorage
├── pages/
│   ├── HomePage.tsx
│   ├── ChapterPage.tsx
│   ├── CharacterListPage.tsx
│   ├── CharacterPage.tsx
│   └── CharacterCreatorPage.tsx
└── styles/
    └── tokens.css            # CSS custom properties (cores, fontes)
```

## Rotas

```
/                         → HomePage
/capitulo/:slug           → ChapterPage (ex: /capitulo/combate)
/personagens              → CharacterListPage
/ficha/:id                → CharacterPage (view)
/criar-ficha              → CharacterCreatorPage (novo)
/editar-ficha/:id         → CharacterCreatorPage (edição)
```

## Alias de Paths (vite.config.ts)

| Alias | Resolve para |
|---|---|
| `@` | `web/src/` |
| `@chapters` | `../chapters/` (markdown do livro) |
| `@oneshots` | `../one-shots/` |
| `@creatures` | `../creatures.json` |
| `@ships` | `../ships.json` |
| `@characters` | `../characters.json` |

> Os capítulos são lidos diretamente da pasta `../chapters/` — não copie, não mova.

## Design System

### Tokens de Cor (tokens.css)

```css
--color-void:        #04060C   /* fundo mais escuro */
--color-abyss:       #0A0F1E   /* fundo principal */
--color-deep:        #0F1729
--color-surface:     #1A2440   /* cards, painéis */
--color-border:      #2A3A60
--color-arcano:      #C8922A   /* dourado acento principal */
--color-arcano-glow: #E8B84B
--color-text-primary:   #E8E0D0
--color-text-secondary: #A09880
--color-text-accent:    #C8922A
```

### Cores dos Elementos

```typescript
const ELEMENT_COLORS = {
  'Energia':   { text: '#E8803A', glow: 'rgba(232,128,58,0.35)'  },
  'Anomalia':  { text: '#6FC892', glow: 'rgba(111,200,146,0.35)' },
  'Paradoxo':  { text: '#50C8E8', glow: 'rgba(80,200,232,0.35)'  },
  'Astral':    { text: '#C090F0', glow: 'rgba(192,144,240,0.35)' },
  'Cognitivo': { text: '#E8B84B', glow: 'rgba(232,184,75,0.35)'  },
}
```

### Fontes

```css
--font-display: 'Cinzel', 'Playfair Display', Georgia, serif   /* títulos */
--font-body:    'EB Garamond', 'Merriweather', Georgia, serif  /* corpo do texto */
--font-ui:      'Inter', 'system-ui', sans-serif               /* UI/labels */
```

## Padrões de Código

### Adicionar um Widget a um Capítulo

1. Crie `src/components/widgets/NomeWidget.tsx` seguindo o padrão dos existentes
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

### Persistência de Fichas

`lib/localCharacters.ts` gerencia fichas customizadas:
```typescript
loadCustomCharacters()           // lê do localStorage
saveCustomCharacter(char)        // salva/atualiza
deleteCustomCharacter(id)        // remove
saveCurrentValues(id, hp, san)   // atualiza HP/Sanidade atuais
```
- Chave localStorage: `arcadia_custom_characters`
- Fichas customizadas têm `owned: true`

### Cálculo de HP/Sanidade

```typescript
const HP_BONUS    = [0, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8...]  // índice = valor do atributo
const SANID_BONUS = [0, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1...]

function calcHP(fisico: number)   { return 12 + HP_BONUS.slice(0, fisico).reduce(sum) }
function calcSan(intelecto: number, influencia: number) {
  const attr = Math.max(intelecto, influencia)
  return 15 + SANID_BONUS.slice(0, attr).reduce(sum)
}
```

### Animações (Framer Motion)

- Transições de página: `opacity` + `y` offset
- Parallax: `useParallaxLayer()` hook com `useScroll` + `useTransform`
- Sidebar mobile: spring animation com overlay
- Listas: `staggerChildren` para entrada escalonada

### Busca (Cmd+K)

`data/searchIndex.ts` gera entradas a partir dos markdowns:
- Normalização: strip de acentos, lowercase
- Resultados linkam para `/capitulo/:slug#heading-anchor`
- `slugify.ts` converte headings para IDs consistentes

## TypeScript — Interfaces Principais

### Character
```typescript
interface Character {
  id: string; name: string; race: string; concept: string; quote: string
  image: string | null; level: number
  attributes: { fisico: number; destreza: number; intelecto: number; influencia: number }
  skills: { fortitude, vontade, atletismo, combate,      // Físico
             furtividade, precisao, acrobacia, reflexo,    // Destreza
             percepcao, intuicao, investigacao, conhecimento, // Intelecto
             empatia, dominacao, persuasao, performance }  // Influência
  talents: string[]; hp: number; sanidade: number
  currentHp?: number; currentSanidade?: number; owned?: boolean
  afinidade: string; antitese: string; entropia: number
  runas: string[]; traumas: string[]; antecedentes: string[]
}
```

### ChapterMeta
```typescript
interface ChapterMeta {
  id: string      // ex: '04_combate'
  slug: string    // ex: 'combate'
  title: string   // ex: 'Combate'
  part: Part      // 'Fundamentos' | 'O Arcano' | 'O Navio e a Tripulação' | 'O Mundo' | 'One-Shots'
  order: number
  subtitle?: string
}
```

## O que Nunca Fazer

- Nunca modificar arquivos em `../chapters/` — edite apenas o site
- Nunca copiar conteúdo markdown para dentro de `web/src/`
- Nunca usar `git add .` sem revisar (pode incluir `dist/` ou `.env`)
- Nunca criar estado global sem necessidade (preferir hooks locais + localStorage)
- Nunca divergir das cores dos elementos definidas acima

## Executar o Projeto

```bash
cd /Users/naga/Documents/arcadia/book/web
npm run dev    # dev server em http://localhost:5173
npm run build  # build de produção em dist/
```
