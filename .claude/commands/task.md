# /task — Orquestrador de Tasks Arcádia

Tarefa recebida: **$ARGUMENTS**

## Protocolo obrigatório

Leia `AGENTS.md` na raiz do projeto para obter os prompts completos de cada agente e as regras de orquestração.

Em seguida, execute o protocolo de 3 agentes **em ordem sequencial** usando o Agent tool:

1. **Planner** — quebra a tarefa, verifica Sprint.md, cria subtasks
2. **Executor** — implementa as subtasks uma a uma
3. **Validator** — confirma que tudo está correto antes de declarar concluído

Nunca pule etapas. Só acione o próximo agente após receber e processar o resultado do anterior.

Se o Validator reprovar, spawna o Executor novamente com os issues listados, depois o Validator outra vez (máximo 2 ciclos de correção).

Ao final, reporte ao usuário em 3 linhas:
- O que foi feito
- Status do Validator (✅ aprovado / ❌ issues encontrados)
- O que mudou no Sprint.md
