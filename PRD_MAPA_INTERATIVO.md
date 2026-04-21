# PRD — Mapa Interativo de Campanha (Arcádia)

> **Status:** Em desenvolvimento — Fases 1, 2 e 3 concluídas  
> **Versão:** 1.3  
> **Data:** 2026-04-20  
> **Escopo:** Feature de mapa tático com fog of war para campanhas do sistema Arcádia

## Status de Implementação

| Fase | Status | Entregável |
|---|---|---|
| **Fase 1 — Fundação** | ✅ Concluída | Mapa estático, layers, tokens, drag |
| **Fase 2 — Realtime** | ✅ Concluída | Sincronização ao vivo via Supabase Broadcast |
| **Fase 3 — Fog Básico** | ✅ Concluída | Visão circular, exploração, fog por layer |
| **Fase 4 — Line of Sight** | ⏳ Pendente | Ray casting com paredes |
| **Fase 5 — Polimentos** | ⏳ Pendente | Grid, mobile, múltiplos mapas |

---

## Como Testar (Fases 1, 2 e 3)

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
1. Abrir uma campanha → clicar aba **Mapa** na sidebar
2. Clicar **"+ Criar mapa"** → digitar nome → confirmar
3. No painel lateral (Layers) → clicar **"+ Adicionar layer"** → selecionar imagem (JPG/PNG/WebP, máx 20MB)
4. Clicar **"Ativar"** na layer → imagem aparece no canvas
5. No painel (Tokens) → clicar **"+"** ao lado de um personagem/NPC para colocá-lo no mapa
6. Selecionar ferramenta **"Mover token"** (toolbar) → arrastar tokens

### Testando Fog of War (Fase 3)
1. Na toolbar, clicar em **🌫 Névoa OFF** para ativar a névoa → mapa fica escuro
2. Tokens com `visionRadius` revelam círculos ao redor deles com gradiente suave
3. Arrastar um token para uma nova área → a área fica **permanentemente revelada** para aquela layer
4. Selecionar ferramenta **👁 Revelar névoa** → clicar no canvas para revelar manualmente uma área (raio = `defaultVisionRadius` do mapa)
5. Clicar **↺ Reset névoa** → remove todas as revelações manuais (mantém apenas a visão ao vivo dos tokens)
6. Layer fog é independente: trocar de layer reinicia a névoa visível para o estado daquela layer específica

### Fluxo do Jogador com Fog (outra aba/browser)
1. Logar com uma conta de jogador membro da campanha
2. Abrir a campanha → aba **Mapa** → ver apenas as áreas dentro do raio de visão dos tokens
3. NPCs/tokens fora do raio de visão de qualquer token ficam invisíveis
4. Quando mestre mover tokens → visão atualiza em tempo real
5. Áreas já exploradas (token passou por lá) permanecem reveladas no mapa

### O que ainda NÃO funciona
- Paredes e Line of Sight (ray casting) — Fase 4
- Grid overlay — Fase 5 (estrutura no backend já existe: `gridEnabled`, `gridSize`)

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
| **Mestre** | Criador da campanha | Criar/editar/deletar mapas; mover tokens; desenhar paredes; revelar fog; trocar layer ativa |
| **Jogador** | Membro da campanha com personagem | Visualizar mapa (perspectiva do seu personagem); pan/zoom; sem edição |

---

## 3. Requisitos Funcionais

### 3.1 Gerenciamento de Mapas

- [ ] **RF-01** — Mestre cria mapas com nome e lista de layers (imagens por andar)
- [ ] **RF-02** — Cada layer tem: nome, ordem e imagem (upload para Supabase Storage)
- [ ] **RF-03** — Mestre pode adicionar, reordenar e remover layers de um mapa
- [ ] **RF-04** — Mestre escolhe qual layer está ativa (visível para jogadores)
- [ ] **RF-05** — Mestre pode ter múltiplos mapas por campanha; apenas um pode estar ativo por vez

### 3.2 Tokens

- [ ] **RF-06** — Mestre adiciona tokens de personagens da campanha (PC ou NPC)
- [ ] **RF-07** — Token de personagem usa a foto já cadastrada; token de NPC usa a foto do NPC
- [ ] **RF-08** — Token pertence a uma layer específica; mestre pode movê-lo para outra layer
- [ ] **RF-09** — Mestre arrasta tokens livremente sobre o mapa (movimento em pixel, não em grid)
- [ ] **RF-10** — Mestre pode remover tokens do mapa
- [ ] **RF-11** — Cada token tem configuração de **raio de visão** (valor padrão configurável globalmente, sobrescrito por token)

### 3.3 Grid

- [ ] **RF-12** — Mestre pode habilitar/desabilitar overlay de grid quadrado por mapa
- [ ] **RF-13** — Tamanho da célula do grid é configurável (em pixels, relativo à imagem original)
- [ ] **RF-14** — Grid é apenas visual; tokens continuam com movimento livre

### 3.4 Fog of War

- [ ] **RF-15** — Mestre entra no **Modo Editor** para desenhar paredes (polylines)
- [ ] **RF-16** — Paredes são segmentos de linha clicados ponto a ponto (polyline); duplo-clique encerra o segmento
- [ ] **RF-17** — Mestre pode remover segmentos de parede individualmente
- [ ] **RF-18** — Visão de cada token é calculada como raio circular com line-of-sight (ray casting 2D)
- [ ] **RF-19** — Por padrão, as visões de todos os PCs são unidas (área revelada = union de todos os cones)
- [ ] **RF-20** — Mestre pode desabilitar a visão unida; cada jogador vê apenas seu personagem
- [ ] **RF-21** — Mestre pode **revelar manualmente** regiões do mapa (polygons de reveal)
- [x] **RF-22** — Estado do fog tem duas zonas (Fase 3: circular sem LOS):
  - **Preto** — fora do raio de visão atual E nunca explorado
  - **Visível** — dentro do raio de visão atual OU área explorada por token que passou por lá
  - *(Fase 4 adicionará zona cinza "visto mas não atual" com LOS real)*
- [x] **RF-23** — Áreas exploradas (onde tokens passaram) persistem no banco por layer
- [x] **RF-24** — Fog of War é independente por layer (cada `MapLayer` tem seu próprio `fogRevealed`)

### 3.5 Visualização do Jogador

- [ ] **RF-25** — Jogador só vê a aba Mapa se o mestre ativou um mapa na campanha
- [ ] **RF-26** — Jogador vê a layer ativa do mapa com fog aplicado
- [ ] **RF-27** — Se visão unida está ativa, jogador vê a perspectiva coletiva do grupo
- [ ] **RF-28** — Jogador pode fazer pan e zoom no mapa
- [ ] **RF-29** — Jogador não vê tokens de NPCs fora da área visível

### 3.6 Sincronização em Tempo Real

- [ ] **RF-30** — Toda ação do mestre (mover token, trocar layer, atualizar fog) é propagada imediatamente para jogadores
- [ ] **RF-31** — Novo jogador que entra recebe o estado atual completo do mapa
- [ ] **RF-32** — Tolerância de latência: ações de mover token devem aparecer em < 300ms para os players

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

### Tabelas no Supabase (PostgreSQL)

```sql
-- Mapa dentro de uma campanha
CREATE TABLE maps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,  -- apenas 1 mapa ativo por campanha
  grid_enabled BOOLEAN NOT NULL DEFAULT false,
  grid_size   INTEGER NOT NULL DEFAULT 64,     -- pixels por célula no tamanho original
  vision_unified BOOLEAN NOT NULL DEFAULT true, -- fog unido de todos os PCs
  default_vision_radius INTEGER NOT NULL DEFAULT 150, -- em pixels no tamanho original
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Layer (andar/nível) de um mapa
CREATE TABLE map_layers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id      UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  image_url   TEXT NOT NULL,   -- Supabase Storage URL
  is_active   BOOLEAN NOT NULL DEFAULT false, -- layer visível no momento
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Token posicionado no mapa
CREATE TABLE map_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id       UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  layer_id     UUID NOT NULL REFERENCES map_layers(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  x            FLOAT NOT NULL DEFAULT 0,  -- posição em pixels (espaço da imagem original)
  y            FLOAT NOT NULL DEFAULT 0,
  vision_radius INTEGER,  -- NULL = usa o default do mapa
  is_visible   BOOLEAN NOT NULL DEFAULT true,  -- mestre pode ocultar token dos jogadores
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Segmento de parede para LOS (polyline = lista de pontos)
CREATE TABLE map_walls (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id   UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  layer_id UUID NOT NULL REFERENCES map_layers(id) ON DELETE CASCADE,
  points   JSONB NOT NULL  -- [{x, y}, {x, y}, ...] em coordenadas da imagem original
);

-- Fog state: lista de polígonos de áreas já exploradas (persistido)
CREATE TABLE map_fog_explored (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id   UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  layer_id UUID NOT NULL REFERENCES map_layers(id) ON DELETE CASCADE,
  -- Bitmap de células exploradas em RLE ou lista de polígonos (a definir na impl.)
  explored_data JSONB NOT NULL DEFAULT '[]'
);
```

### Índices

```sql
CREATE INDEX ON maps(campaign_id);
CREATE INDEX ON map_layers(map_id);
CREATE INDEX ON map_tokens(map_id, layer_id);
CREATE INDEX ON map_walls(map_id, layer_id);
CREATE INDEX ON map_fog_explored(map_id, layer_id);
-- Garante 1 mapa ativo por campanha
CREATE UNIQUE INDEX ON maps(campaign_id) WHERE is_active = true;
-- Garante 1 layer ativa por mapa
CREATE UNIQUE INDEX ON map_layers(map_id) WHERE is_active = true;
```

---

## 6. Arquitetura

### 6.1 Estrutura de Pastas (Frontend)

```
web/src/
├── pages/
│   └── CampaignPage.tsx         # Adiciona aba "Mapa" ao TabBar existente
├── components/
│   └── map/
│       ├── MapTab.tsx            # Orquestrador da aba; decide se mostra MasterView ou PlayerView
│       ├── MasterMapView.tsx     # Visão completa do mestre com toolbar
│       ├── PlayerMapView.tsx     # Visão restrita do jogador (fog aplicado)
│       ├── MapCanvas.tsx         # Stage Konva principal (pan/zoom, layers de renderização)
│       ├── MapImageLayer.tsx     # Layer da imagem do andar (Konva.Image)
│       ├── MapGridLayer.tsx      # Overlay de grid (Konva.Line[])
│       ├── MapWallLayer.tsx      # Paredes (Konva.Line[]) — visível só ao mestre
│       ├── MapFogLayer.tsx       # Fog of war (Konva.Shape com composite operation)
│       ├── MapTokenLayer.tsx     # Tokens (Konva.Group: circle + image + label)
│       ├── MapToolbar.tsx        # Toolbar do mestre (ferramentas: selecionar, mover, paredes, revelar)
│       ├── MapLayerPanel.tsx     # Painel lateral: lista de layers, adicionar/reordenar
│       ├── MapTokenPanel.tsx     # Painel lateral: adicionar tokens ao mapa
│       └── MapSettingsPanel.tsx  # Grid, raio de visão padrão, visão unida
├── hooks/
│   ├── useMapRealtime.ts         # Supabase Realtime broadcast para o mapa
│   ├── useMapState.ts            # Estado local do mapa (tokens, walls, fog)
│   └── useFogOfWar.ts            # Cálculo de LOS / ray casting
└── lib/
    ├── fogOfWar.ts               # Algoritmo de shadow casting 2D (puro TS, testável)
    └── mapTypes.ts               # Interfaces: Map, MapLayer, MapToken, MapWall, FogState
```

### 6.2 Sincronização em Tempo Real

O mapa usa **dois canais Supabase** por estratégia de custo/frequência:

| Canal | Tipo | Dados | Frequência |
|---|---|---|---|
| `map:{mapId}:broadcast` | Realtime Broadcast | Posições de token em drag, layer ativa | Alta (cada mouse move) |
| `map:{mapId}:db` | Postgres Changes | Tokens, walls, fog persistidos | Baixa (on commit) |

**Fluxo de mover token:**
1. Mestre arrasta token → broadcast imediato `{type: 'TOKEN_MOVE', tokenId, x, y}`
2. Jogadores recebem e atualizam posição local
3. Ao soltar (drag end) → PATCH no banco → dispara Postgres Changes para confirmar

**Fluxo de fog update:**
1. Mestre revela área / token se move → `useFogOfWar` recalcula no mestre
2. Novo polígono de área explorada → broadcast `{type: 'FOG_UPDATE', exploredPolygon}`
3. Periodicamente (debounce 2s) → PATCH no banco para persistir

### 6.3 Algoritmo de Fog of War

```
lib/fogOfWar.ts — Shadow Casting 2D

Inputs:
  - tokenPosition: {x, y}
  - visionRadius: number
  - walls: Segment[]           -- segmentos de parede da layer ativa

Output:
  - visiblePolygon: Polygon    -- área visível (para aplicar ao canvas)

Algoritmo: Ray Casting circular
  1. Lançar N raios (N=360 ou adaptativo) a partir do token
  2. Para cada raio: detectar primeira interseção com segmentos de parede
  3. Construir polígono convexo com os pontos de impacto/extremidade
  4. Área visível = union dos polígonos de todos os PCs (se visão unida)

Renderização no Konva:
  - Layer de fog: retângulo preto full-size (globalCompositeOperation: 'source-over')
  - Área visível: shape com 'destination-out' (apaga o fog)
  - Área explorada (cinza): shape com 'source-over' + opacity 0.7 (preto semitransparente)
  - Tokens ocultados pelo fog: filtro de visibilidade antes de renderizar
```

---

## 7. API Endpoints (Backend REST)

Todos com prefixo `/api/v1`. Autenticação via Bearer token JWT.

### Maps

```
GET    /campaigns/:id/maps              → lista mapas da campanha
POST   /campaigns/:id/maps              → criar mapa
PATCH  /campaigns/:id/maps/:mapId/activate → ativar mapa (desativa os outros)
PUT    /maps/:mapId                     → editar config (title, grid, vision settings)
DELETE /maps/:mapId                     → deletar mapa
```

### Layers

```
GET    /maps/:mapId/layers              → listar layers
POST   /maps/:mapId/layers              → criar layer (+ upload de imagem via multipart)
PATCH  /maps/:mapId/layers/:layerId/activate → ativar layer
PUT    /maps/:mapId/layers/:layerId     → editar (nome, ordem)
DELETE /maps/:mapId/layers/:layerId     → deletar (+ remove imagem do Storage)
```

### Tokens

```
GET    /maps/:mapId/tokens              → listar tokens da layer ativa
POST   /maps/:mapId/tokens              → adicionar token ao mapa
PATCH  /maps/:mapId/tokens/:tokenId     → atualizar posição / vision_radius / layer
DELETE /maps/:mapId/tokens/:tokenId     → remover token
```

### Walls

```
GET    /maps/:mapId/walls?layerId=      → listar paredes da layer
POST   /maps/:mapId/walls               → criar segmento de parede
DELETE /maps/:mapId/walls/:wallId       → deletar segmento
```

### Fog

```
GET    /maps/:mapId/fog?layerId=        → obter fog state (áreas exploradas)
PATCH  /maps/:mapId/fog                 → persistir fog state (debounced pelo cliente)
DELETE /maps/:mapId/fog?layerId=        → resetar fog (apaga toda memória de exploração da layer)
```

### Upload

```
POST   /upload/map-layer                → upload de imagem de layer → retorna URL
```

---

## 8. Especificação de UI/UX

### 8.1 Aba Mapa na CampaignPage

```
[Personagens] [Sessão] [Mapa] [Configurações]
                               ↑ nova aba
```

- Se não houver mapa ativo: mestre vê botão "Criar Mapa"; jogador vê mensagem "Nenhum mapa ativo"
- Mobile: aba fica no bottom nav já existente

### 8.2 MasterMapView — Layout

```
┌─────────────────────────────────────────────────┐
│ [Toolbar: Selecionar | Mover | Paredes | Revelar]│
├─────────────┬───────────────────────────────────┤
│ Painel      │                                   │
│ ─ Layers    │          MapCanvas                │
│   [L1] ●   │   (pan/zoom livre)                │
│   [L2]     │                                   │
│   [+ Layer] │                                   │
│ ─ Tokens    │                                   │
│   [Add PC]  │                                   │
│   [Add NPC] │                                   │
│ ─ Settings  │                                   │
└─────────────┴───────────────────────────────────┘
```

### 8.3 Ferramentas do Mestre (Toolbar)

| Ferramenta | Ação |
|---|---|
| **Selecionar** | Click em token para selecionar (ver config: raio de visão) |
| **Mover** | Arrastar token; drag registra broadcast em tempo real |
| **Paredes** | Click para adicionar ponto; duplo-click encerra segmento; click em parede existente + Delete remove |
| **Revelar** | Click-e-arrasta polígono de reveal manual; remove fog permanentemente naquela área |

### 8.4 PlayerMapView — Layout

```
┌─────────────────────────────────────────────────┐
│ [Ícone do seu personagem]  Nome da Layer         │
├─────────────────────────────────────────────────┤
│                                                 │
│          MapCanvas (somente leitura)            │
│      Fog aplicado; pan/zoom habilitado          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 8.5 Mobile

- Mestre: toolbar colapsa em menu bottom-sheet; painel lateral vira drawer
- Pan: 1 dedo; Zoom: pinch (2 dedos)
- Mover token: long-press para entrar em modo drag

---

## 9. Segurança e Validações

| Regra | Onde validar |
|---|---|
| Apenas mestre pode criar/editar/deletar mapas, layers, walls, tokens | Backend: verificar `campaigns.owner_id == auth.uid` |
| Jogador só pode ler mapas de campanhas que participa | RLS no Supabase + backend |
| Upload de imagem de layer: apenas mestre | Backend: mesmo check |
| Fog state write: apenas mestre | Backend |
| Broadcast de posição: apenas mestre (tokens) | Validado no receptor: ignorar se sender ≠ mestre |

---

## 10. Plano de Implementação — Fases

### Fase 1 — Fundação (Semana 1-2)

**Objetivo:** Mapa estático com layers e tokens visíveis. Sem fog, sem real-time.

- [ ] Criar tabelas no Supabase (`maps`, `map_layers`, `map_tokens`)
- [ ] Adicionar endpoints REST: CRUD de mapas, layers, tokens
- [ ] Upload de imagem de layer (`/upload/map-layer`)
- [ ] Criar `mapTypes.ts` com todas as interfaces
- [ ] Criar `MapTab.tsx` com roteamento Mestre/Jogador
- [ ] Criar `MapCanvas.tsx` com react-konva: imagem da layer, pan/zoom
- [ ] Criar `MapTokenLayer.tsx`: renderizar tokens com foto + nome
- [ ] Criar `MapLayerPanel.tsx`: trocar layer ativa
- [ ] Adicionar aba "Mapa" à `CampaignPage`
- [ ] `MapToolbar.tsx` com ferramenta Mover (drag de token, PATCH posição)

**Entregável:** Mestre sobe imagem, coloca tokens, arrasta tokens. Jogador vê o mapa sem fog.

---

### Fase 2 — Realtime (Semana 3)

**Objetivo:** Mover token sincroniza para todos em tempo real.

- [ ] Criar `useMapRealtime.ts` com canal Supabase Broadcast `map:{mapId}`
- [ ] Broadcast de `TOKEN_MOVE` durante drag
- [ ] Broadcast de `LAYER_CHANGE` ao mestre trocar layer
- [ ] Broadcast de `TOKEN_ADD` / `TOKEN_REMOVE`
- [ ] Jogador recebe broadcasts e atualiza canvas
- [ ] Player que entra late: busca estado atual via REST e subscribes ao canal

**Entregável:** Sessão ao vivo com tokens se movendo em tempo real.

---

### Fase 3 — Fog of War Básico (Semana 4-5)

**Objetivo:** Fog de visão circular sem paredes.

- [ ] Criar `fogOfWar.ts` com cálculo de círculo de visão simples
- [ ] Criar `MapFogLayer.tsx` com Konva composite operations
- [ ] Renderizar fog no mestre (semitransparente) e jogador (opaco)
- [ ] Raio de visão configurável por token e globalmente
- [ ] Áreas exploradas (cinza) vs visíveis (full color) vs desconhecidas (preto)
- [ ] Persistir `map_fog_explored` com debounce
- [ ] Broadcast de `FOG_UPDATE` para sincronizar exploração
- [ ] Opção de visão unida (union das visões dos PCs)

**Entregável:** Fog of war circular funcionando e sincronizado.

---

### Fase 4 — Line of Sight com Paredes (Semana 6-7)

**Objetivo:** Fog bloqueado por paredes (ray casting real).

- [ ] Criar tabela `map_walls`; endpoints de CRUD
- [ ] Ferramenta **Paredes** no toolbar: polyline editor no Konva
- [ ] `MapWallLayer.tsx`: renderizar paredes (visível só ao mestre)
- [ ] Implementar ray casting em `fogOfWar.ts`:
  - Detectar interseção raio × segmento de parede
  - Construir polígono de visão resultante
- [ ] Testar casos-limite: paredes abertas, corredores, salas fechadas
- [ ] Ferramenta **Revelar** para reveal manual pelo mestre

**Entregável:** Fog of war com line-of-sight bloqueado por paredes.

---

### Fase 5 — Grid e Polimentos (Semana 8)

**Objetivo:** Grid, configurações, mobile, ajustes de UX.

- [ ] `MapGridLayer.tsx`: overlay de grid configurável
- [ ] `MapSettingsPanel.tsx`: grid on/off, tamanho, raio default, visão unida
- [ ] Suporte a touch (pinch-to-zoom, long-press para mover token)
- [ ] Painel lateral responsivo (drawer no mobile)
- [ ] Múltiplos mapas por campanha (lista de mapas, ativar/desativar)
- [ ] Tokens de NPC ocultos para jogadores quando fora da visão
- [ ] Testes de carga (5 usuários simultâneos)

**Entregável:** Feature completa e polida, pronta para uso em sessão real.

---

## 11. Decisões Técnicas

| Decisão | Escolha | Alternativas Descartadas | Motivo |
|---|---|---|---|
| Canvas library | **react-konva** | Pixi.js, Fabric.js, pure Canvas | React-friendly, layers nativas, eventos touch, sem WebGL overhead para este caso |
| Realtime | **Supabase Broadcast** | WebSocket custom, Supabase Postgres Changes para drag | Broadcast é baixa latência sem persistir cada mouse move; Postgres Changes para confirmação |
| Fog algorithm | **Ray Casting 2D** | Grid-based, precomputed shadow maps | Simples de implementar, funciona bem para N < 20 tokens e paredes simples |
| Fog storage | **Polígonos JSONB** | Bitmap, grid de células | Resolução independente do zoom; fácil de fazer union/merge; tamanho razoável |
| Mobile pan/zoom | **Konva built-in Stage drag + pinch** | HammerJS | Konva já tem suporte nativo a touch events no Stage |

---

## 12. Dependências a Adicionar

```bash
# Frontend
npm install konva react-konva

# Sem novas dependências de backend — usa Supabase Storage já configurado
```

---

## 13. Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Latência de mover token (mestre → jogador) | < 300ms em rede 4G |
| Tempo de cálculo de fog com 10 paredes e 4 tokens | < 16ms (60fps) |
| Fog state ao entrar na sessão | Carregado em < 2s |
| Funciona em iOS Safari / Android Chrome | ✓ |
| Funciona em 1 mestre + 4 jogadores simultâneos | ✓ |

---

## 14. Perguntas em Aberto (Para Decisão Futura)

1. **Múltiplos mapas ativos?** Versão atual: 1 mapa ativo por campanha. Futuro: mestre alterna entre mapas sem fechar o anterior?
2. **Histórico de fog — DECIDIDO:** Mestre pode resetar o fog de uma layer (apaga toda memória de exploração). Ação destrutiva e irreversível; exige confirmação modal. Broadcast `{type: 'FOG_RESET', layerId}` para todos os clientes. Endpoint: `DELETE /maps/:mapId/fog?layerId=`.
3. **Iniciativa no mapa?** Integrar com o sistema de combate (turno de cada personagem visível no mapa)?
4. **Medição de distância?** Ferramenta de régua para calcular distância entre dois pontos (útil para magias e ataques à distância)?
5. **Exportar/Importar mapas?** Mestre quer usar o mesmo mapa em outra campanha?
