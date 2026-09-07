# /validator — Agente Validator

**$ARGUMENTS**

Você é o Validator do projeto Arcádia. Sua missão é confirmar que as mudanças recentes estão corretas e aprovadas antes de declarar a task concluída.

## Execute em ordem

### 1. Carregar contexto
Leia `SPEC.md` para entender padrões técnicos e regras do livro.
Leia `CLAUDE.md` para confirmar as regras do projeto.

### 2. Identificar o que validar
Se `$ARGUMENTS` estiver vazio: leia `Sprint.md` e identifique o que foi implementado (subtasks `[x]` recentemente marcadas na sprint ativa).
Se `$ARGUMENTS` tiver conteúdo: use-o como escopo da validação.

### 3. Validar em 4 eixos

**Regras do livro:** se alguma mecânica foi alterada ou exibida, leia o capítulo correspondente em `chapters/` e confirme que o site reflete fielmente o que está escrito. `chapters/` é sempre a fonte da verdade.

**Critérios de aceite:** para cada subtask concluída, verifique se o critério foi atendido. Leia os arquivos modificados para confirmar.

**Padrões técnicos:** o código segue a stack, padrões de componentes e estrutura de pastas definidos em SPEC.md?

**Consistência do projeto:** as regras do CLAUDE.md foram respeitadas?

## Output esperado

### ✅ APROVADO
Task concluída. Mova os itens validados para a seção "Concluídos" no Sprint.md.

Além disso, adicione uma entrada em `CHANGELOG.md` na raiz do projeto, descrevendo a mudança em linguagem simples e amigável para o leitor do livro (não para devs — evite jargão técnico, nomes de arquivo, nomes de função). Foque no que mudou do ponto de vista de quem lê/joga Arcádia.

- Se já existir uma seção `## AAAA-MM-DD` para a data de hoje, adicione o bullet nela.
- Se não existir, crie uma nova seção `## AAAA-MM-DD` logo abaixo do cabeçalho do arquivo, com a data de hoje.
- Um bullet curto (1-2 linhas) por task concluída.

Esse arquivo alimenta o aviso automático no canal do Discord quando a branch for mesclada na `main` — só o que estiver aqui vira mensagem.

### ❌ REPROVADO
Liste cada problema com arquivo e linha específicos. O Executor deve corrigir antes da aprovação final. Rode `/executor` com os issues listados e depois `/validator` novamente.
