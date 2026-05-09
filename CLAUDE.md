# Arcádia — Guia de Workflow para Claude

## Como usar

Qualquer tarefa, bug ou feature deve ser passada via:

```
/task <descrição curta do que fazer>
```

Exemplos:
- `/task corrigir cálculo de HP na ficha de personagem`
- `/task adicionar widget interativo para o capítulo de Arcanismo`
- `/task bug: tokens no mapa não sincronizam em tempo real`

O `/task` aciona automaticamente os três agentes definidos em `AGENTS.md` na ordem correta.

---

## Arquivos de Referência

| Arquivo | O que contém |
|---|---|
| `AGENTS.md` | Prompts completos e regras de cada sub-agente (Planner, Executor, Validator) |
| `SPEC.md` | Stack técnica, estrutura do projeto e regras do livro (fonte da verdade para agentes) |
| `Sprint.md` | Backlog global e sprint ativa — atualizado pelos agentes a cada `/task` |

---

## Protocolo de 3 Agentes

```
/task descrição
     │
     ▼
 [Planner]  ─── lê Sprint.md + SPEC.md
     │           quebra em subtasks
     │           atualiza Sprint.md
     ▼
 [Executor] ─── lê SPEC.md + chapters/ relevantes
     │           implementa subtask por subtask
     │           marca progresso no Sprint.md
     ▼
 [Validator] ── valida contra chapters/ + SPEC.md
     │           aprova ou lista issues
     ▼
  ✅ Concluído (Sprint.md atualizado)
```

Se o Validator reprovar, o Executor corrige e o Validator reavalia (máximo 2 ciclos).

---

## Regras Globais

- `chapters/` é sempre a fonte da verdade — nunca modifique para agradar ao site
- O site deve refletir o livro; ao encontrar inconsistência, ajuste o site
- Sem comentários no código a não ser que o porquê seja não-óbvio
- Sem mocks de banco de dados
- Sem features extras além do que foi pedido

---

## Skills Auxiliares

| Comando | Uso |
|---|---|
| `/sync-mechanics` | Sincroniza `chapters/` com `chapterManifest.ts` |
| `/review-widget` | Confere se um widget está alinhado com o capítulo |
| `/add-widget` | Cria um novo widget interativo para um capítulo |
