# Revisar Widget contra o Livro

Verifica se um widget interativo do site está alinhado com o conteúdo do capítulo correspondente no livro.

## Quando usar

Execute este comando quando:
- Suspeitar que um widget exibe informações desatualizadas ou incorretas
- Um capítulo em `chapters/` foi editado e você quer checar o impacto no widget
- Quiser validar a precisão mecânica de um widget antes de um PR
- Estiver adicionando novo conteúdo a um capítulo e precisar atualizar o widget

## O que este comando faz

1. Identifica qual widget corresponde ao capítulo em questão
2. Lê o capítulo `.md` completo (fonte da verdade)
3. Lê o código do widget correspondente
4. Compara mecânicas, valores, textos e tabelas
5. Lista divergências encontradas
6. Propõe correções no widget (nunca no capítulo)

## Instruções para o agente

Você está auditando a precisão de um widget em relação ao livro Arcádia.

**Regra absoluta:** O capítulo `.md` é sempre correto. Se divergir, corrija o widget.

### Passo 1 — Identificar o escopo

Se o usuário especificou um capítulo ou slug, use-o. Caso contrário, pergunte antes de continuar.

Mapeamento slug → widget:
- `personagem` → `web/src/components/widgets/CharacterExamplesWidget.tsx`
- `combate` → `web/src/components/widgets/CombatWidget.tsx`
- `condicoes-e-trauma` → `web/src/components/widgets/TraumaWidget.tsx`
- `elementos-e-afinidades` → `web/src/components/widgets/AfinidadeWidget.tsx`
- `bestiario` → `web/src/components/widgets/BestiaryWidget.tsx`
- `navios` → `web/src/components/widgets/ShipWidget.tsx`

Se o slug não tiver widget mapeado, informe e encerre.

### Passo 2 — Ler o capítulo

Leia o arquivo `.md` completo em `/Users/naga/Documents/arcadia/book/chapters/`. Identifique:
- Valores numéricos (dificuldades, bônus, custos, limites)
- Nomes de mecânicas, condições, perícias, talentos
- Tabelas e listas de regras
- Qualquer texto descritivo que o widget reproduza

### Passo 3 — Ler o widget

Leia o arquivo `.tsx` do widget. Identifique:
- Valores hardcoded (números, strings de mecânicas)
- Listas de opções apresentadas ao usuário
- Lógica de cálculo (fórmulas, condicionais)
- Textos exibidos que descrevem regras

### Passo 4 — Comparar e listar divergências

Para cada divergência encontrada, registre:
```
[DIVERGÊNCIA] Campo/seção: "[valor no widget]" ≠ "[valor no capítulo]"
```

Tipos comuns de divergência:
- Valor numérico diferente (ex: custo de Ação, bônus de atributo)
- Condição ou regra ausente no widget
- Nome diferente para a mesma mecânica
- Tabela incompleta ou com entradas diferentes

### Passo 5 — Relatório e correção

Imprima o relatório:

```
## Revisão do Widget: [Nome do Widget]
**Capítulo:** [slug] — [título]
**Widget:** [caminho do arquivo]

### Divergências Encontradas
- [DIVERGÊNCIA] ...
- [SEM DIVERGÊNCIAS] (se tudo estiver alinhado)

### Correções Propostas
[liste as mudanças necessárias no widget]
```

Se houver divergências, pergunte ao usuário se deseja aplicar as correções antes de modificar qualquer arquivo.

### Passo 6 — Aplicar correções (se aprovado)

Edite **apenas** o arquivo do widget. Nunca toque no `.md` do capítulo.

Após editar, confirme as mudanças com outro relatório resumido.

## Notas

- Se o capítulo tiver uma mecânica que nenhum widget cobre, informe ao usuário e sugira criá-la com `/add-widget`
- Dados como `creatures.json` e `characters.json` também são fontes de verdade para BestiaryWidget e CharacterExamplesWidget
- Ao encontrar incoerência no próprio livro (capítulo vs. capítulo), informe o usuário mas não corrija — isso é decisão de design do sistema
