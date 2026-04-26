# PRD — Mapa Interativo de Campanha (Arcádia)

> **Status:** Em desenvolvimento — Fases 1–4 + Polimentos + Multi-Floor + Portas concluídos
> **Versão:** 1.7
> **Data:** 2026-04-26
> **Escopo:** Feature de mapa tático com fog of war para campanhas do sistema Arcádia

## Status de Implementação

| Fase | Status | Entregável |
|---|---|---|
| **Fase 1 — Fundação** | ✅ Concluída | Mapa estático, layers, tokens, drag |
| **Fase 2 — Realtime** | ✅ Concluída | Sincronização ao vivo via Supabase Broadcast |
| **Fase 3 — Fog Básico** | ✅ Concluída | Visão circular, exploração, fog por layer |
| **Fase 4 — Line of Sight** | ✅ Concluída | Ray casting com paredes; fog respeitando LOS |
| **Polimentos pós-Fase 4** | ✅ Concluídos | Resize, modal config, drag-to-place, QoL paredes |
| **Multi-Floor (Fases de Andar)** | ✅ Concluído | Layers empilhadas, reordenação, Z-order correto |
| **Portas (Fase 4.5)** | ✅ Concluída | Ferramenta de porta, bloqueio LOS, abrir/fechar |
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
- **Fog diferenciado por papel**: GM vê fog com 35% de opacidade (transparente); jogador vê fog totalmente opaco

### Fase 4 — Line of Sight com Paredes
- Tabela `MapWall` com `points JSONB` (segmentos A→B)
- API REST: `POST/DELETE /campaigns/:cid/maps/:mid/layers/:lid/walls`
- `MapWallLayer.tsx`: paredes visíveis apenas ao mestre; parede selecionada destacada
- **Ferramenta de parede**: clique A → clique B → segmento criado; clique em parede abre HUD com 🗑
- `computeVisibilityPolygon`: ray casting para endpoints de parede ± ε
- Fog patches pré-computam o polígono LOS no momento da criação (`FogPatch.polygon?`)

### Polimentos pós-Fase 4

#### Ferramenta única "Selecionar"
- `MapTool` é `'select' | 'fog' | 'wall' | 'door'`; pan + drag de token no mesmo modo
- `isOnDraggable()` detecta se clicou em token Konva antes de iniciar pan

#### Resize de token com drag handle Konva
- `SelectionHandle`: `Ring` (anel laranja) + `Circle` draggable no bordo direito
- Drag recalcula `size` em tempo real via ref imperativo; `onDragEnd` persiste

#### Modal de configuração de token (`MapTokenModal`)
- Interface genérica: aceita `{ id, name, imageUrl, afinidade }` + `visionRadius` + `onSave`
- Abre de dois lugares: ⚙ no HUD acima do token selecionado no canvas; ⚙ na lista lateral
- Slider (50–2000px) + input numérico + toggle "usar padrão do mapa"
- Botão **Ficha ↗** abre `/ficha/:id` em nova aba

#### Drag-to-place tokens
- Panel "Arrastar para o mapa": cards draggáveis por HTML5 Drag API
- `MapCanvas` detecta `onDrop` → converte coordenadas screen → world usando `stateRef`
- Fog revela apenas no ponto de soltura, não durante o arrastre

#### Modal de pré-configuração de token (antes do drag)
- ⚙ por card no painel "Arrastar para o mapa" → abre `MapTokenModal` com `pendingVisionRadii`
- `visionRadius` configurado vira dado do `dataTransfer` no drag; `handleTokenDrop` passa para `createToken`
- Botão dourado quando raio customizado está configurado

#### QoL de paredes e portas
- Clicar fora de uma parede/porta selecionada deseleciona (não inicia nova construção)
- Círculos interativos nos endpoints do segmento selecionado → clicar continua construindo a partir daquele ponto
- Ao colocar o segundo ponto de uma parede/porta, clicar sobre um endpoint existente de outra completa o segmento com snap preciso

### Sistema Multi-Floor (Layers como Andares)

#### Conceito
- Cada layer representa um andar ou elevação (térreo, 2º andar, subsolo, sacada…)
- Imagens PNG com fundo transparente permitem "ver para baixo" através dos andares superiores
- Layers são renderizadas empilhadas; personagens no andar superior enxergam o conteúdo do andar inferior através das partes transparentes da imagem superior

#### Renderização em Z-order correto
Cada andar é renderizado em pares **imagem → tokens**, do andar mais baixo ao mais alto:
```
imagem layer 1 (fundo)
tokens layer 1  (apenas se estiver no raio de visão do jogador)
imagem layer 2
tokens layer 2  (andar atual — interativos)
fog of war      (só o andar atual)
paredes         (GM, só andar atual)
portas          (GM, só andar atual)
selection
```
- Andares inferiores: overlay preto com 55% de opacidade (Konva `Rect`) para indicar profundidade, sem acúmulo entre andares
- Tokens de andares inferiores: 45% de opacidade, não-interativos

#### Visibilidade de tokens em andares inferiores
- **Jogadores**: tokens de andares inferiores visíveis apenas se estiverem dentro do raio de visão atual (mesmos `visionPolygons` do andar corrente)
- **GM**: sempre vê todos os tokens de todos os andares (dimidos)
- **Fog desativado**: visibilidade determinada pelo flag `isVisible` do token

#### GM — seleção de andar
- GM clica em qualquer layer do painel → muda o "andar atual" (ponto de vista e edição)
- Operações de tokens, paredes, portas, fog e drag-drop sempre operam no andar atual do GM
- O `isActive` da `MapLayer` continua sendo a source of truth para o andar atual

#### Jogador — detecção automática de andar
- Jogador sem tokens: vê o andar ativo do GM como fallback
- Jogador com tokens: automaticamente vê a perspectiva do token no andar mais alto onde possui personagem
- Sem botão de troca manual; determinado pela posição dos seus tokens

#### Reordenação de layers (dnd-kit sortable)
- `MapLayerPanel.tsx` usa `@dnd-kit/sortable` para drag-to-reorder
- Handle `⠿` por item; andar mais alto no topo da lista, mais baixo na base
- Ao soltar: recalcula `orderIndex` de todas as layers e persiste via `PATCH layer/:lid` para cada layer modificada
- Otimista: estado local atualiza imediatamente antes da confirmação do servidor

#### Auto-ativação da primeira layer
- Quando o mestre cria a primeira layer de um mapa, `activateLayer` é chamado automaticamente

#### Limite de upload de layer aumentado
- `MAX_MAP_IMAGE_SIZE_MB` (default: 30MB) separado de `MAX_IMAGE_SIZE_MB` (character portraits: 15MB)
- Limite por-rota via `req.file({ limits: { fileSize: ... } })` no controller de `/upload/map-layer`

### Fase 4.5 — Portas

#### Funcionalidade
- Tabela `MapDoor` com `points JSONB` (segmento A→B) e `isOpen BOOLEAN`
- `MapDoorLayer.tsx`: portas visíveis **apenas ao mestre**
- **Ferramenta Porta** (`tool === 'door'`): clique A → clique B → cria segmento; ESC cancela
- Porta **fechada** = segmento âmbar sólido; porta **aberta** = segmento verde tracejado
- No modo **Selecionar**: clicar em porta mostra HUD com botão Abrir/Fechar
- No modo **Porta**: clicar em porta mostra HUD com botão Abrir/Fechar + 🗑 para deletar
- Clicar fora de uma porta selecionada deseleciona
- Endpoints dourados na porta selecionada permitem continuar construção daquele ponto
- Snap ao segundo ponto: clicar sobre endpoint de outra parede/porta completa o segmento

#### Bloqueio de Visão
- Portas **fechadas** funcionam como paredes para `computeVisibilityPolygon`
- Portas **abertas** não bloqueiam LOS
- Durante drag de token (live e ao soltar), o polígono de visibilidade também inclui portas fechadas
- Segmentos de porta são adicionados ao array `walls` antes de passar ao ray caster

#### Realtime
- Broadcast `DOOR_ADD`: propaga nova porta para todos os clientes
- Broadcast `DOOR_DELETE`: remove porta do estado local de todos
- Broadcast `DOOR_TOGGLE`: atualiza `isOpen` em todos os clientes em tempo real

### Gestão de Storage (Supabase)

- Imagens de layers vivem no bucket `map-assets` (separado de `character-portraits`)
- `deleteImageByUrl(url)`: detecta o bucket correto a partir da URL e remove o arquivo
- Deletar uma layer remove sua imagem do bucket `map-assets`
- Deletar um mapa remove todas as imagens de todas as suas layers
- Deletar uma campanha remove todas as imagens de mapas associados
- Atualizar a foto de um personagem remove a imagem anterior do bucket `character-portraits`
- Deletar uma layer expulsa os tokens que estavam nela (broadcast `TOKEN_REMOVE` para cada)

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

### Fluxo do Mestre — Multi-Floor
1. Criar mapa → **+ Adicionar layer** (PNG com fundo transparente para andar superior) → primeira layer auto-ativa
2. Adicionar segunda layer (andar superior) → aparece no topo da lista
3. Arrastar handle `⠿` para reordenar layers na lista
4. Clicar em qualquer layer → troca ponto de vista; todas as layers abaixo são renderizadas
5. Arrastar token de personagem para o canvas → cai no andar atual do GM
6. Trocar para andar inferior → tokens do andar superior aparecem dimidos e não-interativos

### Fluxo do Mestre — Geral
1. **Ferramenta Selecionar**: arrastar tokens; clicar token → anel laranja + handle de resize
2. Drag handle circular na borda → redimensiona token em tempo real
3. Clicar ⚙ no HUD acima do token (ou na lista lateral) → modal de configuração
4. **Ferramenta Parede**: clicar A → clicar B → segmento; clicar parede → HUD 🗑; ESC cancela
   - Clicar parede selecionada fora dela: deseleciona (não cria nova)
   - Clicar círculo dourado na ponta da parede selecionada: continua construindo daquele ponto
   - Ao colocar segundo ponto: clicar sobre endpoint de outra parede/porta snapa e completa
5. **Ferramenta Porta**: mesmo fluxo que parede; portas fechadas bloqueiam LOS
   - Modo Selecionar + clicar porta → HUD Abrir/Fechar
   - Modo Porta + clicar porta → HUD Abrir/Fechar + 🗑
   - Clicar fora de porta/parede selecionada → deseleciona
6. **🌫 Névoa ON/OFF** → fog de guerra com LOS real
   - Mestre vê fog em 35% de opacidade; jogador vê fog totalmente opaco
7. **Ferramenta Fog**: clique no canvas revela manualmente (usa LOS do ponto)
8. **↺ Reset névoa**: limpa exploração da layer atual

### Fluxo do Jogador
1. Entra na campanha → aba Mapa; vê o andar onde seu personagem está
2. Vê andares inferiores dimidos através de partes transparentes do andar atual
3. Tokens de andares inferiores aparecem apenas se estiverem no seu raio de visão
4. Áreas exploradas persistem; paredes e portas fechadas bloqueiam LOS
5. Mover token revela fog ao longo do caminho (live durante drag e ao soltar)

### O que ainda NÃO funciona
- Grid overlay configurável (Fase 5)
- Suporte a touch/pinch mobile (Fase 5)
- Múltiplos mapas por campanha na UI (backend suporta; UI só mostra o ativo)
- `MapSettingsPanel` para grid/visão unida inline

---

## 1. Visão Geral

Aba **Mapa** na página de campanha com mapas táticos multi-andar (layers), tokens de personagens/NPCs, fog of war baseado em visão de linha de vista, e sincronização em tempo real.

### Objetivos
- Mestre controla totalmente o estado do mapa (tokens, fog, layers, andares, portas)
- Jogadores visualizam do ponto de vista do(s) personagem(ns) deles
- Sincronização em tempo real via Supabase Realtime
- Funciona em desktop e mobile

---

## 2. Usuários e Papéis

| Papel | Permissões no Mapa |
|---|---|
| **Mestre** | Criar/editar/deletar mapas; mover tokens; paredes; portas; fog; selecionar andar ativo; reordenar layers |
| **Jogador** | Visualizar mapa na perspectiva do seu personagem; pan/zoom; arrastar apenas seus próprios tokens |

---

## 3. Requisitos Funcionais

### 3.1 Gerenciamento de Mapas e Layers

- [x] **RF-01** — Mestre cria mapas com nome e lista de layers (imagens por andar)
- [x] **RF-02** — Cada layer tem: nome, ordem (`orderIndex`) e imagem PNG (upload Supabase Storage, até 30MB)
- [x] **RF-03** — Mestre pode adicionar, reordenar (drag-and-drop) e remover layers
- [x] **RF-04** — Mestre escolhe qual layer é o andar atual clicando na lista (sem botão "Ativar" separado)
- [x] **RF-04b** — Primeira layer adicionada é automaticamente ativada
- [x] **RF-05** — Mestre pode ter múltiplos mapas; apenas um ativo por campanha
- [x] **RF-05b** — Deletar layer remove tokens órfãos do estado e do banco
- [x] **RF-05c** — Deletar layer/mapa/campanha limpa imagens do bucket `map-assets`

### 3.2 Sistema Multi-Floor

- [x] **RF-MF-01** — Todas as layers abaixo do andar atual do GM são renderizadas empilhadas (não só a ativa)
- [x] **RF-MF-02** — Z-order correto: imagem + tokens de cada andar, do mais baixo ao mais alto
- [x] **RF-MF-03** — Andares inferiores com overlay preto 55% (sem acúmulo entre andares)
- [x] **RF-MF-04** — Tokens de andares inferiores: visíveis apenas dentro do raio de visão do andar atual
- [x] **RF-MF-05** — Tokens de andares inferiores: não-interativos (GM não pode arrastar sem trocar de andar)
- [x] **RF-MF-06** — Fog of war aplicado apenas ao andar atual; andares inferiores mostram tokens via LOS
- [x] **RF-MF-07** — Jogador auto-detecta andar pela posição do seu token de maior `orderIndex`
- [x] **RF-MF-08** — Lista de layers: andar mais alto no topo, mais baixo na base

### 3.3 Tokens

- [x] **RF-06** — Mestre adiciona tokens de personagens da campanha (PC ou NPC)
- [x] **RF-07** — Token usa foto já cadastrada do personagem
- [x] **RF-08** — Token pertence a uma layer (andar) específica
- [x] **RF-09** — Mestre arrasta tokens livremente (ferramenta Selecionar unificada)
- [x] **RF-10** — Mestre remove tokens do mapa
- [x] **RF-11** — Cada token tem **raio de visão** configurável (padrão global sobrescrito por token)
- [x] **RF-11b** — Resize de token via drag handle visual (Konva)
- [x] **RF-11c** — Modal de configuração: raio de visão + link para ficha
- [x] **RF-11d** — Drag-to-place: arrastar personagem do painel para o canvas → insere no andar atual
- [x] **RF-11e** — Pré-configuração antes do drag: ⚙ no card de drag abre modal para ajustar visão antes de colocar
- [x] **RF-11f** — Painel "Tokens no mapa" agrupa tokens por andar (layer), todos visíveis ao GM

### 3.4 Grid

- [ ] **RF-12** — Grid overlay configurável *(backend pronto; UI pendente)*
- [ ] **RF-13** — Tamanho da célula configurável *(backend pronto; UI pendente)*

### 3.5 Fog of War

- [x] **RF-15** — Ferramenta **Paredes** para segmentos de bloqueio de LOS
- [x] **RF-16** — Parede A→B; ESC cancela
- [x] **RF-17** — Remover parede individualmente via HUD
- [x] **RF-17b** — Clicar fora da parede selecionada apenas deseleciona (não inicia nova construção)
- [x] **RF-17c** — Círculos dourados nos endpoints da parede selecionada → clicar continua construção daquele ponto
- [x] **RF-17d** — Snap ao segundo ponto: clicar endpoint de outra parede/porta completa o segmento
- [x] **RF-18** — Visão calculada como polígono LOS com ray casting 2D
- [x] **RF-19** — Visões de todos os PCs são unidas
- [x] **RF-21** — Revelação manual de fog pelo mestre
- [x] **RF-22** — Zona escura (nunca explorada) + zona revelada (visão atual ou explorada)
- [x] **RF-23** — Áreas exploradas persistem por layer no banco
- [x] **RF-24** — Fog independente por layer; patches com polígono LOS pré-computado
- [x] **RF-24b** — Fog diferenciado: GM vê fog em 35% opacidade; jogador vê fog 100% opaco
- [x] **RF-25b** — Mover token revela caminho ao longo do drag (live + ao soltar)
- [x] **RF-25c** — Fog revela respeitando portas fechadas como bloqueadores durante drag

### 3.6 Portas

- [x] **RF-D-01** — Ferramenta **Porta** separada da ferramenta Parede
- [x] **RF-D-02** — Criação: clique A → clique B → segmento de porta criado; ESC cancela
- [x] **RF-D-03** — Porta **fechada** bloqueia LOS (tratada como parede no ray caster)
- [x] **RF-D-04** — Porta **aberta** não bloqueia LOS
- [x] **RF-D-05** — Portas visíveis apenas ao mestre (GM-only rendering)
- [x] **RF-D-06** — Modo Selecionar + clicar porta → HUD com botão Abrir/Fechar
- [x] **RF-D-07** — Modo Porta + clicar porta → HUD com botão Abrir/Fechar + 🗑 (deletar)
- [x] **RF-D-08** — Clicar fora de porta/parede selecionada deseleciona
- [x] **RF-D-09** — Endpoints dourados na porta selecionada → clicar continua construção daquele ponto
- [x] **RF-D-10** — Estado aberta/fechada sincronizado em tempo real via broadcast `DOOR_TOGGLE`
- [x] **RF-D-11** — Portas persistidas no banco (`map_doors`); cascade delete com layer e mapa

### 3.7 Visualização do Jogador

- [x] **RF-25** — Jogador só vê aba Mapa se mestre ativou um mapa
- [x] **RF-26** — Jogador vê o andar do seu token com fog LOS aplicado
- [x] **RF-26b** — Jogador vê andares inferiores dimidos através de partes transparentes
- [x] **RF-27** — Visão unida: union de LOS de todos os PCs do grupo
- [x] **RF-28** — Pan e zoom no mapa
- [x] **RF-29** — NPCs fora da área visível não aparecem

### 3.8 Sincronização

- [x] **RF-30** — Toda ação do mestre propagada via broadcast
- [x] **RF-31** — Novo jogador recebe estado completo via REST
- [x] **RF-32** — Throttle de 50ms no broadcast de drag

---

## 4. Requisitos Não-Funcionais

| ID | Requisito |
|---|---|
| **RNF-01** | Mobile-first para jogador; desktop-first para mestre |
| **RNF-02** | Imagens de layer até 30MB; renderizadas com zoom/pan via canvas |
| **RNF-03** | Até 5 usuários simultâneos por campanha |
| **RNF-04** | Fog calculado no frontend; paredes, portas e posições são source of truth no servidor |
| **RNF-05** | Fog state persiste no banco; posições em tempo real via broadcast |
| **RNF-06** | Canvas: **react-konva** |
| **RNF-07** | Imagens de mapa isoladas no bucket `map-assets`; portraits em `character-portraits` |

---

## 5. Modelo de Dados

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
  doors               MapDoor[]
}

model MapLayer {
  id          String    @id @default(uuid())
  mapId       String
  name        String
  orderIndex  Int       @default(0)   // 0 = térreo; maior = andar mais alto
  imageUrl    String
  isActive    Boolean   @default(false)  // andar atual do GM
  fogRevealed Json      @default("[]")   // FogPatch[] com polygon pré-computado
  createdAt   DateTime  @default(now())
  walls       MapWall[]
  doors       MapDoor[]
}

model MapToken {
  id          String    @id @default(uuid())
  mapId       String
  layerId     String                     // qual andar o token está
  characterId String
  x           Float     @default(0)
  y           Float     @default(0)
  visionRadius Int?                      // NULL = usa default do mapa
  isVisible   Boolean   @default(true)
  size        Float     @default(1)      // multiplicador de raio (0.25–4)
  createdAt   DateTime  @default(now())
}

model MapWall {
  id        String   @id @default(uuid())
  mapId     String
  layerId   String                       // parede pertence a um andar específico
  points    Json     // [{x, y}, {x, y}] — segmento A→B
  createdAt DateTime @default(now())
}

model MapDoor {
  id        String   @id @default(uuid())
  mapId     String
  layerId   String                       // porta pertence a um andar específico
  points    Json     // [{x, y}, {x, y}] — segmento A→B
  isOpen    Boolean  @default(false)
  createdAt DateTime @default(now())
  // cascade delete com Map e MapLayer
}
```

---

## 6. Arquitetura

### 6.1 Estrutura de Arquivos

```
web/src/
├── components/map/
│   ├── MapTab.tsx          # Orquestrador: estado, handlers, realtime, modais
│   ├── MapCanvas.tsx       # Stage Konva: multi-floor rendering, pan/zoom, fog, HUDs
│   ├── MapTokenLayer.tsx   # Tokens (foto, drag, visibilidade LOS; readOnly mode para andares inferiores)
│   ├── MapFogLayer.tsx     # Fog com destination-out e polígonos LOS; opacidade diferente por papel
│   ├── MapWallLayer.tsx    # Paredes + endpoint circles interativos
│   ├── MapDoorLayer.tsx    # Portas (GM-only) + endpoint circles + preview + toggle visual
│   ├── MapToolbar.tsx      # Selecionar | Parede | Porta | Fog + toggle + reset
│   ├── MapLayerPanel.tsx   # CRUD de layers + dnd-kit sortable + seleção de andar
│   ├── MapTokenPanel.tsx   # Tokens agrupados por andar; drag-to-place; pré-config ⚙
│   └── MapTokenModal.tsx   # Modal genérico: raio de visão + link ficha
├── hooks/
│   └── useMapRealtime.ts   # useMapRealtime + useCampaignMapChannel; handlers de porta
└── lib/
    ├── fogOfWar.ts         # computeVisibilityPolygon, isInsideAnyPolygon
    └── mapTypes.ts         # GameMap, MapLayer, MapToken, MapWall, MapDoor, FogPatch, MapTool

api/src/
├── schemas/map.schema.ts
├── repositories/maps.repository.ts
├── services/
│   ├── maps.service.ts       # assertMapGm, assertMapMember; CRUD portas; fog por membro
│   ├── upload.service.ts     # uploadMapLayerImage (bucket map-assets); deleteImageByUrl (multi-bucket)
│   ├── campaigns.service.ts  # delete() limpa imagens de todos os mapas da campanha
│   └── characters.service.ts # update() limpa imagem anterior ao trocar foto
├── controllers/
│   ├── maps.controller.ts
│   └── upload.controller.ts  # /map-layer usa MAX_MAP_IMAGE_SIZE_MB (30MB)
└── routes/maps.routes.ts
```

### 6.2 Renderização Multi-Floor em Konva

```
Stage (de baixo para cima):
  Layer: imagem do andar 0                  (+ Rect overlay preto 55% se não for atual)
  Layer: tokens do andar 0                  (readOnly: vision-filtered, opacity 0.45)
  Layer: imagem do andar 1
  Layer: tokens do andar 1
  ...
  Layer: imagem do andar N (atual)          (opacity 1.0, sem overlay)
  Layer: tokens do andar N (atual)          (interativos, fog-aware)
  MapFogLayer (2 Konva layers)              (só andar atual; GM = 35% opacidade, player = 100%)
  MapWallLayer                              (GM only, andar atual)
  MapDoorLayer                              (GM only, andar atual)
  Layer: SelectionHandle
```

`MapTokenLayer` com `readOnly=true`:
- `listening={false}` — não captura eventos
- `opacity={0.45}` — dimming visual
- Visibilidade: GM vê tudo; jogadores usam `isInsideAnyPolygon(visionPolygons)`

### 6.3 Seleção de Andar

```typescript
// GM: andar atual = isActive da layer
const gmCurrentLayerId = map.layers.find(l => l.isActive)?.id

// Jogador: andar mais alto onde tem token
const effectiveCurrentLayerId = useMemo(() => {
  if (campaign.isGm) return gmCurrentLayerId
  const sorted = [...map.layers].sort((a, b) => a.orderIndex - b.orderIndex)
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (tokens.some(t => t.layerId === sorted[i].id && myCharacterIds.includes(t.characterId)))
      return sorted[i].id
  }
  return gmCurrentLayerId  // fallback
}, [...])
```

### 6.4 Reordenação de Layers

```typescript
// MapLayerPanel — handleDragEnd
const newSortedOrder = arrayMove(sortedLayers, oldIndex, newIndex)
// Andar mais alto = posição 0 da lista = maior orderIndex
const updatedLayers = newSortedOrder.map((layer, idx) => ({
  ...layer, orderIndex: total - 1 - idx
}))
// Persiste via PATCH para cada layer cujo orderIndex mudou
```

### 6.5 Tipos de Broadcast

```typescript
type MapBroadcastEvent =
  | { type: 'TOKEN_MOVE';   tokenId: string; x: number; y: number }
  | { type: 'TOKEN_UPDATE'; tokenId: string; data: { size?: number; isVisible?: boolean; visionRadius?: number | null } }
  | { type: 'TOKEN_ADD';    token: MapToken }
  | { type: 'TOKEN_REMOVE'; tokenId: string }
  | { type: 'LAYER_CHANGE'; layerId: string; layers: MapLayer[] }
  | { type: 'FOG_UPDATE';   fogEnabled: boolean; layerId: string | null; fogRevealed: FogPatch[] }
  | { type: 'DOOR_ADD';     door: MapDoor }
  | { type: 'DOOR_DELETE';  doorId: string }
  | { type: 'DOOR_TOGGLE';  doorId: string; isOpen: boolean }
```

### 6.6 Algoritmo de Fog of War

```
fogOfWar.ts — Ray Casting 2D
computeVisibilityPolygon(origin, radius, walls):
  1. Coletar ângulos: endpoints dos segmentos de parede ± ε
  2. Para cada ângulo: lançar raio; detectar primeira interseção
  3. Se sem interseção: ponto = origem + radius * direção
  4. Construir polígono ordenado por ângulo → WallPoint[]

FogPatch = { x, y, radius, polygon?: WallPoint[] }
  — polygon pré-computado no momento da criação
  — MapFogLayer usa polygon se presente; fallback para círculo

Bloqueadores de LOS = MapWall[] + MapDoor[isOpen=false]
  — Portas abertas são excluídas antes de passar ao ray caster
  — Aplicado em: visionPolygons ao vivo, fog patches durante drag, fog patch ao soltar token
```

### 6.7 Gestão de Storage

```typescript
// upload.service.ts
uploadMapLayerImage(file, userId, mapId)   → bucket: map-assets, path: {userId}/{mapId}/{uuid}.webp
uploadCharacterImage(file, userId)         → bucket: character-portraits, path: {userId}/{uuid}.webp

deleteImageByUrl(url):
  // detecta bucket pela URL: /object/public/{bucket}/
  // tenta map-assets e character-portraits em sequência
  // remove o arquivo e retorna; silencia se não encontrado

// Cascades de delete:
// layer delete  → deleteImageByUrl(layer.imageUrl)
// map delete    → forEach layer → deleteImageByUrl(layer.imageUrl)
// campaign delete → forEach map.layer → deleteImageByUrl(layer.imageUrl)
// character update (nova foto) → deleteImageByUrl(char.imageUrl anterior)
```

---

## 7. API Endpoints

Prefixo: `/api/v1`. Auth: Bearer JWT.

```
GET    /campaigns/:id/maps/active                              → mapa ativo + tokens + layers + paredes + portas
POST   /campaigns/:id/maps                                     → criar mapa
PATCH  /campaigns/:id/maps/:mapId/activate                     → ativar mapa

POST   /campaigns/:id/maps/:mapId/layers                       → criar layer
PATCH  /campaigns/:id/maps/:mapId/layers/:lid                  → atualizar layer (name, order_index)
PATCH  /campaigns/:id/maps/:mapId/layers/:lid/activate         → trocar andar ativo
DELETE /campaigns/:id/maps/:mapId/layers/:lid                  → deleta layer + imagem do bucket

POST   /campaigns/:id/maps/:mapId/tokens                       → criar token (com layer_id, vision_radius)
PATCH  /campaigns/:id/maps/:mapId/tokens/:tid                  → atualizar (x, y, visionRadius, size, isVisible)
DELETE /campaigns/:id/maps/:mapId/tokens/:tid

POST   /campaigns/:id/maps/:mapId/layers/:lid/walls            → criar parede
DELETE /campaigns/:id/maps/:mapId/layers/:lid/walls/:wid

POST   /campaigns/:id/maps/:mapId/layers/:lid/doors            → criar porta  (GM only)
DELETE /campaigns/:id/maps/:mapId/layers/:lid/doors/:did       → deletar porta (GM only)
PATCH  /campaigns/:id/maps/:mapId/layers/:lid/doors/:did/toggle → abrir/fechar porta (GM only)

PATCH  /campaigns/:id/maps/:mapId/fog                          → { enabled: boolean }
POST   /campaigns/:id/maps/:mapId/layers/:lid/fog/patches      → adicionar patches (membro)
DELETE /campaigns/:id/maps/:mapId/layers/:lid/fog/patches      → resetar exploração (GM)

POST   /upload/map-layer                                        → upload PNG (até 30MB) → bucket map-assets
POST   /upload/character-image                                  → upload foto (até 15MB) → bucket character-portraits
```

---

## 8. Plano de Implementação

### Fase 1 — Fundação ✅
### Fase 2 — Realtime ✅
### Fase 3 — Fog of War Básico ✅
### Fase 4 — Line of Sight com Paredes ✅

### Polimentos pós-Fase 4 ✅
- Ferramenta seleção unificada
- Resize de token via drag handle
- Modal de configuração de token
- Drag-to-place com pré-configuração
- QoL de paredes (deselect + endpoint circles)

### Sistema Multi-Floor ✅
- Renderização empilhada com Z-order correto por andar
- Seleção de andar pelo GM (clique na layer)
- Detecção automática de andar para jogadores
- Visibilidade de tokens em andares inferiores via vision polygons
- Reordenação de layers com dnd-kit sortable
- Limite de upload de layer aumentado para 30MB

### Fase 4.5 — Portas ✅
- Tabela `MapDoor` com `points`, `isOpen`, cascade delete
- Ferramenta Porta na toolbar
- Criação/deleção de portas (GM-only)
- Abrir/fechar porta no modo Selecionar e Porta
- Bloqueio de LOS por portas fechadas (durante drag e ao criar fog patches)
- Broadcast `DOOR_ADD`, `DOOR_DELETE`, `DOOR_TOGGLE`
- Snap de endpoint ao segundo ponto para paredes e portas
- Deselect ao clicar fora em qualquer ferramenta

### Fase 5 — Grid e Polimentos ⏳

- [ ] `MapGridLayer.tsx`: overlay de grid configurável
- [ ] `MapSettingsPanel.tsx`: grid on/off, tamanho, raio default, visão unida
- [ ] Touch (pinch-to-zoom, long-press para mover token)
- [ ] Lista de múltiplos mapas com troca na UI
- [ ] Testes de carga (5 usuários simultâneos)

---

## 9. Segurança e Validações

| Regra | Onde |
|---|---|
| Apenas mestre cria/edita/deleta mapas, layers, walls, doors, tokens | `MapsService.assertMapGm()` |
| Jogador só lê mapas de campanhas que participa | `MapsService.assertCampaignAccess()` |
| Fog write (patches): membro da campanha | `assertMapMember()` |
| Fog reset: apenas mestre | `assertMapGm()` |
| Token updateToken (x, y): membro pode mover apenas tokens do próprio personagem | Service check por `characterId` |
| Resize, modal config, troca de andar, portas: apenas mestre | UI (`isGm` guard) + `assertMapGm()` |
| Upload de layer: apenas mestre | `assertMapGm()` |

---

## 10. Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Canvas | **react-konva** | React-friendly, layers nativas, touch |
| Realtime | **Supabase Broadcast** | Baixa latência; sem persistência desnecessária |
| Fog | **Ray Casting 2D** (`fogOfWar.ts`) | Funciona bem para N < 20 segmentos por layer |
| Fog storage | **JSONB com polígono pré-computado** | Render sem recálculo |
| Multi-floor rendering | **Konva Layers interleaved por andar** | Garante Z-order correto (imagem → tokens por andar) |
| Overlay de andar inferior | **Konva Rect preto 55%** | Evita acúmulo de opacidade entre layers (0.55ⁿ) |
| Seleção de andar | **`isActive` por layer + `orderIndex`** | `isActive` = POV do GM; `orderIndex` determina stack |
| Reordenação | **`@dnd-kit/sortable`** | Já presente no projeto (runas/inventário) |
| Limite de upload | **Separado por tipo** (`MAX_IMAGE_SIZE_MB` vs `MAX_MAP_IMAGE_SIZE_MB`) | Portraits: 15MB; mapas PNG: 30MB |
| Resize de token | **Drag handle imperativo** | Evita re-render durante drag |
| Ferramenta unificada | **Select = pan + drag** | Menos troca de contexto |
| Bucket de mapas | **`map-assets` separado de `character-portraits`** | Isolamento de domínio; limpeza por tipo de recurso |
| Bloqueio de porta | **Porta fechada → entrada no array `walls`** | Reutiliza ray caster sem modificação; sem custo extra |
| Fog diferenciado por papel | **`isGm` prop em `MapFogLayer`** | GM vê o mapa completo (35% transparente); imersão do jogador preservada |

---

## 11. Perguntas em Aberto

1. **Visão unida configurável?** Campo `visionUnified` existe; falta UI no `MapSettingsPanel`.
2. **Grid snapping?** Tokens com movimento livre; snap-to-grid opcional?
3. **Tokens em múltiplos andares simultaneamente?** Hoje: 1 token por personagem por mapa. Split party em andares diferentes requer que o mestre mova o token manualmente.
4. **Iniciativa no mapa?** Indicador de turno por token integrado ao combate?
5. **Medição de distância?** Ferramenta de régua útil para magias e ataques.
6. **Portas visíveis para jogadores?** Hoje: portas são GM-only. Considerar renderizar silhueta para jogadores?
