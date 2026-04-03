# Adicionar Widget Interativo a um Capítulo

Cria um novo widget interativo para um capítulo do livro Arcádia, seguindo os padrões existentes do projeto web.

## Quando usar

Execute este comando quando:
- Um capítulo não tem widget e se beneficiaria de um (tabelas, calculadoras, referências interativas)
- Quiser adicionar uma ferramenta de consulta rápida a um capítulo existente
- Um capítulo foi expandido com novas mecânicas que merecem visualização interativa

## O que este comando faz

1. Lê o capítulo `.md` para entender o conteúdo e mecânicas
2. Propõe o tipo de widget mais adequado
3. Cria o componente `.tsx` seguindo os padrões do projeto
4. Registra o widget em `chapterWidgets.tsx`
5. Verifica se precisa de novos tipos TypeScript

## Instruções para o agente

Você está criando um widget interativo para o site Arcádia.

**Regra absoluta:** O conteúdo do widget deve refletir fielmente o capítulo `.md`. Não invente mecânicas.

### Passo 1 — Identificar capítulo e proposta

Se o usuário especificou o capítulo, use-o. Caso contrário, pergunte.

Leia o arquivo `.md` correspondente em `/Users/naga/Documents/arcadia/book/chapters/`.

Liste as mecânicas que se prestam a interatividade:
- Tabelas de consulta (equipamentos, dificuldades, bônus por atributo)
- Calculadoras (HP, Sanidade, dano, custo de magia)
- Seletores (condições de trauma, elementos, raças)
- Visualizações (mapa de perícias, sistema de navios)

Proponha o tipo de widget ao usuário e aguarde aprovação antes de criar.

### Passo 2 — Verificar widgets existentes

Leia pelo menos 2 widgets existentes para entender os padrões:
- `/Users/naga/Documents/arcadia/book/web/src/components/widgets/CombatWidget.tsx`
- `/Users/naga/Documents/arcadia/book/web/src/components/widgets/TraumaWidget.tsx`

Padrões a seguir:
- Componente funcional com `export function NomeWidget()`
- Tailwind para layout (sem CSS inline desnecessário)
- `useState` para estado local de seleções/inputs
- Cores dos elementos via objeto constante:
  ```typescript
  const ELEMENT_COLORS: Record<string, { text: string; glow: string }> = {
    'Energia':   { text: '#E8803A', glow: 'rgba(232,128,58,0.35)'  },
    'Anomalia':  { text: '#6FC892', glow: 'rgba(111,200,146,0.35)' },
    'Paradoxo':  { text: '#50C8E8', glow: 'rgba(80,200,232,0.35)'  },
    'Astral':    { text: '#C090F0', glow: 'rgba(192,144,240,0.35)' },
    'Cognitivo': { text: '#E8B84B', glow: 'rgba(232,184,75,0.35)'  },
  }
  ```
- Fundo: `bg-[var(--color-surface)]` ou `bg-[var(--color-deep)]`
- Bordas: `border border-[var(--color-border)]`
- Texto primário: `text-[var(--color-text-primary)]`
- Texto secundário: `text-[var(--color-text-secondary)]`
- Fonte de display: `font-[family:var(--font-display)]`
- Sem imports externos além de React e dados do projeto

### Passo 3 — Criar o componente

Crie o arquivo em:
`/Users/naga/Documents/arcadia/book/web/src/components/widgets/[Nome]Widget.tsx`

Nomenclatura: PascalCase + sufixo `Widget` (ex: `EquipamentosWidget`, `NavegacaoWidget`)

O componente deve:
- Ser autocontido (sem props obrigatórias)
- Ter título descritivo com `font-[family:var(--font-display)]`
- Ser responsivo (mobile-first com Tailwind)
- Refletir **apenas** mecânicas que existem no capítulo correspondente

### Passo 4 — Registrar em chapterWidgets.tsx

Edite `/Users/naga/Documents/arcadia/book/web/src/data/chapterWidgets.tsx`:

```typescript
import { [Nome]Widget } from '@/components/widgets/[Nome]Widget'

export const CHAPTER_WIDGETS: Record<string, ReactNode> = {
  // ... entradas existentes ...
  'slug-do-capitulo': <[Nome]Widget />,
}
```

Mantenha a ordem dos slugs consistente com a ordem dos capítulos no manifest.

### Passo 5 — Verificar tipos TypeScript

Se o widget usa dados de JSON externos (`@creatures`, `@ships`, `@characters`), verifique se os tipos em `web/src/data/` cobrem os campos utilizados. Se precisar de um novo campo, adicione à interface correspondente.

### Passo 6 — Relatório final

```
## Widget Criado: [Nome]Widget

**Capítulo:** [slug] — [título]
**Arquivo:** web/src/components/widgets/[Nome]Widget.tsx
**Registrado em:** web/src/data/chapterWidgets.tsx

### Funcionalidades
- [bullet com cada feature do widget]

### Fontes de dados
- [capítulo .md, JSON files usados]

### Como testar
npm run dev → navegar para /capitulo/[slug]
O widget aparece abaixo do conteúdo do capítulo.
```

## Exemplos de widgets por capítulo sem widget ainda

| Capítulo | Sugestão de Widget |
|---|---|
| `evolucao-e-testes` | Calculadora de dificuldade (DT 8→33+), tabela de Talentos |
| `arcanismo` | Calculadora de custo arcano, visualizador de Runas |
| `moral` | Calculadora de Pool de Moral, guia de Grito de Guerra |
| `constelacao-e-navegacao` | Seletor de constelações, calculadora de navegação |
| `interludio` | Checklist de ações de downtime, calculadora de recuperação |
| `racas` | Comparador de raças, perfis narrativos |
| `regioes` | Referência de nações com recursos e políticas |
| `equipamentos` | Tabela de equipamentos por tier (SS–E), calculadora de dano |

## Notas

- Um widget fraco é pior que nenhum widget — só crie se agregar valor real ao leitor
- Prefira interatividade simples (seletores, tabelas filtráveis) a complexidade excessiva
- O widget não substitui o capítulo: ele complementa e facilita consulta rápida
- Se o capítulo ainda está em rascunho, aguarde estabilizar antes de criar o widget
