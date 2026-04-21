# PRD — Mapa Interativo de Campanha (Arcádia)

> **Status:** Em desenvolvimento — Fases 1, 2, 3 e 4 concluídas  
> **Versão:** 1.5  
> **Data:** 2026-04-21  
> **Escopo:** Feature de mapa tático com fog of war para campanhas do sistema Arcádia

## Status de Implementação

| Fase | Status | Entregável |
|---|---|---|
| **Fase 1 — Fundação** | ✅ Concluída | Mapa estático, layers, tokens, drag |
| **Fase 2 — Realtime** | ✅ Concluída | Sincronização ao vivo via Supabase Broadcast |
| **Fase 3 — Fog Básico** | ✅ Concluída | Visão circular, exploração, fog por layer |
| **Fase 4 — Line of Sight** | ✅ Concluída | Ray casting com paredes; fog respeitando LOS |
| **Polimentos pós-Fase 4** | ✅ Concluídos | Resize de token, modal de configuração, isolamento NPC |
| **Fase 5 — Grid e Mobile** | ⏳ Pendente | Grid configurável, mobile polish, múltiplos mapas |

---

## O que foi implementado (resumo acumulado)

### Fase 1 — Fundação
- Tabelas Prisma: `Map`, `MapLayer`, `MapToken`, `MapWall`
- CRUD completo de mapas, layers e tokens via API REST
- Upload de imagem de layer para Supabase Storage
- `MapCanvas.tsx` com react-konva: imagem, pan/zoom via scroll/drag
- `MapTokenLayer.tsx`: tokens com foto + nome, draggable
- `MapLayerPanel.tsx`: trocar layer ativa, adicionar/remover layers
- `MapTokenPanel.tsx`: adicionar/remover tokens por personagem
- Aba **Mapa** na `CampaignPage`

### Fase 2 — Realtime
- `useMapRealtime.ts`: canal Supabase Broadcast `map:{mapId}`
- `useCampaignMapChannel`: canal `campaign:{campaignId}:map` para ativar/desativar mapa entre sessões
- Eventos broadcast: `TOKEN_MOVE`, `TOKEN_ADD`, `TOKEN_REMOVE`, `LAYER_CHANGE`, `FOG_UPDATE`, `TOKEN_UPDATE`
- Throttle de drag a 50ms para broadcast eficiente
- Estado inicial carregado via REST na entrada; broadcasts sincronizam deltas

### Fase 3 — Fog of War Básico
- `MapFogLayer.tsx`: duas camadas Konva com `destination-out` (fog escuro + memória cinza)
- `fogOfWar.ts`: `computeVisibilityPolygon` (ray casting com paredes), `isInsidePolygon`, `isInsideAnyPolygon`
- `visionCircles` por token próprio do jogador; union de todos os PCs
- Exploração persistente por layer (`fogRevealed` JSONB no banco)
- Revelação manual pelo mestre (clique com ferramenta fog)
- Reset de fog por layer
- Fog state sincronizado via `FOG_UPDATE` broadcast

### Fase 4 — Line of Sight com Paredes
- Tabela `MapWall` com `points JSONB` (segmentos A→B)
- API REST: `POST/DELETE /campaigns/:cid/maps/:mid/layers/:lid/walls`
- `MapWallLayer.tsx`: renderiza paredes visíveis apenas ao mestre; parede selecionada destacada
- **Ferramenta de parede**: clique A → clique B → segmento criado; clique em parede existente abre HUD com botão de excluir (não exclui imediato)
- `computeVisibilityPolygon`: ray casting para endpoints de parede ± ε, raios de preenchimento
- Fog patches pré-computam o polígono LOS no momento da criação (`FogPatch.polygon?`) — sem recálculo no render
- `MapFogLayer` usa `polygon` se presente; fallback para círculo
- Paredes invisíveis para jogadores; LOS ainda bloqueia visão do jogador

### Polimentos pós-Fase 4

#### Ferramenta única "Selecionar"
- Removida ferramenta separada "Mover" — `MapTool` agora é `'select' | 'fog' | 'wall'`
- `handleMouseDown`: detecta se clicou em token draggable via `isOnDraggable()` (percorre árvore Konva); só inicia pan se não
- `MapToolbar` simplificado: apenas Select, Parede, Fog

#### Resize de token com drag handle Konva
- `SelectionHandle`: componente Konva com `Ring` (anel de seleção) + `Circle` draggable no bordo direito
- Drag do handle recalcula raio → `size` do token em tempo real (via ref imperativo, sem React re-render)
- `onDragEnd`: chama `onTokenResize(tokenId, size)` → atualiza estado + broadcast `TOKEN_UPDATE` + PATCH no banco
- Coluna `size FLOAT DEFAULT 1` adicionada ao modelo `MapToken`
- Apenas o mestre vê e interage com o handle de resize

#### Modal de configuração de token (`MapTokenModal`)
- Aberto pelo mestre ao: clicar no ⚙ na lista "Tokens no mapa" OU no HUD flutuante acima do token selecionado
- Exibe: foto + nome + elemento do personagem
- Controle de raio de visão: slider (50–2000px) + input numérico + toggle "usar padrão do mapa"
- Botão **Ficha ↗** abre `/ficha/:characterId` em nova aba
- Salvar → `handleVisionUpdate` → atualiza estado + broadcast `TOKEN_UPDATE { visionRadius }` + PATCH no banco
- **Somente mestre** pode abrir o modal (HUD e botão ⚙ não aparecem para jogadores)

#### Isolamento de visão de NPCs
- `visionCircles` filtra tokens por: `token.layerId === activeLayer.id && !npcCharacterIds.includes(t.characterId) && (isGm || myCharacterIds.includes(t.characterId))`
- NPCs **nunca** geram polígono de visão para nenhum jogador
- Jogadores veem NPCs dentro da visão dos **seus próprios personagens**
- Mestre vê todos os tokens sempre

---

## Como Testar (estado atual)

### Pré-requisitos
```bash
# Terminal 1 — Backend
cd /Users/naga/Documents/arcadia/book/api
npm run dev   # http://localhost:3001

# Terminal 2 — Frontend
cd /Users/naga/Documents/arcadia/book/web
npm run dev   # http://localhost:5173
```

### Fluxo do Mestre
1. Abrir campanha → aba **Mapa**
2. Criar mapa → adicionar layer (upload de imagem) → ativar layer
3. No painel lateral, adicionar tokens de personagens/NPCs
4. **Ferramenta Selecionar** (padrão): arrastar tokens; clicar token seleciona (aparece anel laranja + handle de resize)
5. Arrastar o handle circular na borda direita do anel → redimensiona o token
6. Clicar ⚙ no HUD acima do token selecionado (ou no botão ⚙ na lista lateral) → modal de configuração
   - Ajustar raio de visão individual ou usar padrão do mapa
   - Abrir ficha do personagem em nova aba
7. **Ferramenta Parede**: clicar ponto A → clicar ponto B → segmento criado; clicar em parede existente → HUD com 🗑 para excluir; ESC cancela
8. **🌫 Névoa ON/OFF**: ativa fog of war com LOS real (paredes bloqueiam visão)
9. **Ferramenta Fog**: clicar no canvas revela manualmente uma área (usa LOS do ponto clicado)
10. **↺ Reset névoa**: limpa exploração persistida da layer ativa

### Fluxo do Jogador (outra aba/browser)
1. Logar com conta de jogador membro da campanha
2. Aba **Mapa**: vê apenas áreas dentro do raio de visão dos seus personagens
3. NPCs fora do raio de visão são invisíveis
4. Tokens se movem em tempo real quando mestre arrasta
5. Áreas já exploradas (token passou por lá) ficam permanentemente reveladas
6. Paredes bloqueiam a linha de visão (LOS real)

### O que ainda NÃO funciona
- Grid overlay configurável (Fase 5)
- Suporte a touch/pinch mobile (Fase 5)
- Múltiplos mapas por campanha na UI (backend suporta; UI só mostra o ativo)
- `MapSettingsPanel` para configurar grid/visão unida inline (configuração atual: apenas via API)

---

## 1. Visão Geral

Adicionar uma aba **Mapa** à página de campanha, onde o mestre pode criar e gerenciar mapas táticos com múltiplos andares (layers), tokens de personagens/NPCs, fog of war baseado em visão de linha de vista, e sincronização em tempo real para todos os jogadores da campanha.

### Objetivos

- Mestre controla totalmente o estado do mapa (tokens, fog, layers)
- Jogadores visualizam o mapa do ponto de vista do(s) personagem(ns) deles
- Sincronização em tempo real via Supabase Realtime
- Funciona em desktop e mobile

---

## 2. Usuários e Papéis

| Papel | Quem é | Permissões no Mapa |
|---|---|---|
| **Mestre** | Criador da campanha | Criar/editar/deletar mapas; mover tokens; redesenhar/excluir paredes; revelar fog; trocar layer ativa; configurar tokens |
| **Jogador** | Membro da campanha com personagem | Visualizar mapa (perspectiva do seu personagem); pan/zoom; arrastar apenas seus próprios tokens |

---

## 3. Requisitos Funcionais

### 3.1 Gerenciamento de Mapas

- [x] **RF-01** — Mestre cria mapas com nome e lista de layers (imagens por andar)
- [x] **RF-02** — Cada layer tem: nome, ordem e imagem (upload para Supabase Storage)
- [x] **RF-03** — Mestre pode adicionar, reordenar e remover layers de um mapa
- [x] **RF-04** — Mestre escolhe qual layer está ativa (visível para jogadores)
- [x] **RF-05** — Mestre pode ter múltiplos mapas por campanha; apenas um pode estar ativo por vez

### 3.2 Tokens

- [x] **RF-06** — Mestre adiciona tokens de personagens da campanha (PC ou NPC)
- [x] **RF-07** — Token de personagem usa a foto já cadastrada; token de NPC usa a foto do NPC
- [x] **RF-08** — Token pertence a uma layer específica
- [x] **RF-09** — Mestre arrasta tokens livremente sobre o mapa (ferramenta Selecionar unificada)
- [x] **RF-10** — Mestre pode remover tokens do mapa
- [x] **RF-11** — Cada token tem configuração de **raio de visão** (valor padrão configurável globalmente, sobrescrito por token via modal)
- [x] **RF-11b** — Mestre pode redimensionar tokens com drag handle visual (Konva)
- [x] **RF-11c** — Modal de configuração de token: raio de visão + link para ficha do personagem

### 3.3 Grid

- [ ] **RF-12** — Mestre pode habilitar/desabilitar overlay de grid quadrado por mapa *(backend pronto; UI pendente)*
- [ ] **RF-13** — Tamanho da célula do grid é configurável *(backend pronto; UI pendente)*
- [ ] **RF-14** — Grid é apenas visual; tokens continuam com movimento livre

### 3.4 Fog of War

- [x] **RF-15** — Mestre usa ferramenta **Paredes** para desenhar segmentos de bloqueio de LOS
- [x] **RF-16** — Parede é um segmento A→B (clicar ponto A, clicar ponto B); ESC cancela
- [x] **RF-17** — Mestre pode remover segmentos de parede individualmente (clicar → HUD → excluir)
- [x] **RF-18** — Visão de cada token é calculada como polígono LOS com ray casting 2D (paredes bloqueiam)
- [x] **RF-19** — As visões de todos os PCs são unidas (área revelada = union de todos os polígonos)
- [ ] **RF-20** — Mestre pode desabilitar a visão unida *(campo `visionUnified` existe no banco; UI pendente)*
- [x] **RF-21** — Mestre pode **revelar manualmente** regiões do mapa (ferramenta fog + clique)
- [x] **RF-22** — Estado do fog: zona escura (nunca explorada) + zona revelada (visão atual OU explorada)
- [x] **RF-23** — Áreas exploradas (onde tokens passaram) persistem no banco por layer
- [x] **RF-24** — Fog of War é independente por layer (`fogRevealed` JSONB na `MapLayer`)
- [x] **RF-24b** — Fog patches armazenam polígono LOS pré-computado (`FogPatch.polygon`) para performance no render

### 3.5 Visualização do Jogador

- [x] **RF-25** — Jogador só vê a aba Mapa se o mestre ativou um mapa na campanha
- [x] **RF-26** — Jogador vê a layer ativa do mapa com fog LOS aplicado
- [x] **RF-27** — Visão unida: jogador vê a perspectiva coletiva do grupo (union de LOS de todos os PCs)
- [x] **RF-28** — Jogador pode fazer pan e zoom no mapa
- [x] **RF-29** — Jogador não vê tokens de NPCs fora da área visível (isolamento de visão NPC implementado)

### 3.6 Sincronização em Tempo Real

- [x] **RF-30** — Toda ação do mestre é propagada imediatamente via broadcast
- [x] **RF-31** — Novo jogador que entra recebe o estado atual completo do mapa via REST
- [x] **RF-32** — Latência de mover token: throttle de 50ms no broadcast

---

## 4. Requisitos Não-Funcionais

| ID | Requisito |
|---|---|
| **RNF-01** | Mobile-first para visualização do jogador; mobile-friendly para o mestre |
| **RNF-02** | Imagens de layer suportam até 8000×8000px; renderizadas com zoom/pan via canvas |
| **RNF-03** | Suporte a até 5 usuários simultâneos por campanha (1 mestre + 4 jogadores) |
| **RNF-04** | Fog of War calculado no frontend; paredes e posições de tokens são a source of truth no servidor |
| **RNF-05** | Fog state (áreas exploradas) persiste no banco; posições de token em tempo real via broadcast |
| **RNF-06** | Canvas library: **Konva.js** (react-konva) — compatível com React 19, SSR-safe, suporte nativo a layers, eventos touch |

---

## 5. Modelo de Dados

### Schema Prisma atual

```prisma
model Map {
  id                  String     @id @default(uuid())
  campaignId          String
  title               String
  isActive            Boolean    @default(false)
  fogEnabled          Boolean    @default(false)
  gridEnabled         Boolean    @default(false)
  gridSize            Int        @default(64)
  visionUnified       Boolean    @default(true)
  defaultVisionRadius Int        @default(150)
  createdAt           DateTime   @default(now())
  layers              MapLayer[]
  tokens              MapToken[]
}

model MapLayer {
  id          String    @id @default(uuid())
  mapId       String
  name        String
  orderIndex  Int       @default(0)
  imageUrl    String
  isActive    Boolean   @default(false)
  fogRevealed Json      @default("[]")   // FogPatch[] com polygon pré-computado
  createdAt   DateTime  @default(now())
  walls       MapWall[]
}

model MapToken {
  id          String    @id @default(uuid())
  mapId       String
  layerId     String
  characterId String
  x           Float     @default(0)
  y           Float     @default(0)
  visionRadius Int?                        // NULL = usa default do mapa
  isVisible   Boolean   @default(true)
  size        Float     @default(1)        // multiplicador de raio (0.25–4)
  createdAt   DateTime  @default(now())
}

model MapWall {
  id       String @id @default(uuid())
  mapId    String
  layerId  String
  points   Json   // [{x, y}, {x, y}] — segmento A→B
  createdAt DateTime @default(now())
}
```

---

## 6. Arquitetura

### 6.1 Estrutura de Arquivos implementados

```
web/src/
├── components/map/
│   ├── MapTab.tsx            # Orquestrador: estado, handlers, realtime, modais
│   ├── MapCanvas.tsx         # Stage Konva: pan/zoom, fog, seleção de token, resize handle
│   ├── MapTokenLayer.tsx     # Tokens (foto, drag, visibilidade por LOS)
│   ├── MapFogLayer.tsx       # Fog com destination-out e polígonos LOS
│   ├── MapWallLayer.tsx      # Paredes (visível só ao mestre); seleção para delete
│   ├── MapToolbar.tsx        # Selecionar | Parede | Fog + toggle fog + reset fog
│   ├── MapLayerPanel.tsx     # CRUD de layers + upload de imagem
│   ├── MapTokenPanel.tsx     # Adicionar/remover tokens; botão ⚙ por token (mestre)
│   └── MapTokenModal.tsx     # Modal: raio de visão + link ficha (mestre only)
├── hooks/
│   └── useMapRealtime.ts     # useMapRealtime + useCampaignMapChannel
└── lib/
    ├── fogOfWar.ts           # computeVisibilityPolygon, isInsidePolygon, isInsideAnyPolygon
    └── mapTypes.ts           # GameMap, MapLayer, MapToken, MapWall, FogPatch, MapTool

api/src/
├── schemas/map.schema.ts     # Zod: CreateMap, UpdateMap, Layer, Token, Fog, Wall
├── repositories/maps.repository.ts
├── services/maps.service.ts
├── controllers/maps.controller.ts
└── routes/maps.routes.ts
```

### 6.2 Tipos de broadcast (useMapRealtime.ts)

```typescript
type MapBroadcastEvent =
  | { type: 'TOKEN_MOVE';   tokenId: string; x: number; y: number }
  | { type: 'TOKEN_UPDATE'; tokenId: string; data: { size?: number; isVisible?: boolean; visionRadius?: number | null } }
  | { type: 'TOKEN_ADD';    token: MapToken }
  | { type: 'TOKEN_REMOVE'; tokenId: string }
  | { type: 'LAYER_CHANGE'; layerId: string; layers: MapLayer[] }
  | { type: 'FOG_UPDATE';   fogEnabled: boolean; layerId: string | null; fogRevealed: FogPatch[] }

type CampaignMapEvent =
  | { type: 'MAP_ACTIVATED';   map: GameMap }
  | { type: 'MAP_DEACTIVATED' }
```

### 6.3 Algoritmo de Fog of War

```
fogOfWar.ts — Ray Casting 2D

computeVisibilityPolygon(origin, radius, walls):
  1. Coletar ângulos únicos: endpoints dos segmentos de parede ± ε
  2. Para cada ângulo: lançar raio; detectar primeira interseção com paredes
  3. Se sem interseção: ponto = origem + radius * direção
  4. Construir polígono com pontos resultantes, ordenados por ângulo
  5. Retornar WallPoint[]

isInsidePolygon(x, y, polygon): ray-casting point-in-polygon
isInsideAnyPolygon(x, y, polygons[]): any(isInsidePolygon)

FogPatch = { x, y, radius, polygon?: WallPoint[] }
  — polygon pré-computado na criação (drag, reveal manual, move final)
  — MapFogLayer usa polygon se presente; fallback para círculo
```

### 6.4 Isolamento de visão de NPCs

```typescript
// MapCanvas.tsx — visionCircles
const visionCircles = tokens.filter(t =>
  t.layerId === activeLayer?.id &&
  !npcCharacterIds.includes(t.characterId) &&          // NPCs nunca geram visão
  (isGm || myCharacterIds.includes(t.characterId))     // jogador vê só seus personagens
)
```

---

## 7. API Endpoints (implementados)

Prefixo: `/api/v1`. Auth: Bearer JWT.

```
GET    /campaigns/:id/maps/active          → mapa ativo + tokens + layers + paredes
GET    /campaigns/:id/maps                 → lista todos os mapas
POST   /campaigns/:id/maps                 → criar mapa
PATCH  /campaigns/:id/maps/:mapId/activate → ativar mapa
DELETE /campaigns/:id/maps/:mapId          → deletar

POST   /campaigns/:id/maps/:mapId/layers            → criar layer
PATCH  /campaigns/:id/maps/:mapId/layers/:lid/activate
DELETE /campaigns/:id/maps/:mapId/layers/:lid

GET    /campaigns/:id/maps/:mapId/tokens   → listar tokens
POST   /campaigns/:id/maps/:mapId/tokens   → criar token
PATCH  /campaigns/:id/maps/:mapId/tokens/:tid → atualizar (x, y, visionRadius, size, isVisible)
DELETE /campaigns/:id/maps/:mapId/tokens/:tid

POST   /campaigns/:id/maps/:mapId/layers/:lid/walls → criar parede (points [{x,y},{x,y}])
DELETE /campaigns/:id/maps/:mapId/layers/:lid/walls/:wid

PATCH  /campaigns/:id/maps/:mapId/fog           → { enabled: boolean }
POST   /campaigns/:id/maps/:mapId/layers/:lid/fog/patches → adicionar patches
DELETE /campaigns/:id/maps/:mapId/layers/:lid/fog/reset   → resetar exploração
```

---

## 8. Plano de Implementação — Fases

### Fase 1 — Fundação ✅
Mapa estático com layers e tokens. Sem fog, sem real-time.

### Fase 2 — Realtime ✅
Mover token sincroniza para todos em tempo real via Supabase Broadcast.

### Fase 3 — Fog of War Básico ✅
Fog de visão circular, áreas exploradas persistidas.

### Fase 4 — Line of Sight com Paredes ✅
Ray casting real; fog bloqueado por paredes; ferramenta de parede A→B com HUD de delete.

### Polimentos pós-Fase 4 ✅
- Ferramenta seleção unificada (pan + drag de token no mesmo modo)
- Resize de token via drag handle Konva
- Modal de configuração de token (raio de visão + link ficha)
- Isolamento de visão NPC
- Fog patches com polígono LOS pré-computado

### Fase 5 — Grid e Polimentos ⏳

**Objetivo:** Grid, configurações, mobile, ajustes de UX.

- [ ] `MapGridLayer.tsx`: overlay de grid configurável
- [ ] `MapSettingsPanel.tsx`: grid on/off, tamanho, raio default, visão unida on/off
- [ ] Suporte a touch (pinch-to-zoom, long-press para mover token)
- [ ] Painel lateral responsivo (drawer no mobile já existe; melhorar UX)
- [ ] Lista de múltiplos mapas por campanha com troca na UI
- [ ] Testes de carga (5 usuários simultâneos)

**Entregável:** Feature completa e polida, pronta para uso em sessão real.

---

## 9. Segurança e Validações

| Regra | Onde |
|---|---|
| Apenas mestre pode criar/editar/deletar mapas, layers, walls, tokens | `MapsService.assertMapGm()` |
| Jogador só pode ler mapas de campanhas que participa | `MapsService.assertCampaignAccess()` |
| Fog state write: apenas mestre | `assertMapGm()` |
| Resize e modal de configuração de token: apenas mestre | UI (`isGm` guard) |
| Upload de imagem de layer: apenas mestre | `assertMapGm()` |

---

## 10. Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Canvas library | **react-konva** | React-friendly, layers nativas, eventos touch |
| Realtime | **Supabase Broadcast** | Baixa latência para mouse move; sem persistência desnecessária |
| Fog algorithm | **Ray Casting 2D** | Implementação própria em `fogOfWar.ts`; funciona bem para N < 20 paredes por layer |
| Fog storage | **Polígonos JSONB** com pré-computação | Polígono LOS computado na criação do patch; render sem recálculo |
| Resize de token | **Drag handle Konva imperativo** | Atualiza anel via `ref.current` durante drag; evita conflito com sistema de drag do React |
| Ferramenta de parede | **Segmento A→B** (não polyline) | Mais intuitivo; HUD de delete em vez de delete imediato |
| Ferramenta unificada | **Select = pan + drag** | `isOnDraggable()` detecta se clicou em token; menos mudança de contexto para o mestre |

---

## 11. Dependências

```bash
# Frontend (já instaladas)
npm install konva react-konva
```

---

## 12. Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Latência de mover token (mestre → jogador) | < 300ms em rede 4G |
| Tempo de cálculo de fog com 10 paredes e 4 tokens | < 16ms (60fps) |
| Fog state ao entrar na sessão | Carregado em < 2s |
| Funciona em iOS Safari / Android Chrome | ✓ (pendente teste mobile) |
| Funciona em 1 mestre + 4 jogadores simultâneos | ✓ |

---

## 13. Perguntas em Aberto

1. **Visão unida configurável?** Campo `visionUnified` existe no banco e na API; falta UI no `MapSettingsPanel`.
2. **Grid snapping?** Tokens continuam com movimento livre; adicionar snap-to-grid opcional?
3. **Iniciativa no mapa?** Integrar com o sistema de combate (indicador de turno por token)?
4. **Medição de distância?** Ferramenta de régua entre dois pontos (útil para magias e ataques à distância)?
5. **Exportar/Importar mapas?** Reusar o mesmo mapa em outra campanha?
6. **Histórico de fog — DECIDIDO:** Mestre pode resetar o fog de uma layer. Ação irreversível; exige confirmação modal. Endpoint: `DELETE /maps/:mapId/layers/:lid/fog/reset`.
