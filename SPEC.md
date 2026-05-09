# SPEC.md — Especificação Técnica e Regras do Projeto Arcádia

Este arquivo é a referência completa para agentes que precisam entender o projeto: regras do livro, stack técnica, estrutura de pastas e padrões de código.

---

## 1. O Projeto

Arcádia é um RPG de mesa com sistema próprio (2D12) ambientado em um mundo de ilhas flutuantes e navios que navegam um Mar de Nuvens. Este repositório contém:

- `chapters/` — Conteúdo do livro em Markdown (**fonte da verdade absoluta**)
- `web/` — Site React interativo que serve como referência do livro
- `characters.json` — Fichas de personagens de exemplo
- `creatures.json` — Criaturas do bestiário
- `ships.json` — Navios de exemplo
- `equipment.json` — Equipamentos e itens
- `one-shots/` — Aventuras curtas prontas para jogar

### Regra de Ouro

> **`chapters/` é sempre a fonte da verdade.**
> O site reflete o livro — nunca o contrário.
> Ao detectar inconsistência entre o site e um capítulo, confie no capítulo.

Nunca modifique arquivos em `chapters/` para agradar ao site. Sempre ajuste o site para refletir o capítulo.

---

## 2. Mecânicas do Sistema (Resumo)

### Atributos (4)
- **Físico** — Força, resistência física
- **Destreza** — Agilidade, precisão
- **Intelecto** — Raciocínio, percepção
- **Influência** — Carisma, manipulação

### Perícias (16, 4 por atributo)
- Físico: Fortitude, Vontade, Atletismo, Combate
- Destreza: Furtividade, Precisão, Acrobacia, Reflexo
- Intelecto: Percepção, Intuição, Investigação, Conhecimento
- Influência: Empatia, Dominação, Persuasão, Performance

### Elementos (5)
| Elemento | Cor | Hex |
|---|---|---|
| Energia | Laranja | `#E8803A` |
| Anomalia | Verde | `#6FC892` |
| Paradoxo | Azul claro | `#50C8E8` |
| Astral | Roxo | `#C090F0` |
| Cognitivo | Dourado | `#E8B84B` |

### Cálculo de HP e Sanidade
```
HP       = 15 + soma de HP_BONUS[1..Físico]
Sanidade = 15 + soma de SANID_BONUS[1..max(Intelecto, Influência)]

HP_BONUS    = [0, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2...]  (caps em 2)
SANID_BONUS = [0, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2...]  (caps em 2)
```

Tabela de referência (do capítulo `07_condicoes_e_trauma.md`):

| Atributo | Bônus por ponto | Total |
|---|---|---|
| 0  | —  | 15 |
| 1  | +4 | 19 |
| 2  | +4 | 23 |
| 3  | +3 | 26 |
| 4  | +3 | 29 |
| 5  | +2 | 31 |
| 6  | +2 | 33 |
| 7  | +2 | 35 |
| 8  | +2 | 37 |
| 9  | +2 | 39 |
| 10 | +2 | 41 |
| 11+ | +2 | … |

### Capítulos — Mapa de Conteúdo

| Arquivo | Slug | Conteúdo |
|---|---|---|
| `01_introducao.md` | `introducao` | Conceito do mundo, Mar de Nuvens, ilhas, navios |
| `02_personagem.md` | `personagem` | Criação de personagem, 4 atributos, 16 perícias |
| `03_evolucao_e_testes.md` | `evolucao-e-testes` | Mecânica 2D12, dificuldades, talentos, progressão |
| `04_combate.md` | `combate` | Fluxo de combate, iniciativa, ações, reações |
| `16_equipamentos.md` | `equipamentos` | Tiers SS–E, tabelas de dano, crafting |
| `05_arcanismo.md` | `arcanismo` | Sistema de magia, 5 passos, energia arcana, runas |
| `06_elementos_e_afinidades.md` | `elementos-e-afinidades` | 5 elementos: Energia, Anomalia, Paradoxo, Astral, Cognitivo |
| `07_condicoes_e_trauma.md` | `condicoes-e-trauma` | HP, Sanidade, estado Moribundo, condições de trauma |
| `08_moral.md` | `moral` | Pool de Moral compartilhado, Grito de Guerra |
| `09_navios.md` | `navios` | Tipos de navio, setores, tripulação, durabilidade |
| `10_constelacao_e_navegacao.md` | `constelacao-e-navegacao` | Assinaturas de constelação, mecânica de navegação |
| `11_interludio.md` | `interludio` | Downtime, ações longas/curtas, recuperação, crafting |
| `12_racas.md` | `racas` | 6 raças jogáveis (sem bônus mecânicos) |
| `13_regioes.md` | `regioes` | Nações, culturas, recursos, política |
| `14_dimensoes.md` | `dimensoes` | 4 planos de existência |
| `15_religioes.md` | `religioes` | 3 religiões com cosmologias |
| `17_bestiario.md` | `bestiario` | Templates de criaturas, blocos de estatísticas |

---

## 3. Stack Técnica — Web

### Tecnologias Principais

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI e componentes |
| TypeScript | ~5.9 | Tipagem estrita em todo o projeto |
| Vite | 8 | Build tool e dev server |
| Tailwind CSS | 3 | Estilização utilitária |
| Supabase | SDK 2 | Auth, banco de dados, realtime, storage |
| Framer Motion | 12 | Animações e transições |
| React Konva / Konva | 10 | Canvas 2D para o mapa tático |
| React Three Fiber + Drei | 9/10 | Cenas 3D (parallax, efeitos visuais) |
| React Router DOM | 7 | Roteamento SPA |
| dnd-kit | 6/10 | Drag & drop |
| react-markdown + remark-gfm | — | Renderização dos capítulos |

### Estrutura de Pastas — `web/src/`

```
web/src/
├── pages/           # Uma página por rota (CampaignPage, CharacterPage, etc.)
├── components/      # Componentes reutilizáveis
│   ├── character/   # Ficha de personagem
│   ├── creature/    # Bloco de estatísticas de criatura
│   ├── map/         # Mapa tático (Konva)
│   ├── reader/      # Leitor de capítulos (Markdown)
│   ├── widgets/     # Widgets interativos dos capítulos
│   ├── layout/      # Header, sidebar, layout base
│   └── ...
├── data/            # Tipos TypeScript e loaders de dados
│   ├── characterTypes.ts
│   ├── creatureTypes.ts
│   ├── shipTypes.ts
│   ├── campaignTypes.ts
│   ├── chapterManifest.ts   # Mapa de capítulos + widgets
│   ├── chapterLoader.ts     # Carrega .md via Vite
│   └── chapterWidgets.tsx   # Registro de widgets por capítulo
├── hooks/           # Custom hooks React
├── lib/             # Utilitários, clientes (supabase.ts, etc.)
├── styles/          # CSS global e variáveis
├── App.tsx          # Roteamento principal
└── main.tsx         # Entry point
```

### Aliases Vite (use sempre em vez de caminhos relativos longos)

| Alias | Resolve para |
|---|---|
| `@` | `web/src/` |
| `@chapters` | `chapters/` (raiz do livro) |
| `@oneshots` | `one-shots/` |
| `@characters` | `characters.json` |
| `@creatures` | `creatures.json` |
| `@ships` | `ships.json` |
| `@equipment` | `equipment.json` |
| `@version` | `version.json` |

### Arquivos JSON de Dados

Localizados na raiz (`/book/`). Ao modificar, verifique que os tipos TypeScript em `web/src/data/` ainda batem.

| Arquivo | Tipos em |
|---|---|
| `characters.json` | `characterTypes.ts` |
| `creatures.json` | `creatureTypes.ts` |
| `ships.json` | `shipTypes.ts` |
| `equipment.json` | `characterTypes.ts` (EquipmentItem) |

---

## 4. Feature: Mapa Interativo de Campanha

### Componentes principais (`web/src/components/map/`)

| Arquivo | Responsabilidade |
|---|---|
| `MapTab.tsx` | Orquestrador: estado, handlers, realtime, modais |
| `MapCanvas.tsx` | Stage Konva: multi-floor rendering, pan/zoom, fog, HUDs |
| `MapTokenLayer.tsx` | Tokens (foto, drag, visibilidade LOS; `readOnly` para andares inferiores) |
| `MapFogLayer.tsx` | Fog com `destination-out` e polígonos LOS; opacidade diferente por papel (GM 35% / jogador 100%) |
| `MapWallLayer.tsx` | Paredes + endpoint circles interativos |
| `MapDoorLayer.tsx` | Portas (GM-only) + endpoint circles + toggle visual |
| `MapGallery.tsx` | Tela de galeria de mapas (GM e jogador) |
| `MapTokenModal.tsx` | Raio de visão + compartilhamento de visão + link ficha |

Tipos em `web/src/lib/mapTypes.ts`. Hook de realtime em `web/src/hooks/useMapRealtime.ts`. Algoritmo de fog em `web/src/lib/fogOfWar.ts`.

### Decisões técnicas chave

| Decisão | Escolha | Motivo |
|---|---|---|
| Canvas | react-konva | React-friendly, layers nativas, touch |
| Realtime | Supabase Broadcast | Baixa latência; sem persistência desnecessária |
| Fog | Ray Casting 2D (`fogOfWar.ts`) | Funciona bem para N < 20 segmentos por layer |
| Fog storage | JSONB com polígono pré-computado | Render sem recálculo |
| Multi-floor | Konva Layers interleaved por andar | Garante Z-order correto (imagem → tokens por andar) |
| Overlay de andar inferior | Konva Rect preto 55% | Evita acúmulo de opacidade entre layers |
| Seleção de andar | `isActive` por layer + `orderIndex` | `isActive` = POV do GM; `orderIndex` determina stack |
| Porta fechada = parede | Entrada no array `walls` antes do ray caster | Reutiliza ray caster sem modificação |
| Bucket de mapas | `map-assets` separado de `character-portraits` | Isolamento de domínio; limpeza por tipo |
| Uploads | Portraits: 15MB (`MAX_IMAGE_SIZE_MB`); layers de mapa: 30MB (`MAX_MAP_IMAGE_SIZE_MB`) | Tamanhos diferentes por tipo |

### Broadcast events (`useMapRealtime.ts`)

```typescript
TOKEN_MOVE | TOKEN_UPDATE | TOKEN_ADD | TOKEN_REMOVE
LAYER_CHANGE | FOG_UPDATE | MAP_SETTINGS_UPDATE
DOOR_ADD | DOOR_DELETE | DOOR_TOGGLE
```

### Fog diferenciado por papel
- GM: `MapFogLayer` recebe `isGm=true` → opacidade 35% (vê o mapa completo)
- Jogador: opacidade 100% (imersão total)

---

## 5. Padrões de Código

- **Componentes:** funcionais, com TypeScript, sem classes
- **Estado global:** via Context API ou hooks customizados em `hooks/`
- **Supabase:** client em `web/src/lib/supabase.ts`; realtime via broadcast e subscriptions
- **Capítulos:** carregados como strings Markdown via `chapterLoader.ts` (Vite trata `.md` como asset)
- **Widgets:** registrados em `chapterWidgets.tsx` e referenciados em `chapterManifest.ts`
- **Sem comentários** no código a não ser que o porquê seja não-óbvio
- **Sem mock de banco de dados** em testes — usar dados reais

---

## 5. Skills Disponíveis

| Comando | Uso |
|---|---|
| `/task <descrição>` | Orquestra Planner → Executor → Validator para qualquer tarefa |
| `/sync-mechanics` | Sincroniza `chapters/` com `chapterManifest.ts` quando capítulos mudam |
| `/review-widget` | Confere se um widget do site está alinhado com o capítulo correspondente |
| `/add-widget` | Cria um novo widget interativo para um capítulo |
