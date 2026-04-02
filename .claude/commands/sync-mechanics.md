# Sincronizar Mecânicas com o Website

Sincroniza os capítulos do livro Arcádia com o manifest do projeto web.

## Quando usar

Execute este comando sempre que:
- Um capítulo em `chapters/` for editado, adicionado, renomeado ou reordenado
- Quiser verificar se o manifest web está atualizado
- O título de um capítulo (linha com `# `) mudar no arquivo `.md`
- Um novo capítulo for criado

## O que este comando faz

1. Lista todos os arquivos `.md` em `/Users/naga/Documents/arcadia/book/chapters/`
2. Extrai o título (primeira linha começando com `# `) de cada arquivo
3. Compara com o array `CHAPTERS` em `/Users/naga/Documents/arcadia/web/src/data/chapterManifest.ts`
4. Detecta: novos capítulos, capítulos removidos, títulos alterados, reordenamento
5. Atualiza **apenas** o `chapterManifest.ts` — nunca modifica os arquivos `.md`
6. Reporta um diff estruturado com todas as mudanças

## Instruções para o agente

Você está sincronizando metadados entre o livro fonte (`chapters/`) e o projeto web (`web/src/data/chapterManifest.ts`).

### Passo 1 — Inventário dos capítulos

Leia todos os arquivos `.md` em `/Users/naga/Documents/arcadia/book/chapters/`. Para cada arquivo:
- Extraia o prefixo numérico (ex: `01`, `12`)
- Extraia o título H1 (primeira linha que começa com `# `, sem o `# `)
- Derive o slug: nome do arquivo sem extensão, sem o prefixo numérico, substituindo `_` por `-`
  - Exemplo: `01_introducao.md` → slug `introducao`
  - Exemplo: `06_elementos_e_afinidades.md` → slug `elementos-e-afinidades`

### Passo 2 — Inventário do manifest web

Leia `/Users/naga/Documents/arcadia/web/src/data/chapterManifest.ts`. Extraia o array `CHAPTERS` com: `id`, `slug`, `title`, `part`, `order` de cada entrada.

### Passo 3 — Comparação (diff)

Compare os dois inventários:
- Arquivos em `chapters/` mas **não** no manifest → **Novos capítulos** (adicionar)
- Entradas no manifest sem arquivo correspondente → **Capítulos removidos** (remover)
- Arquivos onde o H1 difere do `title` no manifest → **Títulos alterados** (atualizar)
- Arquivos com ordem numérica diferente do `order` no manifest → **Reordenamento** (corrigir)

### Passo 4 — Agrupamento por Parte (para novos capítulos)

Infira a `Part` pelo número do capítulo:
- Capítulos 1–4: `'Fundamentos'`
- Capítulos 5–7: `'O Arcano'`
- Capítulos 8–11: `'O Navio e a Tripulação'`
- Capítulos 12+: `'O Mundo'`

Se ambíguo, pergunte ao usuário antes de escrever.

### Passo 5 — Atualizar o manifest

Reescreva `/Users/naga/Documents/arcadia/web/src/data/chapterManifest.ts` com o array `CHAPTERS` corrigido. Preservar **exatamente** as interfaces TypeScript existentes. Manter o campo `subtitle` quando já existir; para novos capítulos, deixar `subtitle` vazio ou perguntar ao usuário.

Ordenar por `order` crescente.

### Passo 6 — Relatório

Imprima um resumo estruturado:

```
## Relatório de Sincronização — Arcádia

**Capítulos escaneados:** 15
**Entradas no manifest antes:** 15

### Alterações Aplicadas
- [TÍTULO ATUALIZADO] 03_evolucao_e_testes: "Testes e Evolução" → "Evolução e Testes"
- [NENHUMA ALTERAÇÃO] (se nada mudou)

### Impacto no projeto web
- O projeto web lê o conteúdo markdown diretamente de `../book/chapters/` via alias Vite.
- Nenhum arquivo de conteúdo foi copiado ou movido.
- Execute `npm run dev` em `web/` para ver as mudanças imediatamente.
```

## Notas

- **Nunca** modifique arquivos em `chapters/` — eles são a fonte da verdade do conteúdo
- **Nunca** modifique `vite.config.ts` ou outros arquivos do projeto web além do `chapterManifest.ts`
- Se o projeto web não existir em `/Users/naga/Documents/arcadia/web/`, informe e pare no Passo 5
- O conteúdo markdown é sempre lido diretamente pelo Vite (não copiado), então apenas metadados precisam de sincronização
- Ao alterar mecânicas de jogo: edite os `.md` → execute `/sync-mechanics` → o site reflete as mudanças no próximo `npm run dev`
