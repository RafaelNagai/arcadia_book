# Combate

> *No convés de um navio voador, não existem espectadores. Quem não luta, cai.*

---

## A Filosofia do Combate

O combate em Arcádia é **dinâmico e criativo**. Não existe uma lista restrita de ações possíveis — se você consegue justificar narrativamente o uso de uma perícia, você pode usá-la para atacar, defender ou mudar o rumo de uma batalha.

Um músico pode usar **Performance** para distrair um inimigo com um floreio de capa, abrindo sua guarda. Um explorador pode usar **Atletismo** para derrubar um oponente com o ombro. Um negociador pode usar **Dominação** para fazer um guarda hesitar antes de atacar.

A regra é simples: **a narração deve suportar a mecânica**.

### O Fluxo de um Turno

Em seu turno, você pode realizar **uma Ação**. Você também possui **Reações**, que podem ser gastas fora do seu turno para responder a ataques recebidos. A quantidade de Reações disponíveis é definida pelo Mestre conforme o contexto — tipicamente uma por rodada.

---

## Ações

### Ações Físicas

| Tipo de Ação | Custo | Perícia | Observações |
|---|---|---|---|
| **Ataque corpo-a-corpo** | 1 ação | Combate | Disputa contra a reação do alvo |
| **Ataque à distância** | 2 ações | Precisão | Disputa contra a reação do alvo |

### Ações Arcanas

| Tipo de Ação | Custo | Observações |
|---|---|---|
| **Rápida** | 1 ação ou 1 reação | Magia instantânea, se dissipa imediatamente |
| **Concentrada** | 2 ações | Persiste enquanto o conjurador mantiver foco |
| **Maldição** | 2 ações | Permanece em cena até ser dissipada |

> **Lembre-se:** Qualquer perícia pode ser usada para atacar ou realizar um feito em combate, desde que a narração justifique. Os tipos de ação acima representam os caminhos mais comuns — não os únicos.

---

## Reações e Defesa

Quando você é alvo de um ataque, pode gastar uma **Reação** para se defender. Se não tiver mais Reações disponíveis, você está **Indefeso** e o ataque é calculado contra sua **Defesa Passiva (DP)**.

Existem três formas de usar uma Reação:

---

### A. Esquiva

Você tenta evitar o golpe completamente. Pode usar qualquer perícia para esquivar, desde que explique como.

- **Mecânica:** Atacante e Defensor rolam suas perícias em disputa. Some os dados + Atributo + Perícia de cada lado.
- **Vitória do Defensor:** Nenhum dano é sofrido.
- **Empate:** O Atacante vence.
- **Vitória do Atacante:** O dano é calculado contra a **DP** do alvo.

> *Exemplo: Lyra usa Acrobacia para se jogar para o lado e deixar a lança passar por centímetros. O atacante rola Combate + Físico, Lyra rola Acrobacia + Destreza. Lyra vence — a lança rasga o ar.*

---

### B. Defesa

Você se prepara para o impacto. Não há disputa de dados — você confia na sua armadura.

- **Mecânica:** O Atacante rola seus dados de teste apenas para verificar críticos ou falhas. Em seguida, rola os **dados de dano** diretamente contra sua **Defesa Ativa (DA)**.
- **Quando usar:** Ideal quando sua DA é alta e você prefere não arriscar uma esquiva com dados ruins.

---

### C. Contra-Ataque

Você aceita o golpe para devolver outro imediatamente.

- **Mecânica:** Você realiza um ataque imediato contra quem te atacou, mas com **Desvantagem**.
- **Consequência:** Você sofre o dano do ataque original calculado na sua DP, sem direito a defesa. Simultaneamente, causa seu próprio dano — mas o alvo pode reagir normalmente a esse contra-ataque.
- **Acumulação:** As Desvantagens são acumulativas. Quando a Desvantagem reduzir seu pool a zero dados, não é possível continuar usando esta opção.

---

### Indefeso

Quando todas as Reações foram gastas, o personagem está **Indefeso**. Todo dano recebido é calculado contra a **Defesa Passiva (DP)**, sem direito a esquiva ou defesa ativa.

---

## DA e DP — O Limiar de Dano

O dano em Arcádia não funciona como uma subtração direta de pontos de vida. Ele funciona por **sucessos individuais** em cada dado de dano rolado.

### Defesa Ativa (DA)

A DA é o **valor mínimo** que um dado de dano precisa tirar para causar 1 ponto de dano.

- **Base:** Todo personagem começa com **DA 1** — sem armadura, qualquer resultado de dado causa dano.
- **Múltiplos itens defensivos:** Quando o personagem usa mais de um item defensivo simultaneamente (armadura, escudo, manto, capacete), vale sempre o **maior DA** entre eles. A exceção são itens cujo efeito especial descreve um bônus aditivo (ex: *"+2 DA"*) — nesses casos, o valor é somado ao DA mais alto. Itens que simplesmente definem um valor (ex: *"DA 4"*) não se acumulam entre si.
- **Durabilidade compartilhada:** Quando múltiplos itens estão equipados, **todos** têm sua Durabilidade consumida simultaneamente ao receber dano — independente de qual deles define o DA.

> *Exemplo: Se sua DA é 4 e o inimigo ataca com 6D6, cada dado que resultar em 4 ou mais causa 1 ponto de dano. Se o inimigo tirar [1, 3, 4, 5, 6, 2], os dados [4, 5, 6] passam — 3 pontos de dano.*

### Defesa Passiva (DP)

A DP é usada quando o personagem está Indefeso ou falhou na Esquiva.

> **Fórmula: DP = ⌊DA ÷ 2⌋** *(metade da DA, arredondado para baixo)*

| DA | DP |
|---|---|
| 1 | 0 |
| 2 | 1 |
| 3 | 1 |
| 4 | 2 |
| 5 | 2 |
| 6 | 3 |
| 7 | 3 |

> **Nota:** DA 1 (sem armadura) resulta em DP 0 — qualquer dado de dano causa ferimento. Isso é intencional: um personagem sem proteção é extremamente vulnerável quando Indefeso.

---

## Durabilidade e Equipamento em Combate

O equipamento protege a vida do personagem — mas ele sofre o castigo no lugar dele. **O dano sempre atinge a Durabilidade do item antes de atingir a Vida.**

- **Absorção:** Cada ponto de dano recebido reduz a Durabilidade do item equipado em 1.
- **Quebra:** Quando a Durabilidade chega a 0, o item perde todas as suas propriedades. Cada ponto de dano adicional passa direto para a Vida do personagem.
- **Sacrifício Voluntário:** O personagem pode optar por "não usar" o equipamento num golpe específico para preservá-lo. Nesse caso, perde todos os bônus de DA e efeitos do item naquele ataque.

---

## Críticos e Falhas em Combate

Os resultados especiais dos dados (definidos no capítulo de Evolução e Testes) têm efeitos diretos sobre o dano em combate.

### Multiplicador de Dano por Críticos

O dano crítico é **acumulativo** — cada 12 natural nos Dados Usados soma ao multiplicador:

| Origem | Multiplicador |
|---|---|
| 1 crítico (1 dado = 12) | ×2 |
| 2 críticos (2 dados = 12) | ×3 |
| 3 críticos (acumulado entre atacante e falhas do defensor) | ×4 |

### Falha Crítica do Defensor

Quando o defensor tira 1 natural num dado usado **e** falha na disputa, ele contribui com +1 ao multiplicador do atacante.

> *Exemplo: O atacante tira 12 (×2). O defensor tira 1 natural e falha. O multiplicador sobe para ×3.*

### Anulação

Se numa mesma rolagem de múltiplos dados surgirem **12 e 1** no mesmo pool, eles **se anulam entre si**. Após anular, some normalmente os dados restantes e os bônus.

---

## Tiers de Equipamento

Todo item em Arcádia possui um **Tier** — uma classificação que define sua raridade, qualidade e poder.

### O Que é Tier?

| Tier | Definição |
|---|---|
| **SS** | Único. Conhecido por lendas — poucos sabem se realmente existe. |
| **S** | Raro. Existem poucos exemplares semelhantes no mundo. |
| **A** | Reforjado. Feito com materiais excelentes. |
| **B** | Melhorado. Feito com bons materiais. |
| **C** | Normal. Materiais comuns. |
| **D** | Simples. Materiais de segunda mão. |
| **E** | Improvisado. Feito com sucata. |

### Requisito de Nível

O **nível** de um personagem é a **soma total de todos os pontos distribuídos em suas 16 perícias**. Ele cresce naturalmente com o jogo — cada evolução orgânica de uma perícia aumenta o nível em 1.

Cada Tier exige um nível mínimo para ser usado sem penalidade. Usar um item acima do seu nível é possível, mas cada Tier de diferença aplica **-2 de Desvantagem** em todos os testes relacionados ao item.

| Tier | Nível Mínimo |
|---|---|
| SS | 30 |
| S | 20 |
| A | 14 |
| B | 10 |
| C | 6 |
| D | 3 |
| E | 1 |

> *Exemplo: Um personagem com 5 pontos distribuídos nas perícias (nível 5) usando uma espada Tier A (nível mínimo 14) tem 2 Tiers de diferença — sofre -4 em todos os testes de Combate com ela.*

---

### Tabelas de Dano por Tier

> **Nota:** O dado D20 não aparece em armas individuais — está reservado para armamentos de grande escala instalados em navios (ver capítulo de Navios).

**Armamentos Corpo-a-Corpo:**

| Arma | SS | S | A | B | C | D | E |
|---|---|---|---|---|---|---|---|
| Espada | D10 | D10 | D10 | D8 | D8 | D6 | D6 |
| Adaga | D10 | D10 | D10 | D8 | D8 | D6 | D6 |
| Machado | D12 | D12 | D12 | D10 | D10 | D8 | D8 |
| Lança | D12 | D12 | D12 | D10 | D10 | D8 | D8 |

**Armamentos Longa-Distância:**

| Arma | SS | S | A | B | C | D | E |
|---|---|---|---|---|---|---|---|
| Revólver | 1D12 | 1D10 | 1D8 | 1D8 | 1D6 | 1D6 | 1D4 |
| Rifle | 2D10 | 1D12 | 1D10 | 1D10 | 1D6 | 1D6 | 1D4 |
| Arco | 1D12 | 1D12 | 1D10 | 1D10 | 1D6 | 1D6 | 1D4 |
| Munição | 1D10 | 1D8 | 1D8 | 1D6 | 1D6 | 1D4 | 1D4 |
| Flecha | 1D10 | 1D8 | 1D8 | 1D6 | 1D6 | 1D4 | 1D4 |

**Armamentos Arcanos** *(bônus ao teste arcano ou buff):*

| Item | SS | S | A | B | C | D | E |
|---|---|---|---|---|---|---|---|
| Cajado | +5 | +4 | +3 | +2 | +2 | +1 | +1 |
| Livro | +5 | +4 | +3 | +2 | +2 | +1 | +1 |

---

### Tabelas de DA e Durabilidade por Tier

**Equipamentos Defensivos — DA:**

| Item | SS | S | A | B | C | D | E |
|---|---|---|---|---|---|---|---|
| Armadura | 7 | 6 | 5 | 4 | 3 | 2 | 2 |
| Escudo | 6 | 5 | 4 | 3 | 3 | 2 | 1 |
| Capacete | 5 | 4 | 3 | 2 | 2 | 1 | 1 |
| Manto | 4 | 3 | 2 | 2 | 1 | 1 | 1 |

**Equipamentos Defensivos — Durabilidade:**

| Item | SS | S | A | B | C | D | E |
|---|---|---|---|---|---|---|---|
| Armadura | 7 | 6 | 5 | 4 | 4 | 3 | 3 |
| Escudo | 8 | 7 | 6 | 5 | 5 | 4 | 4 |
| Manto | 3 | 3 | 2 | 2 | 1 | 1 | 1 |
| Capacete | 5 | 4 | 3 | 2 | 2 | 1 | 1 |

---

### Efeitos Especiais por Tier

Itens de Tier C em diante podem carregar **Efeitos Especiais** — propriedades únicas que os diferenciam de um item comum do mesmo tipo.

| Tier | Nível do Efeito | Quantidade |
|---|---|---|
| E, D | — | Nenhum |
| C | Pequeno | 1 efeito |
| B | Médio | 1 efeito |
| A | Alto | 2 efeitos |
| S | Altíssimo | 3 efeitos |
| SS | Altíssimo | 4 efeitos |

Os efeitos podem ser qualquer coisa narrativamente coerente: bônus situacionais em testes, resistências elementais, dano extra, penalidades ao inimigo. A imaginação é o limite — desde que o Tier suporte a magnitude do efeito.

---

### Criando um Item (Guia para o Mestre)

> **Atenção:** Esta seção é um guia para o Mestre criar e distribuir itens. Personagens que desejam **forjar** um item devem fazê-lo durante um **Interlúdio** — ver capítulo correspondente.

Para criar um item, siga estas etapas:

1. **Escolha o Tipo:** Corpo-a-Corpo, Longa-Distância, Munição ou Equipamento (armadura, artefato, utilitário).
2. **Defina o Tier:** De E (improvisado) a SS (lendário). O Tier determina o poder base e os efeitos possíveis.
3. **Aplique Efeitos Especiais:** Conforme a tabela acima. Podem ser buffs, debuffs ou qualquer propriedade que faça sentido narrativo.
4. **Defina a Durabilidade:** Use as tabelas como referência — o Mestre pode ajustar para cima ou para baixo conforme o contexto da recompensa.
5. **Defina o Peso:** Use a tabela abaixo para consistência de inventário.
6. **Dê nome e descrição:** Um item com história é memorável. Um item com apenas números é descartável.

**Tabela de Pesos:**

| Categoria | Valor | Exemplo |
|---|---|---|
| Nulo | 0 | Uma folha de papel |
| Super Leve | 1 | Um broche ou anel |
| Leve | 2 | Uma adaga |
| Médio | 4 | Espada curta |
| Pesado | 8 | Machado, escudo grande |
| Super Pesado | 16 | Armadura completa |
| Massivo | 32 | Barril de cerveja |
| Hyper Massivo | 64 | Veículo pequeno |

**Exemplo completo:**

> **Espada da Vigília**
> *Tipo:* Corpo-a-Corpo | *Tier:* B | *Nível mínimo:* 10
> *Dano:* D8 | *Durabilidade:* 4 | *Peso:* 4 (Médio)
> *Efeito:* +2 em testes de Combate enquanto houver um escudo no inventário.
> *"Forjada pelos cavaleiros de Camelot, esta espada brilha suavemente quando o perigo se aproxima."*

---

## Exemplo Ilustrado: O Convés dos Piratas

> **Situação:** Kael e Mira enfrentam dois piratas no convés de um navio durante uma tormenta.

**Kael** possui um peitoral de ferro arcano (Armadura Tier B, DA 4, Durabilidade 4). Sua DP é 2.

**Turno 1 — O Ataque do Primeiro Pirata:**
O pirata ataca Kael com um mosquete Tier C (Dano: 2D6). Kael já gastou sua Reação no turno anterior — está **Indefeso**.

O pirata rola os dados de dano: **[1, 4, 5]**. Como Kael está Indefeso, usamos a DP 2.
- Dados ≥ 2: **[4, 5]** → 2 pontos de dano.
- A Durabilidade do peitoral absorve: 4 → **2 restantes**.
- Vida de Kael: intacta.

**Turno 2 — Mira tenta o Contra-Ataque:**
Um segundo pirata ataca Mira. Ela escolhe **Contra-Ataque** — aceita o golpe e devolve imediatamente com Desvantagem.

- O dano do pirata é calculado na DP de Mira.
- Mira ataca de volta com Desvantagem: rola 1D12 em vez de 2D12 e soma seus bônus.
- O pirata pode reagir ao contra-ataque de Mira normalmente.

**Turno 3 — O Peitoral de Kael Quebra:**
Outro pirata ataca Kael com uma adaga Tier C (2D6). Com a Durabilidade do peitoral em 2, o pirata tira **[3, 5]**.

- Ambos os dados passam a DP 2: 2 pontos de dano.
- A Durabilidade do peitoral vai de 2 para 0 — **o item quebra**.
- Kael recebe os 2 pontos diretamente na Vida. **Vida de Kael: 8/10.**
- O peitoral perde todas as propriedades: DA volta para a base 1.
