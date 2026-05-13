# Sprint.md — Backlog e Sprint Ativa

> Atualizado automaticamente pelos agentes do `/task`.
> **Planner** adiciona tasks · **Executor** marca progresso · **Validator** move para Concluídos

---

## Sprint Ativa

> Sprint atual — sem data de encerramento definida

### Em andamento
_nenhum item em andamento_

### A fazer

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
