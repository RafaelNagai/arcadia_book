# Novo Sistema de Magia — Rascunho de Decisões

> Este documento registra apenas o que foi **confirmado**. Ideias em discussão não entram aqui.

---

## Atributo: Arcano (ou Essência)

- Funciona igual aos outros atributos (Físico, Destreza, Intelecto, Influência)
- Cresce apenas narrativamente — não aumenta com PE
- O valor do Arcano define o bônus concedido pela Entropia

---

## Os Modificadores

Funcionam como perícias — têm score próprio que cresce com PE, igual ao sistema de perícias atual.

| Modificador | Efeito mecânico |
|---|---|
| **Potência** | A cada 5 no teste → +1D12 de dano ou +1 HP curado |
| **Complexidade** | A cada 5 no teste → +1 stack de condição |
| **Forma** | Define como a magia se manifesta no espaço — modelagem, direção, área. Sem mecânica de combate definida ainda. |
| **Controle** | Define a contenção e gestão da magia — precisão, estabilidade, duração. Sem mecânica de combate definida ainda. |

**Regra:** Toda magia exige no mínimo 2 modificadores, decididos pelo Mestre com base na intenção descrita.

---

## Fórmula do Teste

Para cada modificador exigido, o jogador faz um teste separado:

```
Resultado = Score do Modificador + D12s alocados + Bônus de Entropia
```

- **Score do Modificador:** valor atual do personagem naquele modificador (cresce com PE)
- **D12s alocados:** dados da pool de 2D12 distribuídos pelo jogador antes da rolagem
- **Bônus de Entropia:** valor do atributo Arcano × nível de Entropia atual (distribuível entre modificadores)

---

## Pool de Dados

- Todo personagem tem **2D12** para distribuir entre os modificadores exigidos
- O jogador decide a distribuição antes de rolar
- Pode concentrar ambos em um único modificador — o outro usará apenas seu score + Entropia
- Magias com 3+ modificadores exigem Entropia alta para cobrir os dados faltantes (intencional)

---

## Entropia

Escala de **0 a 5**. Cada ponto de Entropia concede bônus igual ao valor do atributo Arcano, alocável em qualquer modificador. Consequência de falha em magia é **proporcional ao nível de Entropia** (baixo = quase nada, alto = desastre colossal).

### Aumentar Entropia — Tabela de Modificações

Ao aumentar Entropia, o jogador rola **1D20** e recebe a modificação correspondente. A modificação fica ativa enquanto o personagem mantiver esse nível de Entropia ou superior.

A **magnitude** de toda modificação é X = nível de Entropia atual.

| D20 | Modificação | Tipo |
|---|---|---|
| 1 | **Eco Arcano** — −X em furtividade ao conjurar (voz ecoa, luz vaza) | Negativo |
| 2 | **Drenagem Ampliada** — toda conjuração custa X+1 de Sanidade | Negativo |
| 3 | **Fragilidade Mental** — −X em Vontade | Negativo |
| 4 | **Desgaste Físico** — −X em Físico | Negativo |
| 5 | **Vulnerabilidade Elemental** — recebe X de dano extra do elemento de Antítese | Negativo |
| 6 | **Fome Arcana** — sente compulsão a conjurar; resistir custa 1 Sanidade por cena | Negativo |
| 7 | **Atração Indesejada** — criaturas arcanas são atraídas pelo personagem durante descanso | Negativo |
| 8 | **Memória Fragmentada** — −X em Conhecimento; lacunas aleatórias de memória | Negativo |
| 9 | **Instabilidade Passiva** — objetos leves se movem involuntariamente ao dormir | Narrativo |
| 10 | **Marca Visível** — elemento de Afinidade manifesta-se na aparência (cicatriz, brilho, temperatura) | Narrativo |
| 11 | **Sonhos do Arcano** — sonhos intensos com o elemento; Mestre pode dar pistas ou visões | Narrativo |
| 12 | **Voz do Elemento** — ouve o elemento sussurrar em momentos de silêncio; pode ser pista ou paranoia | Narrativo |
| 13 | **Presença Arcana** — +X em Influência sobre não-magos; perceptível a outros magos | Misto |
| 14 | **Consumo Acelerado** — conjurações custam 1 Sanidade extra, mas resultado do teste +X | Misto |
| 15 | **Toque Arcano** — toque causa desconforto visível em criaturas sensíveis; +X em Intimidação | Misto |
| 16 | **Visão Dupla** — enxerga o plano arcano sobre o real; +X em Percepção arcana, −X em Percepção comum | Misto |
| 17 | **Afinidade Aguçada** — +X em testes com o elemento de Afinidade | Positivo |
| 18 | **Resistência Elemental** — reduz X de dano do elemento de Afinidade | Positivo |
| 19 | **Clareza Arcana** — +X em todos os testes arcanos enquanto Sanidade > 50% | Positivo |
| 20 | **Dom do Abismo** — ganha percepção sobrenatural ligada ao elemento; detalhe definido pelo Mestre | Positivo |

### Marcas e Permanência

Cada resultado é registrado na ficha como uma **Marca**. As marcas acumulam como registros permanentes — não expiram.

Ao rolar o **mesmo número pela terceira vez**, a modificação torna-se **permanente**, com magnitude congelada no maior nível de Entropia em que aquele número apareceu.

---

## Sanidade

- Toda conjuração custa **1 de Sanidade**, independente da magnitude
- A Entropia **não** custa mais Sanidade para aumentar

---

## Elementos

- Personagens só podem usar magia dos seus elementos de **Afinidade** e **Antítese**
- **Afinidade:** sem penalidade
- **Antítese:** **-10 no teste** — penalidade alta para dificultar o uso, mas necessária por ser o único outro elemento disponível

---

## Crítico, Falha e Casos Especiais

Funciona igual às perícias — os D12s alocados num modificador determinam os casos especiais.

| Resultado nos dados | Efeito |
|---|---|
| Um dado natural **1** | Falha crítica — consequência proporcional ao nível de Entropia |
| Um dado natural **12** | Crítico — dano ou efeito dobrado |
| Dois dados naturais **12** (2D12 no mesmo modificador) | Milagre — dano ou efeito triplicado |
| Dois dados naturais **1** (2D12 no mesmo modificador) | Desastre — consequência catastrófica proporcional à Entropia |

> Milagre e Desastre só são possíveis quando o jogador concentra ambos os D12s em um único modificador.

---

## Tabela de Grandeza (Guia do Mestre)

Não é uma DT — é uma referência para o Mestre narrar **como** a magia se manifestou com base no resultado de cada modificador. Cada modificador é lido na tabela separadamente.

| Resultado | Nível | Ancora de escala |
|---|---|---|
| 0 – 10 | **Ínfimo** | Ponto único — uma moeda, uma vela, um toque |
| 11 – 20 | **Menor** | Objeto pequeno — livro, pedra, animal de pequeno porte |
| 21 – 30 | **Moderado** | Objeto médio — barril, mesa, criança |
| 31 – 40 | **Considerável** | Humano adulto |
| 41 – 50 | **Grande** | Criatura grande — urso, boi, porta de fortaleza |
| 51 – 60 | **Severo** | Cavalo ou carroça carregada |
| 61 – 70 | **Extremo** | Elefante ou canhão de navio |
| 71 – 80 | **Colossal** | Aldeia ou navio pequeno |
| 81 – 90 | **Catastrófico** | Cidade ou navio de guerra |
| 91 – 100 | **Absoluto** | País ou ilha inteira |

**Exemplo:** Bola de fogo exige Potência + Forma. Potência = 35 (Considerável) e Forma = 10 (Ínfimo) — força para afetar um alvo do tamanho de um humano, mas sem forma definida: as chamas saíram em explosão não direcionada ao redor do conjurador.

---

## Evolução dos Modificadores

Para avançar um modificador, o jogador precisa tirar **dois 12s nos 2D12s** durante um teste que inclua aquele modificador — igual ao sistema de evolução de perícias.

O jogador pode gastar **PE** para aumentar o valor dos dados e alcançar os 12s necessários.

> Isso significa que concentrar ambos os D12s em um único modificador é a única forma de ter chance de avançar aquele modificador num determinado teste.

---

## Risco e Recompensa da Entropia Alta

Entropia alta concede bônus expressivos e permite magias de 3+ modificadores. O freio é duplo:
- A **tabela de modificações** ao aumentar Entropia (resultados imprevisíveis)
- A **falha crítica** em Entropia alta pode ser catastrófica

É um risco consciente — o jogador que opera em Entropia 5 sabe que uma falha pode ser devastadora.

---

## Descanso

- Ao descansar, a Entropia cai para **0**
- Todas as Marcas **não permanentes** somem
- Marcas permanentes permanecem na ficha para sempre
