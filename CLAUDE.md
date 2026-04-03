# Arcádia — Guia do Projeto para Claude

## Visão Geral

Arcádia é um RPG de mesa com sistema próprio (2D12) ambientado em um mundo de ilhas flutuantes e navios que navegam um Mar de Nuvens. Este repositório contém:

- `chapters/` — Conteúdo do livro em Markdown (**fonte da verdade absoluta**)
- `web/` — Site React interativo que serve como referência do livro
- `characters.json` — Personagens de exemplo (fichas completas)
- `creatures.json` — Criaturas do bestiário
- `ships.json` — Navios de exemplo
- `one-shots/` — Aventuras curtas prontas para jogar

## Regra de Ouro

> **Os arquivos `.md` em `chapters/` são sempre a fonte da verdade.**
> O site reflete o livro — nunca o contrário.
> Ao detectar inconsistência entre o site e um capítulo, confie no capítulo.

Nunca modifique arquivos em `chapters/` para agradar ao site. Sempre ajuste o site para refletir o capítulo.

## Estrutura dos Capítulos

| Arquivo | Slug | Parte | Conteúdo |
|---|---|---|---|
| `01_introducao.md` | `introducao` | Fundamentos | Conceito do mundo, Mar de Nuvens, ilhas, navios |
| `02_personagem.md` | `personagem` | Fundamentos | Criação de personagem, 4 atributos, 16 perícias |
| `03_evolucao_e_testes.md` | `evolucao-e-testes` | Fundamentos | Mecânica 2D12, dificuldades, talentos, progressão |
| `04_combate.md` | `combate` | Fundamentos | Fluxo de combate, iniciativa, ações, reações |
| `16_equipamentos.md` | `equipamentos` | Fundamentos | Tiers SS–E, tabelas de dano, crafting |
| `05_arcanismo.md` | `arcanismo` | O Arcano | Sistema de magia, 5 passos, energia arcana, runas |
| `06_elementos_e_afinidades.md` | `elementos-e-afinidades` | O Arcano | 5 elementos: Energia, Anomalia, Paradoxo, Astral, Cognitivo |
| `07_condicoes_e_trauma.md` | `condicoes-e-trauma` | O Arcano | HP, Sanidade, estado Moribundo, condições de trauma |
| `08_moral.md` | `moral` | O Navio e a Tripulação | Pool de Moral compartilhado, Grito de Guerra |
| `09_navios.md` | `navios` | O Navio e a Tripulação | Tipos de navio, setores, tripulação, durabilidade |
| `10_constelacao_e_navegacao.md` | `constelacao-e-navegacao` | O Navio e a Tripulação | Assinaturas de constelação, mecânica de navegação |
| `11_interludio.md` | `interludio` | O Navio e a Tripulação | Downtime, ações longas/curtas, recuperação, crafting |
| `12_racas.md` | `racas` | O Mundo | 6 raças jogáveis (sem bônus mecânicos) |
| `13_regioes.md` | `regioes` | O Mundo | Nações, culturas, recursos, política |
| `14_dimensoes.md` | `dimensoes` | O Mundo | 4 planos de existência |
| `15_religioes.md` | `religioes` | O Mundo | 3 religiões com cosmologias |
| `17_bestiario.md` | `bestiario` | O Mundo | Templates de criaturas, blocos de estatísticas |

## Mecânicas Fundamentais do Sistema

### Atributos (4)
- **Físico** — Força, resistência física
- **Destreza** — Agilidade, precisão
- **Intelecto** — Raciocínio, percepção
- **Influência** — Carisma, manipulação

### Perícias (16, 4 por atributo)
- Físico: Fortitude, Vontade, Atletismo, Combate
- Destreza: Furtividade, Precisão, Acrobacia, Reflexo
- Intelecto: Percepção, Intuição, Investigação, Conhecimento
- Influência: Empatia, Dominação, Persuasão, Performance

### Elementos (5)
- Energia `#E8803A` — Laranja
- Anomalia `#6FC892` — Verde
- Paradoxo `#50C8E8` — Azul claro
- Astral `#C090F0` — Roxo
- Cognitivo `#E8B84B` — Dourado

### Cálculo de HP e Sanidade
```
HP       = 12 + soma de HP_BONUS[1..Físico]
Sanidade = 15 + soma de SANID_BONUS[1..max(Intelecto, Influência)]

HP_BONUS    = [0, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8...]  (índice = valor do atributo, caps em 8)
SANID_BONUS = [0, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1...]  (caps em 1)
```

## Skills Disponíveis

| Comando | Uso |
|---|---|
| `/sync-mechanics` | Sincroniza `chapters/` com `chapterManifest.ts` quando capítulos mudam |
| `/review-widget` | Confere se um widget do site está alinhado com o capítulo correspondente |
| `/add-widget` | Cria um novo widget interativo para um capítulo |

## Arquivos JSON de Dados

Localizados na raiz do projeto (`/book/`), acessados pelo site via alias Vite:

| Arquivo | Alias Vite | Conteúdo |
|---|---|---|
| `characters.json` | `@characters` | Fichas de personagens de exemplo |
| `creatures.json` | `@creatures` | Criaturas do bestiário |
| `ships.json` | `@ships` | Navios de exemplo |

Ao modificar esses arquivos, verifique que os tipos TypeScript correspondentes em `web/src/data/` ainda batem.
