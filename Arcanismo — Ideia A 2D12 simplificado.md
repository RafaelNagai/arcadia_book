# Arcanismo — Ideia A: 2D12 simplificado

> Direção escolhida. A magia é um teste de perícia comum (2D12 + bônus contra DT), com **uma** perícia arcana por magia. Este documento é a especificação do refactor: cada etapa fechada é aplicada aos capítulos.

## Etapas do refactor

- [x] 1. Núcleo do teste (Arcanismo e Conjuração): aplicado nos capítulos
- [x] 2. Entropia: aplicado no capítulo
- [x] 3. Afinidade e Antítese: aplicado no capítulo
- [x] 4. Exaustão global (Conflito e Intervenção): aplicado no capítulo
- [x] 5. Invocação: aplicado no capítulo
- [ ] 6. Itens arcanos (cajado e livro, cura mágica em Condições, PE de Arcano)
- [ ] 7. Varredura dos outros capítulos (Introdução, Perícias, Sanidade e Traumas, Interlúdio, Bestiário, Navios, Origem)

A ficha do personagem e o site ficam para depois do livro.

---

## O teste

```
Resultado = 2D12 (os 2 maiores) + Arcano + perícia + dado da Entropia − 10 × Exaustão
```

- Passou a DT: efeito = ⌊min(resultado, 2 × DT) ÷ 5⌋ pontos. Exemplo: DT 10 tem teto 20, ou seja, no máximo 4 pontos (4D12).
- O teto usa a DT do Mestre. A Exaustão nunca altera a DT.
- Crítico, Milagre (com evolução), Falha Crítica e Desastre valem só para os 2D12. O dado da Entropia apenas soma ao resultado.
- Um 1 natural nos dados usados anula os bônus (Arcano e perícia), mas **não** o dado da Entropia.
- Resistência do alvo: o Mestre sobe a DT. Não há teste extra.

## Perícias arcanas

Escolhe-se **uma**, pela pergunta ordenada:

| Pergunta | Perícia | A cada 5 pontos |
| --- | --- | --- |
| Tira Vida de alguém? | **Potência** | +1D12 de dano físico/material |
| Muda corpo, mente ou saúde de uma criatura (cura, condição, controle mental)? | **Complexidade** | +1 Vida ou +1 stack |
| Nenhuma das duas: age no mundo (cria, molda, move, ergue)? | **Controle** | Tabela de Grandeza; proteção abaixo |

Extras da magia (perseguir, precisão, área) **sobem a DT**, não trocam de perícia. As três evoluem pela regra comum de 12-12.

### Referências de DT (régua do draft B × 5)

| Magia | DT |
| --- | --- |
| Trocar a cor da roupa | 10 |
| Modificar a roupa; falar mentalmente com um aliado | 20 |
| Bola de fogo; falar mentalmente com quem não aceita | 25 |
| Domo sem gravidade | 35 |
| Meteoro; entrar na mente de uma cidade | 50 |

Resistência, ambiente hostil, pressão e ambição sobem a DT.

### Controle protetivo (muralha, armadura de rochas)

Cria um item temporário. Escolhe-se **um**:

- **Camada:** Durabilidade extra = ⌊min(resultado, 2 × DT) ÷ 5⌋.
- **Endurecer:** +1 DA fixo (não escala com a rolagem).

O tamanho vem da Tabela de Grandeza. Para durar, execução Concentrada.

## Entropia

- Níveis 0 a 4. Soma-se **um único** dado extra ao resultado de toda magia enquanto o nível estiver ativo, e o nível define qual: 1 = D4, 2 = D8, 3 = D12, 4 = D20. Os níveis não se acumulam. O nível 0 não tem dado.
- **Subir:** cada nível é uma Ação Simples, sem custo em Sanidade.
- **Descer não é escolha.** Só desce 1 nível por vez: em descanso longo (sem teste) ou com meditação. Meditar leva longas horas, é extremamente difícil e o Mestre só concede o teste se a situação e os antecedentes do personagem justificarem (Vontade ou outra perícia adequada, DT 20, 25, 30 ou 40 conforme o nível atual). Se falhar, nada muda.
- **Cada magia custa Sanidade = 1 + nível**: nível 0 custa 1, nível 4 custa 5.
- **Falha Crítica:** a catástrofe cresce com o nível.
  - Níveis 0 a 2: pequena, mas com efeito narrativo (cãibra nas mãos que impede de agir, atrai a atenção de inimigos próximos).
  - Nível 3: dano severo.
  - Nível 4: dano permanente. Não é só Vida: pode ser perder um braço, um debuff, algo que impacte o personagem.
- **Desastre:** o estrago em dobro. Afeta o conjurador e os aliados, ou afeta os aliados e beneficia os inimigos.
- Sem Marcas.

## Afinidade e Antítese

- **Antítese:** Desvantagem (remove 1 dado: 2D12 vira 1D12).
- **Afinidade:** normal (2D12).
- **Dupla Conexão:** Vantagem (3D12).
- **Talento:** soma mais 1 dado. Sempre contam os 2 maiores, quantos D12 forem rolados.

Números (bônus 10, Entropia 2, DT 25):

| Dados D12 | Passa | Falha Crítica | Milagre |
| --- | --- | --- | --- |
| Antítese (1D12) | 22% | 8% | 0% |
| Afinidade (2D12) | 65% | 16% | 0,7% |
| Dupla (3D12) | 87% | 2% | 1,9% |
| Talento + Dupla (4D12) | 94% | 0,2% | 3,7% |

## Exaustão (regra do Conflito, agora global)

- Lançar magia é Ação Complexa: +1 Exaustão. Subir a Entropia é Ação Simples (2 Ações Simples = 1 Exaustão).
- Cada ponto **tira 10 do resultado final**. A DT não muda. Além de reduzir a chance de passar, cada ponto tira 2 pontos de efeito.
- Vale para **todos**, no seu Ato ou fora dele (reações contam).
- Zera **no início do seu Ato**.
- Num Crítico ou Milagre a Exaustão não se aplica àquele teste (alinhado ao site). Numa Falha Crítica ou Desastre ela continua, e os bônus somem.
- Intervir é Ação: Complexa (esforço considerável) gera 1 Exaustão, Simples segue a regra de 2 por 1.

## Execução

Rápida como hoje. Concentrada mantém o teste de Vontade ao sofrer dano. Maldição passa a **+10 na DT**.

## O que sai

Marcas, tokens de Entropia, pool de 2D12 distribuída, Forma (vira ficção), várias perícias por magia, as tabelas de consequência por Entropia (substituídas pelos níveis acima), o teste de Vontade do alvo contra a magia.

## Números

Bônus 10, DT 25, 2D12:

| Entropia | Passa | Falha Crítica | Sanidade por 5 magias |
| --- | --- | --- | --- |
| 0 | 38% | 16% | 5 |
| 1 | 55% | 16% | 10 |
| 2 | 65% | 16% | 15 |
| 3 | 71% | 16% | 20 |
| 4 | 79% | 13% | 25 |

Com DT 21 a Falha Crítica do nível 4 cai para 10%. O teto 2 × DT só corta magia barata: com DT 10 o efeito médio cai de 5,1 para 3,8 pontos; de DT 21 para cima nada muda.

## Em aberto

- [x] 7. Varredura final dos capítulos: sem pendências (nenhum citava a mecânica antiga em detalhe). Site sincronizado (React/TypeScript): tipos, teste arcano, registro de rolagens, criador de personagem, widget de Afinidades. Pendente à parte: descida da Entropia no Dormir Profundo ainda não está no Intervalo de Capítulo (a ação Meditar fica de fora por ora).
- **Etapa 5:** características de cada invocação ficam a critério do Mestre na hora, sem lista própria (reaproveita o critério do Bestiário). Inteligência (0/1/2) é comprada com os próprios pontos de efeito, trocando porte por obediência.
- [x] 6. Itens arcanos: aplicado no catálogo
- [x] 7. Varredura final dos capítulos (sem pendências) e sincronização do site (React/TypeScript): aplicado

## Riscos

- A Falha Crítica ocorre em 16% das magias nos níveis 0 a 3 e em 13% no nível 4. Aceito: o nível 4 é a cartada, e Talento ou Dupla Conexão derrubam o risco.
- Custo de Sanidade: 5 magias custam 15 no nível 2 e 25 no nível 4, quase a barra inteira (23 a 31). Como a Entropia não desce por vontade, o nível 4 cobra 5 até em truque até o próximo descanso ou meditação (é o preço da cartada).
- Subir a Entropia no mesmo Ato da magia não compensa: 2 níveis são 2 Ações Simples, ou seja, 1 Exaustão (−10) para ganhar em média +4,5 (D8). Só vale preparar antes do Conflito ou gastar um Ato só nisso.
- O texto original chama a Dupla Conexão de "perigosa", mas a regra a deixa mais segura (bem menos Falha Crítica). Flavor e regra divergem.
- Talento + Dupla Conexão deixa o nível 4 quase sem risco (0,2%) e com Milagre 3,7%. Dois D6 iguais dão Dupla em 1 de cada 6 personagens.
- Exaustão global: quem age no próprio Ato reage mal (−10 no resultado por ponto), e a letalidade sobe para todo o jogo.
- O dano cresce +1D12 a cada +5 de bônus; só o teto 2 × DT segura as magias baratas.

---

## Exemplo prático (pronto para colar)

### Ideia A: 2D12 simplificado

**Em uma frase:** a magia é um teste de perícia comum (2D12 + bônus contra uma DT). Cada magia usa **uma** perícia arcana, escolhida pelo que ela produz. Fazer muita coisa de uma vez desgasta pela **Exaustão**, e abrir o Arcano mais fundo encarece cada magia em **Sanidade**.

**O básico**
- Todo teste é **2D12 + Atributo + Perícia** contra uma **DT** definida pelo Mestre (21 a 30 é o desafio padrão). Na magia, contam sempre os **dois maiores** D12 rolados.
- **Afinidade** joga 2D12. **Antítese** joga com Desvantagem (1D12). Quem tem as duas no mesmo elemento joga com Vantagem (3D12).
- **Entropia** vai de 0 a 4 e soma um dado ao resultado: D4, D8, D12 ou D20 (o nível 0 não tem dado). Subir um nível é uma Ação Simples. Cada magia custa **1 + nível de Sanidade**. Não desce por vontade: só com muita meditação ou calmaria, ou em descanso longo. Esse dado só soma: não conta para Crítico, Milagre nem Falha Crítica.
- Cada **Ação Complexa** (atacar, lançar magia) gera **+1 de Exaustão**, e 2 Ações Simples também geram 1. Cada ponto tira **10 do resultado** (a DT não muda) e zera quando o seu próximo Ato começa, valendo também para reações.
- **Efeito:** resultado ÷ 5, arredondado para baixo, mas o resultado usado nunca passa de 2 × DT.
- **DA** é o valor mínimo que um dado de dano precisa tirar para causar 1 de dano. **Durabilidade** é o que um item absorve antes de a Vida ser atingida.

**A personagem:** Lira, maga. Arcano 4. Potência 6 (bônus 10), Complexidade 3 (bônus 7), Controle 5 (bônus 9). Sem armadura (DA 1). Sanidade 29, Entropia 0. O bônus de cada perícia é Arcano + perícia.

**Como escolher a perícia** (o Mestre pergunta nesta ordem):
1. A magia tira Vida de alguém? **Potência** (a cada 5 pontos, +1D12 de dano).
2. Muda o corpo, a mente ou a saúde de uma criatura (cura, condição, controle mental)? **Complexidade** (a cada 5 pontos, +1 de Vida ou +1 stack de condição).
3. Nenhuma das duas, e age sobre o mundo (cria, molda, move, ergue)? **Controle**.

**Cena:** Lira e o guerreiro Doran enfrentam três piratas numa escada de um navio voador. É o Ato de Lira.

**Preparação:** no Ato anterior, Lira gastou duas Ações Simples subindo a Entropia do 0 ao 2 (uma por nível, sem custo em Sanidade). Elas geraram 1 de Exaustão, que zerou quando o Ato atual começou. Agora cada magia dela soma 1D8 e custa **3 de Sanidade** (1 + nível 2).

**Ação 1: a bola de fogo**
- Lira: "Quero uma bola de fogo que persiga os piratas na escada."
- Pergunta 1: tira Vida? Sim, então é **Potência**. "Perseguir" não troca de perícia: é ambição extra, e o Mestre sobe a DT. Bola de fogo em área é DT 25; perseguir os alvos leva a **DT 30**.
- Rolagem: 2D12 = [10, 8] = 18, mais 10 de bônus, mais o D8 da Entropia (tira 6) = **34**. Passou.
- Efeito: o teto é 2 × 30 = 60, então vale 34. 34 ÷ 5 = **6 pontos**, ou seja, **6D12 de dano** em cada pirata (cada dado que iguala ou passa a DA dele causa 1 de dano).
- É uma Ação Complexa: **Exaustão 1**. Sanidade: 29 para 26.

**Ação 2: a armadura de rochas**
- Lira: "Quero uma armadura de rochas envolvendo meu corpo."
- Pergunta 1: não tira Vida. Pergunta 2: não muda o corpo dela, é uma coisa nova por cima dele. Pergunta 3: cria matéria. É **Controle**. O Mestre define **DT 20**.
- Com **Exaustão 1**, ela perde 10 no resultado. Rolagem: 2D12 = [10, 9] = 19, mais 9 de bônus, mais o D8 (tira 5), menos 10 = **23**. Passou.
- Efeito: o teto é 40, então vale 23. 23 ÷ 5 = **4 pontos**. A magia cria um item temporário e Lira escolhe **um** de dois efeitos:
  - **Camada:** 4 pontos de Durabilidade extra, absorvidos antes da Vida.
  - **Endurecer:** +1 de DA fixo (de 1 para 2).
- Ela escolhe Camada, porque com DA 1 um +1 de DA quase não muda nada. A armadura dura enquanto ela mantiver a concentração.
- Segunda Ação Complexa: **Exaustão 2**. Sanidade: 26 para 23.

**Depois:** o Ato de Lira termina, mas a Exaustão continua em 2 até o começo do próximo Ato dela. Se um pirata atirar nela, qualquer teste de reação (esquivar, por exemplo) perde **20 no resultado**. Quem age muito no próprio Ato reage mal.

**O teto em ação:** com a mesma rolagem (34), uma faísca de DT 10 teria teto 20 e daria só 4 pontos, e não 6. Isso evita inflar o efeito de magias muito simples.

**Se desse errado:** se um dos 2D12 saísse 1 (acontece em cerca de 16% das magias), os bônus de Lira não somam, só o D8 da Entropia. O resultado fica baixo demais e a magia falha: é uma **Falha Crítica**. Na Entropia 2 a catástrofe é pequena, mas com efeito narrativo: uma cãibra nas mãos que a impede de agir, ou o clarão que chama a atenção de inimigos próximos. Na Entropia 3 seria dano severo, e na 4, dano permanente (perder um braço, por exemplo). Um Desastre (dois 1) dobra o estrago e pode atingir os aliados.

**Outras magias, mesma pergunta ordenada**
- "Quero fazer o guarda acreditar que o beco está vazio." Muda a mente de uma criatura: **Complexidade**.
- "Quero curar o corte de Doran." Cura: **Complexidade**.
- "Quero erguer uma ponte de gelo sobre o abismo." Cria e molda: **Controle**.

**O que a ideia quer:** uma rolagem, uma perícia, o Mestre só define a DT. O custo de fazer muito de uma vez vem da Exaustão que o resto do livro já usa, e o custo de ir além dos limites vem da Sanidade que cada magia gasta na Entropia alta.
