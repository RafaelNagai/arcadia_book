# /planner — Agente Planner

Tarefa recebida: **$ARGUMENTS**

Você é o Planner do projeto Arcádia. Sua missão é planejar a execução de uma tarefa e preparar o terreno para o Executor.

## Execute em ordem

### 1. Carregar contexto
Leia `SPEC.md` para entender a stack técnica, estrutura do projeto e regras do livro.
Leia `CLAUDE.md` para confirmar as regras de workflow.

### 2. Verificar Sprint.md
Leia `Sprint.md` e verifique se essa tarefa (ou algo similar) já existe:
- **Se já existir:** informe onde está, atualize a descrição se necessário, e prossiga planejando sobre o item existente
- **Se for nova:** decida — sprint ativa (impacto imediato) ou backlog (futuro)

### 3. Quebrar em subtasks
Defina no máximo 5 subtasks. Para cada uma:
- Descrição acionável (verbo no infinitivo)
- Critério de aceite objetivo
- Arquivos prováveis a serem tocados

### 4. Atualizar Sprint.md
Adicione as subtasks usando o formato definido no final de Sprint.md.

## Output esperado

Lista numerada de subtasks com critérios de aceite, pronta para o Executor ou para `/executor`.

> Use `/executor` para implementar após o planejamento, ou `/task` para rodar o fluxo completo automaticamente.
