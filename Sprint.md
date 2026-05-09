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
