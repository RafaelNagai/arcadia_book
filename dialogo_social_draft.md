# Novo Sistema de Interação Social — Rascunho de Decisões

> Este documento registra apenas o que foi **confirmado**. Ideias em discussão entram na seção **Em Aberto**, no final.

---

## O Problema que Isso Resolve

Hoje, testes de Persuasão/Dominação permitem que um resultado alto force a história a se adaptar ao que o jogador quer, mesmo quando a atitude do personagem não justifica isso (ex.: cuspir na cara do vilão, alegar que foi sem querer, tirar um resultado alto e o vilão aceitar). O objetivo do novo sistema é que o **Role Play real** — o que é de fato dito e feito na mesa — seja o que decide o rumo da conversa, não uma rolagem isolada.

---

## O Que é Removido

- Atributo **Influência**
- Perícias **Empatia, Dominação, Persuasão, Performance**

Nenhuma perícia nova substitui essas quatro diretamente. Funções de reconhecimento social (ler o ambiente, entender a intenção de alguém, saber o que falam sobre alguém na rua) usam as perícias que já existem:

| Função | Perícia existente |
|---|---|
| Notar detalhes visuais/físicos do NPC | **Percepção** |
| Entender intenção, ler o "jeito" do NPC | **Intuição** |
| Saber o que se fala sobre alguém (fofoca, reputação) | **Conhecimento** (via antecedente) ou **Investigação** |

Isso mantém a simetria de 3 atributos × 4 perícias = 12, sem precisar inflar a ficha.

---

## Ajuste em Sanidade

A fórmula atual usa `15 + SANID_BONUS[max(Intelecto, Influência)]` (SPEC.md). Sem o atributo Influência, a fórmula passa a usar apenas Intelecto:

```
Sanidade = 15 + SANID_BONUS[Intelecto]
```

---

## Núcleo do Sistema: Progresso da Conversa

Cada conversa relevante tem um **Progresso** — um valor oculto de **0 a 20** que representa a disposição atual do NPC. Só o Mestre sabe o valor.

### Valor Inicial

Para evitar que o Mestre precise rolar dado toda vez que um NPC qualquer abre a boca, o Progresso **começa em um valor fixo**, definido pela disposição do NPC:

| Disposição do NPC | Progresso Inicial |
|---|---|
| Aliado | 14 |
| Comum / Neutro | 10 |
| Hostil ou Desconhecido | 6 |

Rolar 1D20 para determinar o início é opcional — reservado para NPCs importantes ou imprevisíveis, quando o Mestre quiser incerteza mesmo para si.

### Como o Progresso Muda

Durante a conversa, o Mestre ajusta o Progresso para cima ou para baixo conforme o que os jogadores realmente dizem ou fazem — nunca por uma rolagem do jogador. O valor nunca é revelado; os jogadores só percebem a disposição do NPC através da própria interpretação do Mestre.

- **Teto:** 20. Mesmo com uma sequência excelente, o Progresso não passa disso — o Mestre continua interpretando normalmente, e o valor pode cair de novo se a atitude piorar.
- **Piso:** 0. Ao chegar a zero, a conversa se encerra. Não é necessariamente combate — pode virar Conflito armado, expulsão, ignorar, alarme, ou qualquer consequência que o Mestre julgue apropriada para aquele NPC.

### Magnitude dos Ajustes

| Tipo de fala/atitude | Ajuste |
|---|---|
| Comentário neutro, pequena gentileza | ±1 |
| Argumento genuíno e relevante ao momento | ±2 a ±3 |
| Toca um Gatilho | ±5 ou mais |
| Ofensa grave, mentira descoberta | -5 ou pior |

### Repetir o Mesmo Pedido

Pedir a mesma coisa de novo sem trazer nenhum argumento, atitude ou informação nova **não é neutro — irrita o NPC e reduz o Progresso**. Insistir sem novidade tem custo; voltar a pedir algo só vale depois que algo realmente mudou na conversa.

---

## Sem Dificuldade Fixa (DT)

Não existe uma DT que o Progresso precisa "bater". Cada pedido do jogador é avaliado pelo Mestre no momento, considerando o Progresso atual e o peso do pedido — o mesmo Progresso pode ser suficiente para um pedido pequeno e insuficiente para um grande.

Um pedido recusado não é um fracasso permanente: se a conversa continuar e o Progresso subir, o mesmo pedido pode ser aceito mais tarde.

> **Exemplo:** O Progresso está em 8. O jogador pede um desconto — o Mestre julga insuficiente e o NPC recusa, mas a conversa continua. Pouco depois, algo dito eleva o Progresso para 12. O jogador pede o desconto de novo — dessa vez o Mestre julga suficiente, e o NPC cede.

---

## Gatilhos

Alguns NPCs têm um ou mais **Gatilhos**: algo que, se tocado na conversa, altera o Progresso muito mais do que o normal — para cima ou para baixo. Fica a critério do Mestre definir se um NPC tem Gatilhos e quais são.

> **Exemplo:** Um mercador de ouro tem "ouro" como Gatilho. Oferecer ouro em troca de algo eleva o Progresso muito mais do que um argumento comum, porque ele valoriza ouro acima de quase tudo.

### Descobrindo Gatilhos

As perícias de reconhecimento social (Percepção, Intuição, Investigação, Conhecimento) são todas do Intelecto — sem mais nada, só personagens de Intelecto teriam um caminho mecânico pra descobrir um Gatilho. Por isso, **qualquer perícia pode revelar ou criar um Gatilho**, dependendo da abordagem descrita pelo jogador: Furtividade para espionar uma conversa, Combate ou Atletismo para um desafio físico que expõe algo sobre o NPC, e assim por diante. Físico e Destreza participam da descoberta tanto quanto Intelecto — só por caminhos diferentes.

---

## O Personagem do Jogador na Conversa

O build do personagem não entra via rolagem durante a cena — a cena inteira é resolvida por interpretação e julgamento do Mestre. **Nenhuma ficha é consultada durante a cena.** O que pode pesar no julgamento do Mestre é só o que já está vivo na história — um antecedente que o jogador já estabeleceu em jogo, uma reputação que o grupo já construiu — nunca uma checagem ativa de ficha no meio da interpretação.

**Rejeitado: gastar Pontos de Esforço** para empurrar o Progresso manualmente. Isso reabriria uma alavanca mecânica dentro da cena, que é exatamente o que este sistema tenta evitar.

**Rejeitado: Traços de Personalidade** (Empático/Dominador/Persuasivo) como ajuste passivo. Mesmo sendo passivo, exigiria que o Mestre parasse pra checar a ficha do personagem pra saber se o traço se aplica — o mesmo tipo de interrupção que o sistema inteiro tenta eliminar.

---

## Em Aberto

Nenhuma pendência de mecânica no momento.

**Ideias para o futuro (fora de escopo agora):** remover o atributo/mecânica de Sanidade por completo. Não avaliar nesta fase.
