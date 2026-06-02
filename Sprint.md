# Sprint.md — Backlog e Sprint Ativa

> Atualizado automaticamente pelos agentes do `/task`.
> **Planner** adiciona tasks · **Executor** marca progresso · **Validator** move para Concluídos

---

## Sprint Ativa

> Sprint atual — sem data de encerramento definida

### Em andamento
_nenhum item em andamento_

### A fazer

---

### Sistema Arcano Completo na Ficha de Personagem
**Origem:** /task Implementar sistema Arcano completo na ficha de personagem
**Adicionada:** 2026-05-19

- [ ] Subtask 2 — Rodar migração Prisma para remover campo `runas` e adicionar `modificadores` (Json) + `marcas` (Json) no modelo `Character`, e atualizar `characters.json` removendo o campo `runas` de todas as fichas de exemplo
  - **Critério de aceite:** `npx prisma migrate dev` executa sem erro; `characters.json` não contém mais o campo `runas`; fichas existentes no banco não perdem dados (migration com default `{}` e `[]`)
  - **Arquivos:** `api/prisma/schema.prisma`, `characters.json`

## Backlog

### Widgets por Capítulo — Pendentes
**Origem:** Subtask 5 da auditoria de consistência (2026-05-08)

Capítulos atualmente sem widget registrado em `chapterWidgets.tsx`:

- [ ] `introducao` — widget de introdução ao mundo / Mar de Nuvens
- [ ] `arcanismo` — simulador de ritual arcano (5 passos, custo de energia)
- [ ] `moral` — painel de pool de Moral compartilhado da tripulação
- [ ] `constelacao-e-navegacao` — calculadora de assinatura de constelação
- [ ] `interludio` — tracker de ações de downtime
- [ ] `racas` — galeria comparativa das 6 raças
- [ ] `regioes` — mapa interativo das nações
- [ ] `dimensoes` — diagrama dos 4 planos de existência
- [ ] `religioes` — árvore comparativa das 3 religiões

---

### Mapa Interativo — Melhorias Futuras
**Origem:** Perguntas em aberto do PRD original

- [ ] Remover campo `visionUnified` do schema Prisma — substituído por `sharedWith` por token; campo legado no banco
- [ ] Grid snapping opcional — tokens se movem livremente hoje; snap-to-grid seria opcional via toggle
- [ ] Tokens em múltiplos andares — hoje 1 token por personagem por mapa; split party em andares diferentes requer mover manualmente
- [ ] Iniciativa no mapa — indicador de turno integrado ao combate por token
- [ ] Medição de distância — ferramenta de régua para magias e ataques
- [ ] Portas visíveis para jogadores — hoje GM-only; considerar renderizar silhueta para jogadores
- [ ] Testes de carga — 5 usuários simultâneos não foram testados formalmente

---

## Concluídos

### Duplicar Ficha, Upload de Capa de Campanha e Tela de Abertura Animada
**Origem:** /task Implementar 3 novas features: (1) Duplicar fichas de personagem; (2) Upload de imagem de capa ao criar/editar campanha; (3) Tela de abertura animada da campanha
**Adicionada:** 2026-06-01 · **Validator:** APROVADO · **Concluída:** 2026-06-01

- [x] Subtask 1 — Backend `POST /characters/:id/duplicate`: repository `duplicate()`, service com ownership check (403 se privado de outro usuário), controller responde 201 com novo personagem; `isPublic: false` no novo registro
- [x] Subtask 2 — Frontend botão "⎘" nos 3 tipos de card em `CharacterListPage.tsx`; UUID via API, preset via localStorage; tab muda para "meus" sem reload; `api.characters.duplicate(id)` em `apiClient.ts`
- [x] Subtask 3 — `UploadService.uploadCampaignCoverImage()` + bucket `campaign-covers` em `env.ts`; `CampaignsService.uploadCoverImage()` com `assertGm`; `POST /:id/upload-cover` retorna `{ imageUrl }` e persiste no banco
- [x] Subtask 4 — `CreateCampaignModal` em `CampaignListPage.tsx` com campo de capa + preview; `EditCampaignModal` em `CampaignPage.tsx` para GM; upload após criação/edição; `api.campaigns.uploadCover(id, file)` em `apiClient.ts`
- [x] Subtask 5 — `CampaignIntroScreen.tsx` full-screen animado; título Cinzel + glow; descrição linha-por-linha com stagger; `imageUrl` como fundo com overlay; `sessionStorage` controla exibição única por sessão; botão "Entrar no Conto"; integrado em `CampaignPage.tsx` com `AnimatePresence`

---

### Deleção de Campanha
**Origem:** /task implementar deleção de campanha: ao deletar, desvincular todas as fichas vinculadas, excluir todas as imagens dos mapas do storage, e desvincular NPCs (sem deletar). Adicionar botão/UI de deletar na página de campanha.
**Adicionada:** 2026-05-29 · **Validator:** APROVADO · **Concluída:** 2026-05-29

- [x] Subtask 1 — `schema.prisma`: `CampaignCharacter.campaign: onDelete: Cascade` remove o join row ao deletar Campanha; `Character` é preservado
- [x] Subtask 2 — `campaigns.service.ts::delete()`: sequência listar mapas → deletar DB → limpar storage; `listMaps` inclui `layers[].imageUrl` (String não-nulo); `.catch(() => {})` presente
- [x] Subtask 3 — `apiClient.ts` linha 29: `if (res.status === 204) return undefined as T` antes de `res.json()`
- [x] Subtask 4 — `CampaignPage.tsx`: botão GM-only em `{isGm && ...}`; modal com confirmação e texto de aviso; `handleDeleteCampaign` correto; `deleting` desabilita ambos os botões

---

### Recuperação e Alteração de Senha
**Origem:** /task implementar "Esqueci minha senha" no login e painel de configurações com "alterar senha" para usuários logados
**Adicionada:** 2026-05-28 · **Validator:** APROVADO · **Concluída:** 2026-05-28

- [x] Subtask 1 — `authContext.tsx`: `resetPassword` e `updatePassword` adicionados ao contexto; `redirectTo` aponta para `/redefinir-senha`
- [x] Subtask 2 — `EsqueciSenhaPage.tsx`: formulário de recuperação de senha com estado de sucesso, erro inline e link "Voltar ao login"
- [x] Subtask 3 — `RedefinirSenhaPage.tsx`: detecta `PASSWORD_RECOVERY` via `onAuthStateChange`; trata token inválido, senhas divergentes e redireciona para `/login` após sucesso
- [x] Subtask 4 — `App.tsx`: rotas `/esqueci-senha`, `/redefinir-senha` e `/configuracoes` registradas
- [x] Subtask 5 — `ChangePasswordSection.tsx` + `SettingsPage.tsx` + link "Configurações" no `Navbar.tsx` (desktop e mobile) quando logado

---

### Inventário Base Fixo e Nova Fórmula de Carga
**Origem:** /task Atualizar regras de inventário e carga do personagem
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — `chapters/02_personagem.md`: tabela mostra 4 slots fixos para todo valor de Físico; fórmula `20 + (Físico × 5)` com exemplo Físico 2 → limite 30
- [x] Subtask 2 — `chapters/16_equipamentos.md`: fórmula `20 + (Físico × 5)` na seção Capacidade de Carga; seção Mochilas descreve 4 slots base fixos; nenhuma menção à fórmula antiga
- [x] Subtask 3 — `InventoryPanel.tsx`: `totalSlots = 4`, `maxWeight = 20 + fisico * 5`, label "4 slots base"
- [x] Subtask 4 — `SPEC.md`: seção "Inventário e Carga" atualizada com slots base = 4 e fórmula `20 + (Físico × 5)`
- [x] Subtask 5 — `characters.json`: sem campo `inventorySlots` ou valores derivados de Físico; calculado em tempo de render — nenhuma alteração necessária

---

### Diário de Personagem — Persistência via API
**Origem:** /task Persistir diário de personagem via API para fichas API (PATCH /characters/:id/diary)
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — Schema Prisma: campo `diary Json?` adicionado no modelo `Character`; `db push` aplicado com sucesso; client regenerado
- [x] Subtask 2 — Backend: `DiaryBlockSchema`, `DiaryCategorySchema`, `DiarySchema` em `character.schema.ts`; método `updateDiary` no `CharactersService`; rota `PATCH /:id/diary` no `charactersController`
- [x] Subtask 3 — Frontend: `api.characters.updateDiary` adicionado em `apiClient.ts`; body enviado como `JSON.stringify(diary)` onde `diary` é `{ blocks, categories }` — compatível com `DiarySchema` no controller
- [x] Subtask 4 — `CharacterPage.tsx`: carrega `raw.diary` no branch API (`setDiaryData`); `handleDiaryChange` bifurca entre `api.characters.updateDiary` (isApiChar) e `saveDiary` (local)
- [x] Subtask 5 — `loadDiary`/`saveDiary` importados e usados no branch local; typecheck API sem erros novos

---

### Diário de Personagem
**Origem:** /task adicionar Diário de Personagem na ficha
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — Tipos `DiaryBlock`, `DiaryCategory`, `DiaryData` exportados em `characterTypes.ts`
- [x] Subtask 2 — `loadDiary`/`saveDiary` em `localCharacters.ts` com chave `arcadia_diary` (sub-objeto por characterId, padrão do projeto) e fallback `{ blocks: [], categories: [] }`
- [x] Subtask 3 — `DiaryPanel.tsx` criado: sidebar createPortal, motion.div `initial={{ x: '100%' }}`, width 340, zIndex 9001, categorias com expand/collapse, blocos com textarea, drag-and-drop via @dnd-kit/sortable, canEdit=false = readonly
- [x] Subtask 4 — `FloatingDiaryButton.tsx` criado (bottom: 92, right: 28, zIndex: 80, ícone BookOpen do Lucide); `FloatingDiceButton.tsx`: bottom→156, painel bottom→216; `CharacterPage.tsx`: FloatingDiaryButton renderizado entre mochila e dado
- [x] Subtask 5 — `CharacterPage.tsx`: estado `diaryData`/`diaryOpen`, `loadDiary` no useEffect, `handleDiaryChange` com `useCallback`, `<DiaryPanel>` e `<FloatingDiaryButton>` integrados

---

### Valores Negativos em Atributos e Perícias
**Origem:** /task Permitir valores negativos para Atributos e Perícias na ficha do personagem
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — `CreatorUI.tsx`: `Stepper` aceita `min?: number` sem default; botão `−` e input sem restrição inferior quando `min` não é passado
- [x] Subtask 2 — `Step2Attrs.tsx`: removido `min={0}` do Stepper de atributos (Físico, Destreza, Intelecto, Influência, Arcano)
- [x] Subtask 3 — `Step3Skills.tsx`: removido `min={0}` do Stepper de perícias (16 perícias)
- [x] Subtask 4 — `Step4Arcano.tsx`: entropia mantém `min={0}` — não afetada pela mudança

---

### Sub-capítulos de Elementos (05_01 a 05_05) no Manifest e Sidebar
**Origem:** /task Adicionar os capítulos 05_01_energia.md, 05_02_anomolia.md, 05_03_paradoxo.md, 05_04_cognitivo.md e 05_05_astral.md ao livro como sub-itens do capítulo "Elementos" (05)
**Adicionada:** 2026-05-25 · **Validator:** APROVADO · **Concluída:** 2026-05-25

- [x] Subtask 1 — `chapterManifest.ts`: confirmado que `06_elementos` já existe com `slug: 'elementos'` e `order: 80`, sem duplicatas ou conflitos com `06_afinidades` (order: 81)
- [x] Subtask 2 — 5 entradas adicionadas em `chapterManifest.ts` com `parentSlug: 'elementos'` e orders 82–86 (Energia, Anomalia, Paradoxo, Cognitivo, Astral)
- [x] Subtask 3 — `chapterLoader.ts` sem alteração necessária; glob `@chapters/*.md` cobre os novos arquivos automaticamente
- [x] Subtask 4 — `Sidebar.tsx` sem alteração necessária; sub-capítulos renderizados indentados sob "Elementos" via `parentSlug`
- [x] Subtask 5 — `SPEC.md` atualizado: tabela "Capítulos — Mapa de Conteúdo" inclui os 5 novos arquivos com slugs e descrições corretas

---

### Bugs: Ficha no Mapa sem Edição, Título da Aba e Performance do Mapa
**Origem:** /task Três bugs/ajustes: (1) fichas abertas via modal no mapa não permitem edição pelo mestre; (2) título da aba do navegador na ficha deve mostrar "Ficha - Nome"; (3) investigar e propor melhorias de performance no mapa da campanha
**Adicionada:** 2026-05-20 · **Validator:** APROVADO · **Concluída:** 2026-05-20

- [x] Subtask 1 — `MapTokenModal.tsx`: prop `campaignId: string` adicionada; link usa `?campaignId=${campaignId}`. `MapTab.tsx`: passa `campaignId={campaign.id}`. `CharacterPage.tsx`: lê `campaignId` da URL via `URLSearchParams` para disparar `isGmOfCampaign`
- [x] Subtask 2 — `CharacterPage.tsx`: `document.title = character ? "Ficha - ${character.name}" : "Arcádia"`; deps do useEffect corrigidas para `[id, character]`
- [x] Subtask 3 — `MapFogLayer.tsx`: envolvido com `memo`; `visionPolygons` em `useMemo` no `MapCanvas.tsx` com deps precisas
- [x] Subtask 4 — `MapTokenLayer.tsx`: envolvido com `memo`; `visibleTokens` e `visibleCreatures` em `useMemo` com deps completas
- [x] Subtask 5 — `MapCanvas.tsx`: `walls`, `blockingWalls` e `effectiveFogPatches` em `useMemo` com deps corretas; todos os handlers de evento já estavam em `useCallback`

---

### Arcano como Atributo na Criação de Personagem
**Origem:** /task Adicionar atributo ARCANO na etapa de "atributos" da criação de ficha de personagem, e remover o campo de definição do ARCANO da seção "arcano" durante a criação de ficha
**Adicionada:** 2026-05-19 · **Validator:** APROVADO · **Concluída:** 2026-05-19

- [x] Subtask 1 — `arcano` adicionado ao `ATTR_GROUPS` em `creator/types.ts` com cor `#B060D0`, label "Arcano", desc "5º atributo — cresce por experiência narrativa", `skills: []`
- [x] Subtask 2 — Stepper de `arcano` removido de `Step4Arcano.tsx`; card roxo mantém apenas Entropia; resumo exibe só "Entropia Y"
- [x] Subtask 3 — Estado separado `arcano` removido de `CharacterCreatorPage`; `handleSave` usa `attributes: { ...attrs }` que já inclui `arcano`; `Step2Attrs` itera `ATTR_GROUPS` e exibe Arcano automaticamente
- [x] Subtask 4 — `Step4Arcano` não recebe mais prop `arcano`; nenhum `onChange('arcano', ...)` residual; TypeScript compila sem erros

---

### Bug: Afinidade=Antítese — Bônus e Exibição na Ficha
**Origem:** /task corrigir bug de afinidade=antítese: quando os dois são o mesmo elemento, o bônus deve ser +10 (não -10). Adicionar essa regra no livro (chapters/). Na ficha do personagem, exibir apenas um único bloco para o elemento quando afinidade e antítese são iguais.
**Adicionada:** 2026-05-19 · **Validator:** APROVADO · **Concluída:** 2026-05-19

- [x] Subtask 1 — `chapters/06_afinidades.md`: seção "Dados Iguais" reescrita para declarar explicitamente que os bônus individuais (+4 e +2) são substituídos pelo bônus único de +10
- [x] Subtask 2 — `ArcaneConfigPanel.tsx` e `ArcaneTestOverlay.tsx`: `elementBonus` retorna `10` quando `afinidade === antitese && selectedElement === afinidade`, `0` caso contrário
- [x] Subtask 3 — `ArcanoSection.tsx`: 1 card com badge "+10" quando `afinidade === antitese`; 2 cards em grid quando diferentes
- [x] Subtask 4 — `AfinidadeWidget.tsx`: bloco Dupla Conexão exibe "+2" para Antítese e "+10" como total; cálculo coerente com a tabela base do livro

---

### Sistema Arcano Completo na Ficha de Personagem — Subtasks 1, 3, 4, 5
**Origem:** /task Implementar sistema Arcano completo na ficha de personagem
**Adicionada:** 2026-05-19 · **Validator:** APROVADO · **Concluída:** 2026-05-19

- [x] Subtask 1 — Corrigir null handling em `apiAdapter.ts` para `attributes.arcano` — spread com `arcano: attr?.arcano ?? 0`
- [x] Subtask 3 — Entropia editável na ficha com dots clicáveis (0–5), sync via API e localStorage, grace period `lastLocalEntropiaTime`
- [x] Subtask 4 — Step4Arcano com card roxo, linha de resumo "Arcano X · Entropia Y · Bônus +Z"
- [x] Subtask 5 — ArcaneConfigPanel redesenhado com DndContext, pool de tokens D12 (roxos) e bônus (dourados), dropzones por modificador, fallback +/- preservado

---

### Timeline Histórica e Origem do Universo
**Origem:** /task criar página de Timeline interativa com eventos históricos em JSON e página de Origem do Universo
**Adicionada:** 2026-05-13 · **Executor:** CONCLUÍDO · **Concluída:** 2026-05-13

- [x] Subtask 1 — Criar os arquivos de conteúdo (`chapters/00_timeline.md` e `chapters/00_origem.md`) com o texto lore das eras e dos conceitos cosmológicos
- [x] Subtask 2 — Criar `web/src/data/timelineEvents.ts` com os eventos históricos tipados em JSON (campos: id, era, title, description, year; formato de ano: `dia/ano` onde `X` = pós-Era Imperial)
- [x] Subtask 3 — Criar `web/src/components/widgets/TimelineWidget.tsx`: linha do tempo vertical interativa com filtro por era (Período Existencial, Era Zero, Era Expansão, Era Imperial, Era Zohar), expandindo card de evento ao clicar
- [x] Subtask 4 — Registrar os dois novos capítulos em `chapterManifest.ts` (part: 'O Mundo', orders 5 e 6) e adicionar `TimelineWidget` e `OrigemWidget` em `chapterWidgets.tsx`
- [x] Subtask 5 — Criar `web/src/components/widgets/OrigemWidget.tsx`: painel de navegação por abas (Conceito, Inocência, Caos, Essências, Planos, Raças, Deuses, Regiões, Religiões) com visual consistente com o design system

---

### Vercel Analytics — Integração no Entry Point React
**Origem:** /task adicionar Vercel Analytics ao projeto web — instalar @vercel/analytics e integrar no entry point React de forma estruturada
**Adicionada:** 2026-05-12 · **Validator:** APROVADO · **Concluída:** 2026-05-12

- [x] Subtask 1 — Instalar a dependência `@vercel/analytics` no projeto web
- [x] Subtask 2 — Adicionar o componente `<Analytics />` no entry point `main.tsx`
- [x] Subtask 3 — Verificar que o build de produção compila sem erros após a integração

---

### Diagramação: Split de Capítulos Longos em Sub-capítulos
**Origem:** /task Melhorar a diagramação do livro dividindo capítulos longos em sub-capítulos
**Adicionada:** 2026-05-12 · **Validator:** APROVADO · **Concluída:** 2026-05-12

- [x] Subtask 1 — Dividir `07_condicoes_e_trauma.md` em três arquivos (`07_vida_e_sanidade.md`, `07_condicoes.md`, `07_traumas.md`)
- [x] Subtask 2 — Dividir `05_arcanismo.md` em três arquivos (`05_arcanismo.md` core, `05_runas.md`, `05_invocacao.md`)
- [x] Subtask 3 — Dividir `09_navios.md` em dois arquivos (`09_navios.md` estrutura e `09_combate_naval.md`)
- [x] Subtask 4 — Adicionar campo `parentSlug?: string` ao tipo `ChapterMeta` e registrar sub-capítulos no manifest com hierarquia correta
- [x] Subtask 5 — Atualizar `Sidebar.tsx` para renderizar sub-capítulos indentados; corrigido `React.Fragment` com `key` prop

---

### Cadastro de Criaturas Customizadas
**Origem:** /task criar sistema completo de cadastro de criaturas: formulário com todos os campos necessários, upload de imagem ou URL, visibilidade pública/privada, e integração com campanhas
**Adicionada:** 2026-05-11 · **Validator:** APROVADO · **Concluída:** 2026-05-12

- [x] Subtask 1 — Modelo `CustomCreature` no Prisma + backend completo (repository → service → controller → routes): CRUD em `/api/v1/custom-creatures`, upload em `/api/v1/custom-creatures/upload-image`, validação Zod, ownership check no service
- [x] Subtask 2 — Tipo `CustomCreature` em `creatureTypes.ts` e todas as funções de API client (`list`, `listPublic`, `get`, `create`, `update`, `delete`, `setVisibility`, `uploadImage`)
- [x] Subtask 3 — `CustomCreatureForm.tsx` com todos os campos, listas dinâmicas para `interactions`/`actions`/`reactions`/`variants`/`immune`/`vulnerable`, toggle público/privado, campo de imagem (upload ou URL)
- [x] Subtask 4 — `CustomCreatureFormPage.tsx`, rotas `/criaturas/nova` e `/criaturas/:id/editar` em `App.tsx`, botão "Nova Criatura" em `CreatureListPage.tsx`, seção "Minhas Criaturas"
- [x] Subtask 5 — Integração no `MapTokenPanel.tsx`: criaturas customizadas buscadas via `api.customCreatures.list()`, exibidas com badge "Custom" na modal de adição

---

### Sistema de Condições na Ficha de Personagem
**Origem:** /task Implementar sistema de Condições na ficha de personagem
**Adicionada:** 2026-05-11 · **Validator:** APROVADO · **Concluída:** 2026-05-11

- [x] Subtask 1 — Definir tipo `Condition` e `ConditionEffect` em `characterTypes.ts` e adicionar campo `conditions?: Condition[]` ao tipo `Character`
- [x] Subtask 2 — Criar componente `ConditionsSection.tsx` com visão jogador (ícones + tooltip) e visão GM (popup add/remove com picker de ícone, nome, descrição, modo avançado com campos afetados e valor numérico)
- [x] Subtask 3 — Integrar `ConditionsSection` na `StatsSection.tsx` (ao lado da Sanidade) e conectar handlers de add/remove em `CharacterPage.tsx` com `canEdit`/`isGmOfCampaign`
- [x] Subtask 4 — Persistir condições no localStorage (`localCharacters.ts`: `loadConditions`/`saveConditions` em chave `arcadia_conditions`) e via API (`apiClient.ts`: endpoint `state/conditions`)
- [x] Subtask 5 — Aplicar feedback visual de buff (verde) / nerf (vermelho) nos campos afetados de `SkillsSection`, `DefenseStats` e `StatsSection` lendo `conditions` do personagem

---

### Auditoria de Consistência: Livro ↔ Site
**Origem:** /task auditar se todas as regras do livro (chapters/) estão corretamente aplicadas no sistema
**Concluída:** 2026-05-08 · **Validator:** APROVADO

- [x] Subtask 1 — SPEC.md corrigido: base=15, HP_BONUS/SANID_BONUS=[0,4,4,3,3,2,2,2,...] — alinhado com `07_condicoes_e_trauma.md`
- [x] Subtask 2 — `elementos-e-afinidades` movido de order:6 para order:7; todos subsequentes deslocados; orders 1–18 únicos e crescentes
- [x] Subtask 3 — `maxWeight`, `weightPct`, `overDouble`, `overEncumbered`, `weightColor`, barra de carga e alertas removidos de `InventoryPanel.tsx`; capacidade agora baseada exclusivamente em slots (`2 + Físico`)
- [x] Subtask 4 — `condicoes-e-trauma` movido de `part: 'O Arcano'` para `part: 'Fundamentos'` com `order: 8`
- [x] Subtask 5 — `DiceRollerWidget` importado e registrado em `chapterWidgets.tsx` para `'evolucao-e-testes'`

---

### Mapa Interativo de Campanha
- [x] Fase 1 — Mapa estático, layers, tokens, drag
- [x] Fase 2 — Sincronização realtime via Supabase Broadcast
- [x] Fase 3 — Fog of War básico (visão circular, exploração)
- [x] Fase 4 — Line of Sight com ray casting e paredes
- [x] Polimentos pós-Fase 4 — Resize, modal config, drag-to-place, QoL paredes
- [x] Multi-Floor — Layers empilhadas, reordenação, Z-order
- [x] Portas (Fase 4.5) — Ferramenta de porta, bloqueio LOS, abrir/fechar
- [x] Fase 5 — Grid configurável, pinch-to-zoom, map gallery básica
- [x] Fase 6a — Vision Sharing: fog isolado por personagem, token único
- [x] Fase 6b — Map Gallery como tela principal, navegação GM↔jogador

---

## Formato de Task

Quando o Planner adicionar uma nova task, use este formato:

```
### [NOME DA FEATURE OU BUG]
**Origem:** /task <descrição original>
**Adicionada:** YYYY-MM-DD

- [ ] Subtask 1 — critério de aceite
- [ ] Subtask 2 — critério de aceite
- [ ] Subtask 3 — critério de aceite
```
