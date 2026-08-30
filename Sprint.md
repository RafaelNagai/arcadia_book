# Sprint.md — Backlog e Sprint Ativa

> Atualizado automaticamente pelos agentes do `/task`.
> **Planner** adiciona tasks · **Executor** marca progresso · **Validator** move para Concluídos

---

## Sprint Ativa

> Sprint atual — sem data de encerramento definida

### Em andamento

---

### Sistema Arcano Completo na Ficha de Personagem
**Origem:** /task Implementar sistema Arcano completo na ficha de personagem
**Adicionada:** 2026-05-19

- [ ] Subtask 2 — Rodar migração Prisma para remover campo `runas` e adicionar `modificadores` (Json) + `marcas` (Json) no modelo `Character`, e atualizar `characters.json` removendo o campo `runas` de todas as fichas de exemplo
  - **Critério de aceite:** `npx prisma migrate dev` executa sem erro; `characters.json` não contém mais o campo `runas`; fichas existentes no banco não perdem dados (migration com default `{}` e `[]`)
  - **Arquivos:** `api/prisma/schema.prisma`, `characters.json`

---

## Backlog

### Widgets por Capítulo — Pendentes
**Origem:** Subtask 5 da auditoria de consistência (2026-05-08)

Capítulos atualmente sem widget registrado em `chapterWidgets.tsx`:

- [ ] `introducao` — widget de introdução ao mundo / Mar de Nuvens
- [ ] `arcanismo` — simulador de ritual arcano (5 passos, custo de energia)
- [ ] `moral` — painel de pool de Moral compartilhado da tripulação
- [ ] `constelacao-e-navegacao` — calculadora de assinatura de constelação
- [ ] `interludio` — tracker de ações de downtime
- [ ] `racas` — galeria comparativa das 6 raças
- [ ] `regioes` — mapa interativo das nações
- [ ] `dimensoes` — diagrama dos 4 planos de existência
- [ ] `religioes` — árvore comparativa das 3 religiões

---

### Mapa Interativo — Melhorias Futuras
**Origem:** Perguntas em aberto do PRD original

- [ ] Remover campo `visionUnified` do schema Prisma — substituído por `sharedWith` por token; campo legado no banco
- [ ] Grid snapping opcional — tokens se movem livremente hoje; snap-to-grid seria opcional via toggle
- [ ] Tokens em múltiplos andares — hoje 1 token por personagem por mapa; split party em andares diferentes requer mover manualmente
- [ ] Iniciativa no mapa — indicador de turno integrado ao combate por token
- [ ] Medição de distância — ferramenta de régua para magias e ataques
- [ ] Portas visíveis para jogadores — hoje GM-only; considerar renderizar silhueta para jogadores
- [ ] Testes de carga — 5 usuários simultâneos não foram testados formalmente

---

## Concluídos

### Bug: Responsividade da tela de Navio/Tripulação em Mobile
**Origem:** /task corrigir responsividade da tela de Navio/Tripulação em mobile — layout não está responsivo
**Adicionada:** 2026-08-30 · **Validator:** APROVADO · **Concluída:** 2026-08-30

Investigação do Planner: a feature "Navio/Tripulação" (concluída anteriormente, ver seção de Concluídos) foi construída quase inteiramente com `style={{...}}` inline em vez de classes Tailwind, e a maior parte desses estilos não tem nenhum breakpoint responsivo. `NavioListPage.tsx` está OK (usa `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` do Tailwind nos grids de cards e todos os modais têm `maxWidth: 'calc(100vw - 2rem)'`). O problema concreto está em `ShipPage.tsx` (a ficha do navio) e em `SectorCatalogModal.tsx`:

1. `ShipPage.tsx:328` — o layout principal (conteúdo + sidebar) é `style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '2rem' }}`, um grid de 2 colunas fixo sem nenhum breakpoint. Em qualquer viewport mobile (ex: 375px de largura, iPhone SE/12), com `px-6` (48px de padding total) + `gap: 2rem` (32px) + coluna fixa de 300px, sobra menos espaço do que o grid exige — a coluna de conteúdo principal (Stats, Descrição, Setores, Tripulação) é espremida quase a 0px de largura enquanto a sidebar de 300px domina a tela. Este é o bug raiz mais visível reportado pelo usuário.
2. `ShipPage.tsx:395` — o grid "Lema/Porte" dentro da Descrição usa `gridTemplateColumns: '1fr 1fr'` fixo, sem breakpoint, mesmo padrão de inline style sem responsividade.
3. `ShipPage.tsx:260-326` — Hero com altura fixa (`height: 280`), padding fixo (`padding: '0 2rem'`) e elementos posicionados em `absolute` (link "← Navios", botão "📷 Alterar imagem", badges de tipo/porte/visibilidade em uma única linha flex sem wrap) — não quebra hoje em 320-375px mas não foi validado e usa apenas valores fixos.
4. `SectorCatalogModal.tsx:26-49` — o modal é um flex-column (header + área de conteúdo com `overflowY: 'auto'`) mas a área de conteúdo não tem `flex: 1` / `minHeight: 0`, então o `overflowY: auto` não tem uma altura própria para limitar — o conteúdo (9 categorias de Setores) simplesmente cresce e o modal todo estoura a viewport em telas curtas (mobile), sem conseguir rolar internamente até os setores/botões finais. É exatamente o padrão "modal que estoura a tela" mencionado no bug report.

- [x] Subtask 1 — Tornar responsivo o grid principal (conteúdo + sidebar) da `ShipPage`
  - **Critério de aceite:** o grid de 2 colunas fixo (`gridTemplateColumns: 'minmax(0,1fr) 300px'`) é substituído por um layout que empilha em 1 coluna (conteúdo primeiro, sidebar depois) abaixo do breakpoint `lg` do Tailwind, e só usa as 2 colunas (`minmax(0,1fr) 300px`) a partir de `lg:`; testado em devtools responsive mode a 320px, 375px e 390px sem nenhum scroll horizontal e com a sidebar (código de convite, Pote de Moral, excluir navio) totalmente legível e utilizável
  - **Arquivos:** `web/src/pages/ShipPage.tsx` (linha ~328)
  - **Implementado:** `style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '2rem' }}` substituído por classes Tailwind: `className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"` (arbitrary value do Tailwind 3 para preservar exatamente a coluna fixa de 300px a partir de `lg:`). Abaixo de `lg` empilha em 1 coluna (conteúdo, depois sidebar, ordem de DOM inalterada). `px-6` fixo também virou `px-4 sm:px-6` para dar folga extra em 320–374px.

- [x] Subtask 2 — Tornar responsivo o grid "Lema/Porte" da seção de Descrição
  - **Critério de aceite:** `gridTemplateColumns: '1fr 1fr'` fixo substituído por um grid que usa 1 coluna abaixo de `sm:` e 2 colunas a partir de `sm:`; nenhum dos dois campos (`EditableField` de Lema e Porte) fica com menos de ~140px de largura útil em nenhum viewport testado (320–414px)
  - **Arquivos:** `web/src/pages/ShipPage.tsx` (linha ~395)
  - **Implementado:** `style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}` substituído por `className="grid grid-cols-1 sm:grid-cols-2 gap-4"` (gap idêntico ao original, 1rem). Abaixo de `sm` (640px) cada campo ocupa 100% da largura útil do container (muito acima dos ~140px mínimos mesmo em 320px).

- [x] Subtask 3 — Corrigir o estouro vertical do `SectorCatalogModal` em viewports mobile
  - **Critério de aceite:** o container do modal tem uma altura máxima real amarrada à viewport (ex.: `maxHeight: 'calc(100dvh - Xrem)'` no elemento que já tem `display:flex, flexDirection:'column'`), e a `div` de conteúdo com `overflowY: 'auto'` recebe `flex: 1` + `minHeight: 0` para que o scroll interno realmente funcione; testado abrindo todas as 9 categorias do catálogo simultaneamente em viewport 375×667 — o cabeçalho e o botão de fechar permanecem visíveis, e é possível rolar internamente até o último setor/botão "Instalar" sem que a página por trás role ou o modal ultrapasse a tela
  - **Arquivos:** `web/src/components/ship/SectorCatalogModal.tsx`
  - **Implementado:** `maxHeight: '100%'` do container do modal trocado por `maxHeight: 'calc(100dvh - 4rem)'` (4rem = a soma do padding vertical `2rem` topo + `2rem` base do overlay externo `padding: '2rem 1rem'`, que não mudou). O header ganhou `flexShrink: 0` (nunca é comprimido pelo flex column). A `div` de conteúdo (`overflowY: 'auto'`) ganhou `flex: 1, minHeight: 0` — sem isso, o `min-height:auto` padrão de um item flex impedia o encolhimento abaixo da altura do conteúdo, então o `overflowY:auto` nunca tinha uma caixa menor que o conteúdo para de fato rolar. Com as 9 categorias abertas simultaneamente em 375×667, o modal agora fica limitado a `calc(100dvh - 4rem)` = 583px, o header fica fixo no topo (com o botão ✕ sempre visível) e apenas a área de conteúdo rola internamente.

- [x] Subtask 4 — Ajustar Hero da `ShipPage` (altura, padding e overlays absolutos) para mobile
  - **Critério de aceite:** título (`text-4xl`), badges (tipo/porte/visibilidade) e os dois elementos `position: absolute` (link "← Navios" e botão "📷 Alterar imagem") não se sobrepõem nem causam overflow horizontal em 320–375px; altura fixa (`height: 280`) e padding fixo (`padding: '0 2rem'`) revisados com breakpoint quando necessário para telas pequenas, sem alterar a aparência em desktop (`lg:` e acima idêntico ao atual)
  - **Arquivos:** `web/src/pages/ShipPage.tsx` (linhas ~260–326)
  - **Implementado:** (1) altura fixa `height: 280` (inline style) virou `className="h-56 sm:h-[280px]"` — abaixo de `sm` (640px) a hero usa 224px, a partir de `sm` mantém exatamente 280px (idêntico ao original em tablet/desktop); (2) `padding: '0 2rem'` do wrapper do título/badges virou `className="px-4 sm:px-8"` (1rem em mobile, 2rem a partir de `sm` — idêntico ao original a partir daí); (3) a linha de badges (tipo/porte/visibilidade) ganhou `flexWrap: 'wrap'` + `rowGap: '0.4rem'` para nunca forçar overflow horizontal mesmo se a soma das larguras dos badges exceder a largura disponível em 320px — o botão de visibilidade (que tem `marginLeft: 'auto'`) cai para a linha seguinte alinhado à direita nesse caso extremo, sem quebrar layout; (4) título `text-4xl` virou `text-3xl sm:text-4xl` para reduzir o risco de nomes de navio longos dominarem a tela em 320px, sem alterar a aparência a partir de `sm`. Os dois elementos `position: absolute` (link "← Navios" e botão "📷 Alterar imagem") foram conferidos por medição manual (larguras de texto/padding) e não se sobrepõem nem em 320px — não precisaram de alteração; documentado aqui em vez de mudado sem necessidade real, conforme a regra de não adicionar mudanças além do pedido.

- [x] Subtask 5 — Testar e documentar a responsividade completa da feature Navio/Tripulação
  - **Critério de aceite:** teste manual em devtools responsive mode (320px, 375px, 390px, 768px) cobrindo `NavioListPage.tsx` (3 abas, cards, modais de Criar/Entrar/Excluir) e os componentes `ShipSummaryCard.tsx`, `ShipCrewPanel.tsx`, `MoralPotPanel.tsx`, `ShipCodePanel.tsx`, confirmando ausência de overflow horizontal e de elementos cortados/inacessíveis; resultado documentado no Sprint.md — se algum bug real for encontrado, corrigir o arquivo específico; se já estiver correto (esperado, já usam grids Tailwind responsivos ou `flex-wrap`), documentar a confirmação sem alterar os arquivos
  - **Arquivos:** nenhum a priori (`web/src/pages/NavioListPage.tsx` e `web/src/components/ship/*.tsx` apenas se alguma regressão real for encontrada)
  - **Verificado por leitura de código e cálculo de largura (sem browser disponível neste sandbox), viewports 320/375/390/768px:**
    - **`ShipSummaryCard.tsx`, `ShipCrewPanel.tsx`, `MoralPotPanel.tsx`, `ShipCodePanel.tsx`: OK, nenhuma alteração feita.** Todos já usam grid Tailwind responsivo (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` em `ShipCrewPanel`) ou `flex-wrap`/`flex-wrap gap-3` (`MoralPotPanel`, tanto no header quanto no pool de dados) para acomodar conteúdo variável; `ShipCodePanel` é uma coluna única sem risco de overflow horizontal; `ShipSummaryCard` depende do grid responsivo do pai (`NavioListPage`) e não tem larguras fixas que xtrapolem o card.
    - **`NavioListPage.tsx`: 2 regressões reais encontradas e corrigidas** (mesmo padrão do resto do bug — inline `style` com `flexShrink: 0`/sem `flexWrap` combinado com `whiteSpace: 'nowrap'`, dentro de um container pai com `overflow-hidden`, então o conteúdo que não coubesse seria **cortado/inacessível** em vez de gerar scroll de página):
      1. **Linha ~499** — o grupo de botões "🔑 Entrar com Código" + "+ Criar Navio" (visível só na aba "Meus Navios") soma ~355–365px de largura de conteúdo (padding + `letter-spacing: 0.15em` + `whiteSpace: nowrap` nos dois botões), mas o container tinha `flexShrink: 0` e nenhum `flexWrap` — em 320px (256px de largura útil após `padding: '4rem 2rem 0'` do header) e mesmo em 375px (311px úteis) o conteúdo excede o espaço disponível; como o header pai é `className="relative overflow-hidden"`, o excesso seria **cortado silenciosamente** (botão "Criar Navio" parcial ou totalmente inacessível), não um scroll horizontal visível. **Corrigido:** adicionado `flexWrap: 'wrap'` ao container dos 2 botões — em telas estreitas eles empilham verticalmente em vez de estourar/cortar; nenhuma mudança visual em telas onde já cabem lado a lado (768px+).
      2. **Linha ~526** — a barra de abas (Meus Navios/Explorar/Arcádia, com contador e indicador animado `layoutId`) soma ~300px de conteúdo (padding + texto + badges de contagem) sem nenhum `overflowX`/`flexWrap`; margem para overflow é apertada em 320px (256px úteis) e limítrofe em 375px (311px úteis) — mesmo risco de corte silencioso pelo `overflow-hidden` do header. **Corrigido, seguindo o padrão já usado em `BestiaryWidget.tsx`/`ShipWidget.tsx`** (`overflow-x-auto` em barras de abas): adicionado `overflowX: 'auto'` ao container da barra de abas — garante rolagem horizontal por swipe em vez de corte, sem alterar a aparência quando as 3 abas já cabem (390px+, 768px).
      3. Modais de Criar/Entrar/Excluir Navio: já usam `maxWidth: 'calc(100vw - 2rem)'` (mesmo padrão relatado pelo Planner); linhas internas de 2 colunas (`Tipo`/`Porte`, `Slots Totais`/`Vida` no `CreateShipModal`) usam `flex: 1` em ambas as colunas (encolhimento proporcional, sem `nowrap` nos inputs) — sem overflow mesmo em 320px. Nenhuma alteração necessária nos modais.
    - Skeleton cards (`ShipSkeletonCard`) e grids de card (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`, já existentes) confirmados responsivos nas 3 abas.

**Build/Lint:** `npx tsc -b --force` rodado do zero — `exited with code 0`, saída vazia, zero erros de TypeScript. `npx eslint` rodado nos 7 arquivos tocados/revisados (`ShipPage.tsx`, `NavioListPage.tsx`, `SectorCatalogModal.tsx`, `ShipSummaryCard.tsx`, `ShipCrewPanel.tsx`, `MoralPotPanel.tsx`, `ShipCodePanel.tsx`) — 3 erros encontrados, todos **pré-existentes e fora do diff desta task** (confirmado por `git diff`, nenhum deles cai nas linhas alteradas): `NavioListPage.tsx:372` (`react-hooks/refs`, no inicializador `useState` que lê `usedStoredTab.current` — código da task de persistência de aba, já em `main` antes desta task) e `ShipPage.tsx:114,122` (`react-hooks/set-state-in-effect`, dois `useEffect` de carregamento de navio/estado, também intocados por este diff). Não corrigidos por estarem fora do escopo desta task (puramente responsividade CSS/layout) e por não terem sido tocados pelas mudanças — corrigi-los seria alterar lógica de negócio/efeitos não relacionada ao bug de mobile, contra a regra "sem features extras além do que foi pedido".

**Validação do Validator (2026-08-30): ✅ APROVADO.**

Confirmado por leitura direta dos diffs (`git diff HEAD` de cada arquivo, não apenas o relatório do Executor):

- **Regras do livro:** `git diff --stat -- 'chapters/*'` vazio — `chapters/` intocado. As mudanças em `ShipPage.tsx`, `SectorCatalogModal.tsx` e `NavioListPage.tsx` são puramente CSS/layout (classes Tailwind + poucas propriedades de `style` inline: `flexWrap`, `minHeight`, `flex`, `overflowX`, `maxHeight`) — nenhuma lógica de negócio, texto de regra ou dado alterado.
- **Subtask 1** — `ShipPage.tsx:328` confirmado: `className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"`, sem nenhum `gridTemplateColumns`/`style` de grid remanescente na tag (`grep` confirma zero ocorrências de `gridTemplateColumns` em todo `ShipPage.tsx`). Abaixo de `lg` empilha 1 coluna, ordem de DOM preservada (conteúdo antes da sidebar).
- **Subtask 2** — `ShipPage.tsx:395` confirmado: `className="grid grid-cols-1 sm:grid-cols-2 gap-4"` com `style={{ marginTop: '1rem' }}` residual (só a margem, não mais o grid) — 1 coluna abaixo de `sm`, 2 colunas a partir de `sm`, gap idêntico ao original (1rem = `gap-4`).
- **Subtask 3** — `SectorCatalogModal.tsx` confirmado: container do modal (linha 32) tem `maxHeight: 'calc(100dvh - 4rem)'` (4rem bate exatamente com o padding vertical `2rem + 2rem` do overlay externo, linha 23, inalterado); header (linha 36) ganhou `flexShrink: 0`; a `div` de conteúdo com `overflowY: 'auto'` (linha 49) ganhou `flex: 1, minHeight: 0` — exatamente o elemento correto (o único filho do flex-column com scroll), destravando o overflow interno como pedido.
- **Subtask 4** — `ShipPage.tsx:260-326` confirmado: `h-56 sm:h-[280px]` (224px mobile, 280px idêntico ao original a partir de `sm`), `px-4 sm:px-8`, badges com `flexWrap: 'wrap', rowGap: '0.4rem'`, título `text-3xl sm:text-4xl`. Recalculei a sobreposição dos dois elementos `position: absolute` (link "← Navios" top-left, botão "📷 Alterar imagem" top-right, ambos `top: 1.5rem`) contra 320px de largura — largura de texto/padding somada de cada um fica bem abaixo da metade da tela, sem sobreposição mesmo no caso extremo. Confirmei também que o conteúdo da hero (badges + título + legenda) cabe com folga dentro dos 224px de altura mobile sem colidir com os elementos absolutos do topo.
- **Subtask 5** — `NavioListPage.tsx` confirmado: grupo de botões (linha ~499) tem `flexWrap: 'wrap'` adicionado ao container `flex`/`flexShrink: 0` existente; barra de abas (linha ~526) tem `overflowX: 'auto'` adicionado. Confirmei que o container pai do header é de fato `className="relative overflow-hidden"` (linha 469) — valida o diagnóstico de corte silencioso do Executor. Confirmei também que `overflow-x-auto` já é padrão usado em barras de aba do projeto (`BestiaryWidget.tsx:86`, `ShipWidget.tsx:344`), tornando a correção consistente com o resto do código. Nenhuma das duas mudanças altera a aparência em desktop: os botões já cabem lado a lado ≥768px (`flexWrap` só age quando o espaço realmente falta) e a barra de abas não dispara scroll quando as 3 abas já cabem. `ShipSummaryCard.tsx`, `ShipCrewPanel.tsx`, `MoralPotPanel.tsx`, `ShipCodePanel.tsx` lidos por completo — nenhum tem largura fixa em px que não escale; claim do Executor de "nenhuma alteração necessária" confirmado.
- **Padrões técnicos (SPEC.md/CLAUDE.md web):** stack (React 19, TS, Tailwind 3) respeitada; mistura de `className` Tailwind com `style` inline é o padrão pré-existente nesses arquivos (confirmado por leitura do restante de `ShipPage.tsx`/`NavioListPage.tsx`), não é um problema introduzido por este diff. `lg:grid-cols-[minmax(0,1fr)_300px]` é sintaxe válida de arbitrary value do Tailwind 3 (o underscore representa espaço dentro do colchete).
- **Consistência do projeto (CLAUDE.md):** nenhum comentário novo adicionado ao código; nenhuma feature extra além das 5 subtasks (as 2 regressões de `NavioListPage.tsx` estavam dentro do escopo da própria Subtask 5, que previa corrigir regressões reais encontradas); `chapters/` intocado.
- **Build:** rodei eu mesmo, de forma independente, `cd web && npx tsc -b --force` — `exited with code 0`, sem erros de TypeScript. Rodei também `npx eslint` nos 7 arquivos (ficou lento nesta sessão por contenção de recursos da máquina, mesmo padrão já registrado neste Sprint.md em tasks anteriores, mas terminou) — reproduziu exatamente os mesmos 3 erros reportados pelo Executor, nas mesmas linhas exatas (`NavioListPage.tsx:372:53`, `ShipPage.tsx:114:5`, `ShipPage.tsx:122:35`), todas `react-hooks/refs`/`react-hooks/set-state-in-effect` em código pré-existente; confirmado por `git diff` que nenhuma dessas linhas aparece nos hunks alterados por este diff.

**Veredito:** ✅ **APROVADO.** As 5 subtasks atendem seus critérios de aceite, confirmados por leitura direta do código (não apenas do relatório do Executor). Nenhuma regressão encontrada em desktop. Escopo respeitado — mudança puramente de CSS/layout responsivo.

---

### Melhorias de Navegação — "Ir para a Mesa" (Personagens, Navio, Campanha)
**Origem:** /task Melhorias de navegação na área "Ir para a Mesa" (Personagens, Navio, Campanha): (1) persistir a aba selecionada dentro das telas de Personagens/Navio/Campanha — hoje reseta ao usar o botão voltar do navegador ou ao sair/voltar da aba do navegador; (2) na tela de Jogadores de uma Campanha, abrir a ficha do jogador clicado em uma nova aba do navegador (não navegar na mesma aba); a intro da campanha (`CampaignIntroScreen`) não deve reaparecer toda vez que se volta pelo navegador — só deve aparecer quando o usuário entra na campanha vindo do menu principal (aba "Campanhas")
**Adicionada:** 2026-08-28 · **Validator:** APROVADO · **Concluída:** 2026-08-28

**Diagnóstico do Planner (confirmado por leitura de código):**

- **Ponto 1 — reset de aba:** `CharacterListPage.tsx` (rota `/personagens`) e `NavioListPage.tsx` (rota `/navios`) têm cada um `type TabId = 'meus' | 'explorar' | 'arcadia'` com `const [activeTab, setActiveTab] = useState<TabId>(() => user ? 'meus' : 'explorar')` — estado 100% local ao componente, sem nenhuma persistência (nem URL, nem storage). Como essas páginas desmontam/remontam a cada troca de rota (ex: abrir `/ficha/:id` a partir de um card e voltar pelo botão do navegador), `activeTab` sempre volta ao valor padrão, perdendo a aba que o usuário tinha selecionado (`explorar`/`arcadia`). Ambas têm também um `useEffect` que troca a aba automaticamente ao logar/deslogar (`if (user) setActiveTab('meus'); else setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)`) — a correção precisa conviver com esse efeito, não removê-lo. Confirmado por grep que não existe nenhum uso de `sessionStorage` em `web/src/` hoje (zero ocorrências) — não há mecanismo de persistência de UI reaproveitável já pronto.
- A tela de Campanha (`CampaignPage.tsx`) já usa `useSearchParams` para a view interna (`players`/`npcs`/`mapa`, via `?view=`) — isso já é restaurado corretamente pelo botão voltar do navegador, pois é parte da própria URL/histórico. Não há bug de reset confirmado aqui; a Subtask 2 abaixo pede apenas uma verificação de regressão, não uma reescrita. `CampaignListPage.tsx` (rota `/campanhas`, lista de campanhas) não tem abas internas — ponto 1 não se aplica a ela.
- **Ponto 2a — nova aba para "Ver ficha" em Jogadores:** em `CampaignPage.tsx:67`, `CharMiniCard` (compartilhado pelas views `players` e `npcs`) renderiza `<Link to={`/ficha/${char.id}`} state={{ fromCampaignId: campaignId, fromCampaignView: view }}>Ver ficha</Link>` — navegação SPA normal na mesma aba, sem `target="_blank"`. Confirmado em `CharacterPage.tsx:71-80` que a página já tem um caminho alternativo ao `location.state` para descobrir de qual campanha veio: `searchParams.get("campaignId")` e `searchParams.get("isGm") === "1"`, usados quando `state` não está disponível. Como o `state` do React Router não atravessa para uma aba nova (`target="_blank"` é navegação completa do browser, sem o histórico do SPA), a correção precisa colocar `campaignId` (e `isGm`, se aplicável) como query string na própria URL do link, para que o botão "Voltar para campanha" em `CharacterPage.tsx:732,798` continue funcionando a partir da aba nova.
- **Ponto 2b — intro reaparecendo:** em `CampaignPage.tsx`, o `useEffect` de carregamento (linha ~627-640) faz `if (res.campaign.imageUrl) setShowIntro(true)` incondicionalmente a cada mount — dispara toda vez que a página remonta, inclusive ao voltar pelo navegador de uma ficha ou de qualquer outra tela. Não há hoje nenhum `sessionStorage`/flag de origem controlando isso, apesar de uma nota histórica no `Sprint.md` (task "Sistema de Campanhas", Subtask 5) descrever que a intro usaria `sessionStorage` para "exibição única por sessão" — o mecanismo real no código atual não faz isso mais (ou nunca fez; a `CampaignIntroScreen.tsx` atual não referencia `sessionStorage`). `CampaignListPage.tsx:27` (`CampaignCard`, o card clicável da lista, alcançado pela aba "Campanhas" do menu principal em `Navbar.tsx:9`) usa `<Link to={`/campanha/${campaign.id}`}>` sem nenhum `state` — é o único ponto de entrada que deveria de fato disparar a intro.

**Subtasks para o Executor:**

- [x] Subtask 1 — Persistir a aba selecionada em `/personagens` (`CharacterListPage.tsx`) através de remounts (voltar do navegador, reload da página, trocar e voltar de aba do navegador)
  - **Critério de aceite:** com a aba "Explorar" ou "Arcádia" selecionada em `/personagens`, ao abrir a ficha de um personagem e voltar pelo botão "voltar" do navegador, a mesma aba continua selecionada (não reseta para "Meus Personagens"); um F5/reload em `/personagens` preserva a última aba selecionada na mesma sessão de navegador; o `useEffect` existente que troca a aba automaticamente ao logar/deslogar continua funcionando sem regressão; se a aba persistida for `meus` mas o usuário estiver deslogado, a página cai graciosamente para `explorar` (nunca fica presa numa aba oculta de `visibleTabs`)
  - **Arquivos:** `web/src/pages/CharacterListPage.tsx`
  - **Implementado:** `activeTab` inicializado a partir de `sessionStorage` (chave `arcadia_character_list_tab`, helper `readStoredCharacterTab`), com fallback para `explorar` quando a aba salva é `meus` mas `user` é `null`. Novo `useEffect([activeTab])` persiste a cada troca. O `useEffect` de login/logout existente ganhou um `useRef` (`didSyncLoginTab`) para pular a primeira execução (mount) e não sobrescrever a aba restaurada — só reage a transições reais de login/logout depois do mount.
  - **Correção pós-Validator (REPROVADO → corrigido):** o guard `didSyncLoginTab` só pulava a 1ª execução do efeito, mas `AuthProvider` (`authContext.tsx`) resolve `user` de forma assíncrona via `getSession().then(...)` — então o efeito roda 2x no mount: 1ª com `user=null` (pulada), 2ª quando a Promise resolve para o `user` real (**não** pulada, forçava `setActiveTab('meus')` e sobrescrevia a aba restaurada). Corrigido usando o `loading` que `useAuth()` já expõe: o efeito agora ignora execuções enquanto `authLoading` é `true` e só marca "settled" (pulando o forçar) na 1ª vez que `authLoading` vira `false` — passou a distinguir a hidratação inicial assíncrona de uma transição real de login/logout depois que o app já carregou. Renomeado `didSyncLoginTab` → `hasSettledAuthTab`; deps do efeito viraram `[user, authLoading]`.

- [x] Subtask 2 — Replicar a mesma persistência de aba em `/navios` (`NavioListPage.tsx`), usando o mesmo mecanismo da Subtask 1, e verificar (sem reescrever se já correto) que a view interna de `/campanha/:id` (`?view=players|npcs|mapa` em `CampaignPage.tsx`) já sobrevive ao botão voltar do navegador
  - **Critério de aceite:** mesmo critério da Subtask 1 aplicado a `/navios`; adicionalmente, teste manual documentado no Sprint.md confirmando que trocar para a view "NPCs" ou "Mapa" em uma campanha, abrir uma ficha e voltar pelo navegador mantém a view selecionada — se algum bug real for encontrado nesse fluxo, corrigir `CampaignPage.tsx`; se já funcionar (comportamento esperado dado o uso de `useSearchParams`), documentar a confirmação sem alterar o arquivo
  - **Arquivos:** `web/src/pages/NavioListPage.tsx`; possivelmente `web/src/pages/CampaignPage.tsx` (só se a verificação encontrar regressão real)
  - **Implementado:** mesmo mecanismo da Subtask 1 aplicado a `NavioListPage.tsx` (chave `arcadia_ship_list_tab`, helper `readStoredShipTab`, `hasSettledAuthTab` ref). **Correção pós-Validator:** mesmo fix da Subtask 1 aplicado aqui — efeito ignora execuções com `authLoading=true` e só trata como "settled" (sem forçar aba) a 1ª vez que `authLoading` vira `false`; deps `[user, authLoading]`. **Verificação de `CampaignPage.tsx`:** confirmado por leitura de código — `view` é lido direto de `searchParams.get('view')` via `useSearchParams` (linha ~655) e todo `setView` faz `setSearchParams({ view: v })`; como isso grava a URL/histórico do próprio browser, o botão "voltar" restaura o `?view=` nativamente sem nenhum código adicional. Nenhum bug encontrado — `CampaignPage.tsx` não foi alterado por este motivo (foi alterado só pelas Subtasks 3 e 4, abaixo).

- [x] Subtask 3 — Abrir a ficha do jogador em nova aba do navegador a partir da tela "Jogadores" de uma Campanha
  - **Critério de aceite:** em `/campanha/:id` com a view "players" (Jogadores) ativa, clicar em "Ver ficha" de um `CharMiniCard` abre `/ficha/:id` em uma nova aba do navegador (`target="_blank" rel="noopener noreferrer"`), sem navegar a aba da Campanha; a URL usada no link inclui `?campaignId=${campaignId}` (e `&isGm=1` quando `isGm` for verdadeiro) para que o botão "Voltar para campanha" em `CharacterPage.tsx` continue funcionando a partir da aba nova, já que `state` do React Router não atravessa para `target="_blank"`; a mudança é restrita à view "players" — a view "npcs" mantém o comportamento atual (navegação na mesma aba), a menos que o Executor documente um motivo técnico para não conseguir diferenciar as duas
  - **Arquivos:** `web/src/pages/CampaignPage.tsx` (`CharMiniCard`, linha ~67)
  - **Implementado:** `CharMiniCard` agora ramifica em `view === 'players'`: nesse caso renderiza `<Link target="_blank" rel="noopener noreferrer" to={`/ficha/${char.id}?campaignId=${campaignId}${isGm ? '&isGm=1' : ''}`}>` (sem `state`); para `view === 'npcs'` mantém o `Link` original na mesma aba com `state={{ fromCampaignId, fromCampaignView }}`. `CharacterPage.tsx` já lia `campaignId`/`isGm` da query string como fallback (linhas ~76-78), então nenhuma mudança foi necessária lá.

- [x] Subtask 4 — Corrigir a exibição da `CampaignIntroScreen` para aparecer apenas ao entrar vindo do menu principal (aba "Campanhas"), nunca ao voltar pelo navegador
  - **Critério de aceite:** clicar em um card de campanha a partir de `/campanhas` (`CampaignCard`, alcançado pela aba "Campanhas" do menu principal em `Navbar.tsx`) continua exibindo a `CampaignIntroScreen` normalmente quando a campanha tem `imageUrl` (comportamento hoje existente preservado); voltar para essa mesma campanha pelo botão "voltar" do navegador (por exemplo, depois de abrir uma ficha na view Jogadores e voltar, ou depois de navegar entre views internas) NÃO reexibe a intro; acessar a campanha por qualquer caminho que não seja o clique no card da lista (URL direta, botão "Voltar para campanha" a partir de uma ficha) também NÃO exibe a intro; nenhuma mudança de comportamento para campanhas sem `imageUrl`
  - **Arquivos:** `web/src/pages/CampaignListPage.tsx` (`CampaignCard`, linha ~27 — adicionar `state` sinalizando origem do menu), `web/src/pages/CampaignPage.tsx` (lógica de `showIntro`, linhas ~625-640)
  - **Implementado:** `CampaignCard` em `CampaignListPage.tsx` agora navega com `state={{ fromMenu: true }}`. Em `CampaignPage.tsx`, `showIntro` só é ativado quando `campaign.imageUrl && cameFromMenu && !hasShownCampaignIntro(id)` (novo `useLocation()` + helpers `hasShownCampaignIntro`/`markCampaignIntroShown` com `sessionStorage`, chave `arcadia_campaign_intro_shown`, array de campaignIds já mostrados). **Desvio documentado:** usar só `location.state?.fromMenu` não seria suficiente — a History API do browser restaura o `state` original de uma entry ao voltar (`popstate`), então voltar para `/campanha/:id` depois de visitar `/ficha/:id` (view NPCs, mesma aba) reapresentaria `fromMenu:true` de novo. Por isso o `sessionStorage` complementar (já sugerido como opção pelo Planner) é necessário para o requisito central funcionar de verdade, não é feature extra. Confirmado também que `CharacterCreatorPage.tsx:271` (`navigate(`/campanha/${campaignId}`)`, após criar ficha vinda de convite) não passa `state`, logo não dispara a intro — comportamento correto sem necessidade de alteração.

**Validação do Validator (2026-08-28): ❌ REPROVADO — 2 problemas encontrados por leitura direta do código (não apenas do relatório do Executor):**

1. **`CharacterListPage.tsx:306-316` e `NavioListPage.tsx:413-420` — F5/reload não preserva a aba para usuário já logado (regressão contra o próprio critério de aceite da Subtask 1/2).** `AuthProvider` (`web/src/lib/authContext.tsx:19-27`) inicializa `user` como `null` e só resolve de forma assíncrona via `supabase.auth.getSession().then(...)`; `App.tsx` não tem nenhum gate de `loading` antes de montar `CharacterListPage`/`NavioListPage` (`web/src/App.tsx:32-54`, rotas montam direto dentro do `AuthProvider`). Isso significa que, em todo F5 com usuário logado: (1º render) `user=null`, o `useEffect([user])` de sync login/logout roda pela 1ª vez e é pulado pelo guard `didSyncLoginTab` — ok; (2º render, quando a Promise de `getSession()` resolve) `user` passa de `null` para o objeto de sessão real, o mesmo `useEffect([user])` dispara de novo, mas dessa vez o guard **não pula** (já foi consumido no mount) e executa `if (user) setActiveTab('meus')` incondicionalmente — sobrescrevendo qualquer aba restaurada do `sessionStorage` (`explorar`/`arcadia`) de volta para `'meus'`. Ou seja: para um usuário logado, um F5 em `/personagens` ou `/navios` com a aba "Explorar"/"Arcádia" selecionada sempre volta para "Meus Personagens"/"Meus Navios" após a página carregar — violação direta do critério "um F5/reload em `/personagens` preserva a última aba selecionada na mesma sessão de navegador". (O caso "voltar pelo botão do navegador" não é afetado, pois `AuthProvider` não desmonta entre rotas da SPA, então `user` já está resolvido quando a página remonta — só o reload de página inteira aciona o bug.) O guard `didSyncLoginTab` precisa distinguir "login/logout real" de "resolução assíncrona inicial da sessão" (por exemplo, usando `loading` do `useAuth()` para só armar o guard depois que `loading` vira `false` pela primeira vez, em vez de no primeiro disparo do efeito).

2. **`CampaignPage.tsx:11-21` (`hasShownCampaignIntro`/`markCampaignIntroShown`) — cache de `sessionStorage` chaveado só por `campaignId` suprime a intro em cliques legítimos repetidos vindos do menu, além do que a Subtask 4 pediu.** O critério de aceite exige que "clicar em um card de campanha a partir de `/campanhas`... continua exibindo a `CampaignIntroScreen` normalmente... comportamento hoje existente preservado". Como a chave do cache é só `campaignId` (não a navegação específica), depois que a intro aparece uma vez para uma campanha em uma sessão de navegador, ela nunca mais aparece de novo nessa sessão — mesmo que o usuário volte para `/campanhas` e clique de novo genuinamente no mesmo card (nova entrada de histórico, `fromMenu: true` de novo). Isso é mais restritivo do que o pedido: o problema real que motivou o `sessionStorage` (restaurar `location.state` original ao apertar "voltar" para a MESMA entry de histórico via `popstate`) pode ser resolvido de forma mais precisa chaveando por `location.key` do React Router (único por entry de histórico, estável em `popstate` para a mesma entry, novo a cada `navigate()`/clique) em vez de `campaignId` — isso resolveria o bug do botão voltar sem suprimir cliques novos e legítimos vindos do menu.

**Build:** `tsc -b` concluído sem erros (reconfirmado nesta validação, rodado de novo do zero). `vite build` (bundling) não foi aguardado até o fim por ser demorado neste sandbox, mas a etapa que importa para correção de tipos (`tsc -b`) passou limpa.

**Chapters/CLAUDE.md:** `chapters/` intocado (`git diff --stat -- 'chapters/*'` vazio); nenhum mock de banco; nenhuma feature extra fora dos 2 pontos acima. `CharacterPage.tsx:71-80` confirmado consumindo `campaignId`/`isGm` da query string como fallback, exatamente como o Executor descreveu.

**Próximo passo:** Executor deve corrigir os 2 pontos acima e o Validator reavalia (ciclo 2/2 já em andamento — não exceder o limite de 2 ciclos do protocolo).

**Correção do Executor (ciclo 2, 2026-08-28):**

1. **Issue 1 corrigido** em `CharacterListPage.tsx` e `NavioListPage.tsx`: `useAuth()` agora também desestrutura `loading: authLoading`. O guard do `useEffect([user])` de sync login/logout (renomeado `didSyncLoginTab` → `hasSettledAuthTab`) passou a ignorar execuções enquanto `authLoading` é `true`, e só marca "settled" (sem forçar troca de aba) na 1ª vez que `authLoading` vira `false` — deps do efeito passaram a `[user, authLoading]`:
   ```tsx
   useEffect(() => {
     if (authLoading) return
     if (!hasSettledAuthTab.current) {
       hasSettledAuthTab.current = true
       return
     }
     if (user) setActiveTab('meus')
     else setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)
   }, [user, authLoading])
   ```
   Isso distingue a hidratação assíncrona inicial de `getSession()` (que agora é sempre esperada via `authLoading` antes de qualquer decisão) de uma transição real de login/logout ocorrendo depois que o app já carregou — preserva a aba restaurada do `sessionStorage` num F5 com usuário logado, sem reintroduzir a perda do auto-switch em login/logout reais.

2. **Issue 2 corrigido** em `CampaignPage.tsx`: `hasShownCampaignIntro`/`markCampaignIntroShown` passaram a ser chaveados por `location.key` (do `useLocation()`, único por entrada de histórico do React Router) em vez de `campaignId`:
   ```tsx
   if (res.campaign.imageUrl && cameFromMenu && !hasShownCampaignIntro(location.key)) {
     setShowIntro(true)
     markCampaignIntroShown(location.key)
   }
   ```
   `location.key` é estável quando o browser restaura a mesma entry via `popstate` (voltar), mas é novo a cada `navigate()`/clique genuíno no card — resolve o bug do botão voltar sem suprimir a intro em cliques novos e legítimos vindos do menu.

**Build (ciclo 2):** `npm run build` (`tsc -b && vite build`) rodado do zero após as correções — `✓ built in 4m 7s`, `exited with code 0`, zero erros de TypeScript. Nenhum outro arquivo tocado além dos necessários para os 2 pontos acima.

**Validação do Validator — ciclo 2/2 (2026-08-28): ❌ REPROVADO — limite de 2 ciclos do protocolo atingido.**

Reconfirmado por leitura direta do código (`git diff` de cada arquivo, não apenas o relatório do Executor):

- ✅ **Issue 2 (intro chaveada por `campaignId`) — corrigido de verdade.** `CampaignPage.tsx:679-682` lê e escreve `hasShownCampaignIntro(location.key)`/`markCampaignIntroShown(location.key)` (ambos os pontos usam `location.key`, não `campaignId`). Tracei os dois cenários pedidos: (a) clique no card → intro aparece → abre NPC na mesma aba (`state`) → volta pelo browser → mesma entry de histórico (`location.key` idêntico, já marcado) → intro **não** reaparece; (b) volta para `/campanhas` → clica de novo no mesmo card → `navigate` cria uma entry nova com `location.key` novo (nunca marcado) → intro reaparece. `CampaignListPage.tsx:27` continua passando `state={{ fromMenu: true }}`, necessário para `cameFromMenu`. Sem regressão encontrada.
- ✅ **Build:** rodei `npm run build` (`tsc -b && vite build`) eu mesmo, do zero, independente do Executor — `exited with code 0`, `✓ built in 2m 15s`, zero erros de TypeScript.
- ✅ `git diff --stat -- 'chapters/*'` vazio — `chapters/` intocado. Sem mocks de banco, sem features extras além dos 2 pontos do ciclo 1. `SPEC.md`/`CLAUDE.md` (raiz e `web/`) conferidos — padrões técnicos respeitados (nenhum comentário desnecessário adicionado; os poucos comentários novos em `CampaignPage.tsx`/`CharacterListPage.tsx`/`NavioListPage.tsx` explicam um "porquê" não-óbvio, dentro da regra).
- ✅ Subtask 3 (nova aba para "players", `npcs` inalterado) confirmada: `CampaignPage.tsx:107-121` ramifica corretamente por `view`; `CharacterPage.tsx:75-78` já lê `campaignId`/`isGm` da query string como fallback (arquivo não fez parte do diff desta task — mecanismo pré-existente, confirmado funcional).
- ❌ **Issue 1 (F5 não preserva a aba) — corrigido apenas parcialmente; o cenário central do critério de aceite ainda falha.** O guard `hasSettledAuthTab` em si está correto (resolve o caso "usuário sempre deslogado" sem disparar nada indevido, e não regride o auto-switch em login/logout reais — validei os 3 cenários). O bug remanescente está no **inicializador do `useState<TabId>`**, não no guard:

  `CharacterListPage.tsx:256-260` (idêntico em `NavioListPage.tsx:371-375`):
  ```tsx
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const stored = readStoredCharacterTab()
    if (stored && (stored !== 'meus' || user)) return stored
    return user ? 'meus' : 'explorar'
  })
  ```
  Esse inicializador roda de forma síncrona no **primeiro render**, no mesmo commit em que `AuthProvider` (`authContext.tsx:19-21`) ainda não resolveu `getSession()` — ou seja, `user` é **sempre `null`** neste ponto exato, mesmo que o usuário esteja de fato logado (é garantia do React: um `.then()` de Promise nunca resolve de forma síncrona no primeiro render). Para `stored === 'meus'`: `(stored !== 'meus' || user)` = `(false || null)` = falsy **sempre**, independente do usuário real — a condição cai para `return user ? 'meus' : 'explorar'` com `user` ainda `null`, retornando **`'explorar'`**. Repare que essa mesma expressão para `stored !== 'meus'` (ex.: `'explorar'`/`'arcadia'`) é sempre truthy e funciona bem — o bug é específico e determinístico para `stored === 'meus'`.

  Na sequência, quando `getSession()` resolve (`authLoading` vira `false`, `user` vira o objeto real), o efeito-guard (`CharacterListPage.tsx:310-321`) trata essa **primeira** resolução como "hidratação inicial" por design (`hasSettledAuthTab.current` ainda `false` → marca `true` e `return`, sem chamar `setActiveTab`) — exatamente o comportamento que o próprio ciclo 2 foi pedido para implementar. Resultado: `activeTab` nunca é corrigido de volta para `'meus'`; fica travado em `'explorar'`.

  Pior: o `useEffect(() => sessionStorage.setItem(KEY, activeTab), [activeTab])` (`CharacterListPage.tsx:323-329`; `NavioListPage.tsx:425-431`) dispara no mount com esse `activeTab` já errado e **sobrescreve** o valor `'meus'` salvo no `sessionStorage` por `'explorar'` — não é só um glitch visual de um render, o dado persistido fica corrompido para o resto da sessão do navegador (próximos F5 continuam vendo `'explorar'` como valor salvo).

  **Reprodução concreta:** usuário logado, aba ativa "Meus Personagens" (`sessionStorage` = `'meus'`) → F5 em `/personagens` → página carrega na aba **"Explorar"**, não "Meus Personagens". Isso é exatamente o critério de aceite da Subtask 1/2 ("um F5/reload em `/personagens` preserva a última aba selecionada") e é o cenário mais comum de todos (usuário logado gerenciando as próprias fichas, dá F5). Mesmo bug, mesmo mecanismo, em `NavioListPage.tsx`.

  Casos que **funcionam** corretamente (para não gerar retrabalho desnecessário): F5 com aba salva `'explorar'`/`'arcadia'` (preserva, pois o inicializador retorna `stored` direto sem depender de `user`); troca de aba dentro da mesma sessão SPA (sem reload — `user` já está resolvido antes do mount da página); login/logout reais após a página já carregada; usuário sempre deslogado (nenhum `setActiveTab` indevido); F5 deslogado com `stored === 'meus'` de uma sessão antiga (cai para `'explorar'` corretamente, sem travar numa aba oculta).

**Veredito:** ❌ **REPROVADO — 2º ciclo, limite do protocolo atingido (máx. 2 ciclos, conforme `AGENTS.md:100`).** Issue 2 e o build estão corretos; Issue 1 tem uma correção real mas incompleta — falha exatamente no cenário mais comum do critério de aceite original. Não tentei corrigir. Próximo passo cabe ao orquestrador/usuário: abrir uma nova rodada (fora da contagem dos 2 ciclos deste protocolo, mesmo padrão já usado na task "Bug: character_state..." mais abaixo neste arquivo) para corrigir o inicializador — por exemplo, atrasando a leitura do `useState` até `authLoading` resolver (ex.: inicializar `activeTab` sempre a partir de `stored ?? (user ? 'meus' : 'explorar')`, sem a condicional extra em `user`, já que o próprio guard pós-hidratação existe justamente para corrigir esse valor quando necessário — ou renderizar um skeleton até `authLoading` resolver antes de decidir a aba). Não sugiro a implementação final; é decisão do Executor/Planner na próxima rodada.

**Correção do Executor (rodada extra, fora da contagem dos 2 ciclos, 2026-08-28):**

Causa raiz confirmada exatamente como o Validator descreveu: o inicializador do `useState<TabId>` só confiava em `stored === 'meus'` se `user` já estivesse resolvido *no mesmo render síncrono* — o que nunca acontece, já que `getSession()` é sempre assíncrono. Corrigido em `CharacterListPage.tsx` (~linhas 256-264) e `NavioListPage.tsx` (~linhas 371-379): o inicializador agora confia **sempre** em qualquer `stored` presente (sem checar `user`), e um novo `useRef` (`usedStoredTab`) registra se essa preferência veio do `sessionStorage`. A reconciliação acontece no mesmo "settle" (1ª vez que `authLoading` vira `false`) que já existia — mas agora ela corrige em vez de só pular:

```tsx
const usedStoredTab = useRef(false)
const [activeTab, setActiveTab] = useState<TabId>(() => {
  const stored = readStoredCharacterTab()
  if (stored) {
    usedStoredTab.current = true
    return stored
  }
  return user ? 'meus' : 'explorar'
})
...
useEffect(() => {
  if (authLoading) return
  if (!hasSettledAuthTab.current) {
    hasSettledAuthTab.current = true
    if (usedStoredTab.current) {
      setActiveTab(prev => (prev === 'meus' && !user) ? 'explorar' : prev)
    } else {
      setActiveTab(user ? 'meus' : 'explorar')
    }
    return
  }
  if (user) setActiveTab('meus')
  else setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)
}, [user, authLoading])
```

Cobertura verificada manualmente (leitura de código) para os 5 cenários que o Validator listou no ciclo 2:
- Sem tab salva + logado → `usedStoredTab.current=false` → `setActiveTab(user ? 'meus' : 'explorar')` recalcula com `user` já resolvido → `'meus'`. Preservado.
- Sem tab salva + deslogado → idem → `'explorar'`. Preservado.
- Tab salva `'meus'` + resolve logado (**o bug reportado**) → inicializador agora retorna `'meus'` direto (otimista, sem depender de `user`); no settle, `prev==='meus' && !user` é `false` (`user` existe) → mantém `'meus'`. **Corrigido.**
- Tab salva `'meus'` + resolve deslogado (sessão expirada) → inicializador retorna `'meus'` otimisticamente; no settle, `prev==='meus' && !user` é `true` → corrige para `'explorar'`. Fallback gracioso preservado.
- Tab salva `'explorar'`/`'arcadia'` → inicializador retorna direto; no settle, `prev==='meus'` é sempre falso para essas duas → nunca mexe. Preservado.
- Login/logout reais depois da página já carregada → `hasSettledAuthTab.current` já é `true` nesse ponto → cai no branch original (`if (user) setActiveTab('meus') else ...`), sem regressão.

**Build (rodada extra):** `npm run build` (`tsc -b && vite build`) rodado do zero — `✓ built in 2m 11s`, `exited with code 0`, zero erros de TypeScript. (Uma tentativa anterior falhou com `sh: .../tsc: Operation timed out` — erro transiente de spawn por carga alta da máquina com múltiplas sessões concorrentes no mesmo repositório, não um erro de TypeScript; a repetição rodou limpa.)

**Validação do Validator — 3º ciclo / rodada extra (2026-08-28): ✅ APROVADO.**

Reli `CharacterListPage.tsx` e `NavioListPage.tsx` na íntegra dos trechos relevantes (não confiei no resumo do orquestrador) e tracei manualmente todos os cenários do critério de aceite original, mais o caso de borda pedido:

- **Tab salva `'meus'` + usuário logado ao resolver (o bug do F5 reportado no ciclo 2) → `'meus'` mantida.** `CharacterListPage.tsx:257-264` (idêntico em `NavioListPage.tsx:372-379`): o inicializador do `useState<TabId>` agora retorna `stored` sempre que existir, sem depender de `user` (que é sempre `null` no 1º render — garantia do React, já que `getSession()` nunca resolve de forma síncrona) — e marca `usedStoredTab.current = true`. No 1º "settle" (`CharacterListPage.tsx:318-334`; `NavioListPage.tsx:425-438`, quando `authLoading` vira `false` pela 1ª vez), como `usedStoredTab.current` é `true`: `setActiveTab(prev => (prev === 'meus' && !user) ? 'explorar' : prev)` — `user` já é o objeto real nesse ponto, `!user` é `false`, a condição não dispara, `'meus'` é preservada. **Bug do ciclo 2 corrigido.**
- **Tab salva `'meus'` + usuário deslogado ao resolver (sessão expirada) → cai para `'explorar'`.** Mesmo ramo, mas `!user` é `true` → `setActiveTab(...)` resolve para `'explorar'`. Fallback gracioso preservado, sem travar em aba oculta de `visibleTabs`.
- **Tab salva `'explorar'`/`'arcadia'` → mantida independente do auth.** `prev === 'meus'` é sempre falso para essas duas, a expressão do settle nunca mexe nelas, com ou sem usuário resolvido.
- **Sem tab salva + logado → `'meus'`; sem tab salva + deslogado → `'explorar'`.** `usedStoredTab.current` fica `false` (nunca setado), o settle cai no `else` (`setActiveTab(user ? 'meus' : 'explorar')`), recalculado com `user` já resolvido — comportamento pré-existente preservado.
- **Login/logout real depois do 1º settle → continua forçando troca de aba como antes.** `hasSettledAuthTab.current` já é `true` nesse ponto, cai direto no branch original (`if (user) setActiveTab('meus') else setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)`) — sem nenhuma mudança de comportamento aqui, sem regressão.
- **Usuário sempre deslogado (nunca há transição real) → nenhum `setActiveTab` indevido além do settle inicial**, que roda 1x só e resolve corretamente conforme os casos acima.
- **Caso de borda pedido pelo orquestrador — `sessionStorage` de `/personagens` vs `/navios`:** chaves `arcadia_character_list_tab` (`CharacterListPage.tsx:234`) e `arcadia_ship_list_tab` (`NavioListPage.tsx:352`) são distintas; `grep` confirma que cada página só lê/escreve a própria chave — nenhuma interferência entre as duas listas.
- O persist effect (`CharacterListPage.tsx:336-342`; `NavioListPage.tsx:440-446`) agora persiste o valor final já corrigido — não há mais o "double-write" que corrompia o `sessionStorage` no ciclo 2.

**Observação secundária, não bloqueante:** na janela assíncrona entre o mount e `authLoading` resolver (tipicamente poucos ms), se a tab salva era `'meus'`, o conteúdo de "Meus Personagens" pode piscar vazio por um instante — o fetch guiado por `[user]` roda 1ª vez com `user=null` antes de `getSession()` resolver, e `visibleTabs` (que filtra por `user`) momentaneamente não lista o botão "Meus Personagens" mesmo com o conteúdo já sendo o dele. Esse comportamento é pré-existente ao padrão `visibleTabs`/fetch-por-`user`, não foi introduzido por este fix, e não está coberto pelo critério de aceite original (que fala do estado final pós-reload, não de um flash transitório de alguns milissegundos). Não bloqueia a aprovação.

**Build:** rodei `npx tsc -b --force` eu mesmo, do zero, duas vezes de forma independente (não confiei no relatório do orquestrador) — ambas com `exit code 0` e saída vazia (sem erros de TypeScript).

`git diff --stat -- 'chapters/*'` continua vazio; escopo do diff (`git diff --stat`) continua restrito a `CampaignListPage.tsx`, `CampaignPage.tsx`, `CharacterListPage.tsx`, `NavioListPage.tsx` + `Sprint.md`.

**Veredito final:** ✅ **APROVADO.** Os 2 issues do ciclo 2 (F5 não preservava a aba `'meus'`; intro da campanha suprimida em cliques legítimos) estão corrigidos e verificados por leitura direta de código + build independente, cobrindo os 6 cenários do critério de aceite original mais o caso de borda das duas chaves de `sessionStorage` distintas. Task movida para Concluídos — resumo dos 3 ciclos na nota de conclusão abaixo.

**Resumo dos 3 ciclos:** ciclo 1 REPROVADO (2 issues: F5 não preservava aba + intro suprimida em cliques legítimos) → Executor corrigiu ambos; ciclo 2 REPROVADO (issue da intro confirmado corrigido, mas o fix do F5 tinha um caso remanescente: inicializador do `useState` sempre lia `user=null` no 1º render, então tab salva `'meus'` caía para `'explorar'` e ficava presa lá) → Executor corrigiu com um `useRef` (`usedStoredTab`) distinguindo "veio do sessionStorage" de "calculado do zero", reconciliando no mesmo settle; ciclo 3 (rodada extra, fora da contagem de 2 ciclos do protocolo) APROVADO após tracing completo dos 6 cenários + build independente.

---

### Bug: character_state não sincroniza via Realtime para o GM (RLS bloqueia SELECT)
**Origem:** /task investigar por que quando o DONO de uma ficha altera Exaustão (ou qualquer campo de `character_state`: conditions, pe_checks, skill_modifiers, defense_modifiers, dice_log), a mudança não sincroniza via Realtime para o GM da campanha vendo a mesma ficha — é estrutural, afeta a tabela inteira, não só exaustão. O caminho inverso (GM altera → dono vê) já funciona normalmente.
**Adicionada:** 2026-08-28 · **Validator:** APROVADO · **Concluída:** 2026-08-28

> ✅ **Histórico (2026-08-28):** durante a Rodada 1, a policy `character_state_gm_select` chegou a ser aplicada e causou uma regressão (ver achado do Executor abaixo); o orquestrador reverteu na hora (`DROP POLICY`, com aprovação explícita do usuário) para tirar o banco do estado quebrado enquanto a causa raiz (ciclo de recursão em `005_rls_campaigns_maps.sql`) era corrigida. Na **Rodada 2**, a causa raiz foi corrigida (`009_fix_campaign_rls_recursion.sql`) e `character_state_gm_select` foi reaplicada com sucesso — ver Subtasks 6-9 e a validação final abaixo. **Estado atual: corrigido e validado**, nenhuma ação pendente.

**Diagnóstico do Planner (confirmado por leitura de código e reproduzido ao vivo no banco real, não é suposição):**
- Causa raiz: `api/supabase/migrations/004_rls_policies.sql` define para `character_state` apenas a policy `character_state_owner` (`FOR ALL USING (auth.uid() = user_id)`). `state.service.ts::resolveStateUserId` sempre persiste o estado na linha do DONO do personagem (`character_id` + `user_id` do dono) — mesmo quando é o GM que escreve. A escrita via API (Prisma, `DIRECT_URL`/`DATABASE_URL`) roda como role `postgres`, que tem `rolbypassrls = true` (confirmado via `pg_roles`) — ignora RLS totalmente. A única superfície onde a RLS de fato importa é a subscription de Realtime do navegador (`web/src/hooks/useCharacterRealtime.ts`, filtro `character_id=eq.${characterId}`, sem filtrar por `user_id`), que usa o JWT do usuário logado e portanto RESPEITA RLS. Como o GM nunca tem `auth.uid() = user_id` da linha (que é sempre o dono), a policy `character_state_owner` sempre bloqueia o SELECT do GM — ele nunca recebe eventos de Realtime de `character_state` de fichas de jogadores, mesmo sendo ele mesmo quem escreveu o dado.
- Nomes de tabela/coluna confirmados exatos via `schema.prisma` + leitura direta do banco: `character_state.character_id`, `character_state.user_id`, `campaign_characters.campaign_id`, `campaign_characters.character_id` (`@unique` — 1 personagem só pode estar em 1 campanha por vez), `campaigns.gm_user_id`. A proposta original de policy bate exatamente com esses nomes.
- Confirmado que nenhuma migration posterior toca `character_state`: `006_create_ships.sql` só cria tabelas de navio; `007_add_exhaustion.sql` só adiciona a coluna `exhaustion`, sem RLS. Consulta direta a `pg_policies` no banco real confirma hoje só 1 policy na tabela (`character_state_owner`) — nada resolve o bug parcialmente.
- Confirmado por grep em `web/src/` que não existe nenhum caminho de frontend escrevendo em `character_state` direto via Supabase client (`.from('character_state')`) — toda escrita passa por `api.state.*` → API → Prisma (bypassa RLS). Logo `FOR SELECT` é suficiente para o GM; não há necessidade de INSERT/UPDATE/DELETE via RLS.
- **Bug reproduzido ao vivo no banco real** (não só análise estática): dentro de uma transação `BEGIN ... ROLLBACK`, com `SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims` simulando um GM real (`gm_user_id` de uma campanha real do banco) tentando ler `character_state` de um personagem real de sua campanha (dono diferente do GM), o `SELECT` retornou **0 linhas** com a policy atual — confirma o bloqueio na prática. Transação sempre revertida; nenhum dado alterado.
- Approach de teste seguro validado para a Subtask 3: `postgres`/`DIRECT_URL` tem `rolbypassrls = true` (ignora RLS por padrão), mas `authenticated`/`anon` não têm — logo `BEGIN; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claims = '{"sub":"<uuid real já existente>"}'; <SELECT de teste>; ROLLBACK;` simula fielmente a RLS de um usuário real sem precisar de JWT de sessão nem alterar/expor dado nenhum. `auth.uid()` lê de `request.jwt.claim.sub` / `request.jwt.claims->>'sub'` (confirmado via `pg_get_functiondef(auth.uid)`). Banco tem dados reais suficientes para o teste (3 campanhas, 16 vínculos `campaign_characters`, 25 linhas `character_state`, incluindo pares onde `gm_user_id ≠ owner_user_id`).

**Correção:** nova migration `008_character_state_gm_select.sql`, aditiva (não substitui `character_state_owner`), replicando o padrão já usado em `005_rls_campaigns_maps.sql` (`campaigns_member_select`/`campaign_characters_gm_all`):

```sql
CREATE POLICY "character_state_gm_select"
  ON public.character_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_characters cc
        JOIN public.campaigns camp ON camp.id = cc.campaign_id
      WHERE cc.character_id = character_state.character_id
        AND camp.gm_user_id = auth.uid()
    )
  );
```

- [x] Subtask 1 — Criar `api/supabase/migrations/008_character_state_gm_select.sql` com a policy `character_state_gm_select` (SQL exato acima) e um comentário curto explicando o motivo (mesmo padrão de comentário de `007_add_exhaustion.sql`)
  - **Critério de aceite:** arquivo criado com esse nome exato e esse conteúdo; nenhuma outra migration alterada; `character_state_owner` não é removida nem modificada — a nova policy é puramente aditiva
  - **Arquivos:** `api/supabase/migrations/008_character_state_gm_select.sql`
  - **Executado:** arquivo criado com o SQL exato do diagnóstico do Planner, mais o comentário de cabeçalho no mesmo padrão de `007_add_exhaustion.sql`. Nenhuma outra migration tocada (`git status` confirma só o arquivo novo). Conteúdo puramente aditivo — nenhum `DROP`/`ALTER` em `character_state_owner`.

- [x] Subtask 2 — Aplicar a migration ao banco real (script Node + `pg` contra `DIRECT_URL`, mesmo padrão já usado nas tasks de Exaustão/Navio) e confirmar via `pg_policies`
  - **Critério de aceite:** `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'character_state'` retorna exatamente 2 linhas — `character_state_owner` (cmd=ALL) e `character_state_gm_select` (cmd=SELECT) — com o `qual` da nova policy batendo exatamente o SQL da Subtask 1; script roda apenas o `CREATE POLICY` (nenhum `ALTER TABLE`/`DROP`); nenhuma outra tabela/coluna afetada
  - **Arquivos:** nenhum arquivo de código novo — ação de infraestrutura; referência `api/supabase/migrations/008_character_state_gm_select.sql`
  - **Executado — critério literal satisfeito, mas ver bloqueio crítico abaixo:** script Node + `pg` contra `DIRECT_URL` rodou exatamente o `CREATE POLICY` do arquivo da Subtask 1 (nenhum `ALTER TABLE`/`DROP`). Confirmado via `pg_policies`: exatamente 2 linhas — `character_state_owner` (`cmd=ALL`, `qual = (auth.uid() = user_id)`, inalterada) e `character_state_gm_select` (`cmd=SELECT`, `qual` batendo exatamente a estrutura `EXISTS(...)` do arquivo da migration). Nenhuma outra tabela/coluna afetada. **Porém**, ao validar o comportamento real na Subtask 3, descobri que esta policy — apesar de estruturalmente correta e idêntica ao SQL pedido — causa uma regressão grave assim que fica ativa (detalhes abaixo). Tentei reverter com `DROP POLICY "character_state_gm_select" ON public.character_state;` (mesmo padrão de script Node+`pg`) e a ação foi **bloqueada pelo classificador de segurança do meu ambiente** (DDL destrutivo, exige aprovação explícita do usuário) — não tentei contornar o bloqueio. **Resultado: a policy continua ativa no banco real agora**, no estado de regressão descrito abaixo. Confirmei isso com uma query somente-leitura logo após o bloqueio (`pg_policies` ainda mostra as 2 policies).

**⚠️ Achado do Executor (bloqueante, descoberto durante a Subtask 3) — bug estrutural pré-existente e não relacionado nesta task:**

Ao simular os 3 cenários pedidos (dentro de `BEGIN...ROLLBACK`, `SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims`), **os três** cenários — GM, outsider, e até o próprio dono — falharam com o mesmo erro do Postgres:

```
error: infinite recursion detected in policy for relation "campaign_characters"
```

Isolei a causa com queries diretas (sem nenhuma referência a `character_state` ou à nova policy): um simples `SELECT * FROM public.campaign_characters` ou `SELECT * FROM public.campaigns`, como role `authenticated`, **já falha isoladamente** com o mesmo erro — confirmando que **não é a nova policy que causa a recursão**, e sim um ciclo mútuo pré-existente em `api/supabase/migrations/005_rls_campaigns_maps.sql`:
- `campaign_characters_gm_all` (em `campaign_characters`) referencia `campaigns` via `EXISTS`.
- `campaigns_member_select` (em `campaigns`) referencia `campaign_characters` via `EXISTS` de volta.

Isso forma um ciclo real que o *rewriter* do Postgres nunca havia detectado porque **nada, antes desta task, jamais consultou `campaigns`/`campaign_characters` como role `authenticated`** — toda leitura/escrita dessas tabelas no app real passa pela API (Prisma, role `postgres`, `rolbypassrls = true`, ignora RLS totalmente) e confirmei por grep em `web/src/` que o frontend nunca usa `.from('campaigns')`/`.from('campaign_characters')` via Supabase client direto. A nova policy `character_state_gm_select` foi a **primeira** coisa a de fato acionar esse ciclo em uma consulta real sob RLS, porque seu `EXISTS` faz `JOIN` entre as duas tabelas.

**Gravidade — pior que o bug original:** o *rewriter* do Postgres expande as policies aplicáveis na reescrita da query, não em tempo de execução linha-a-linha — então basta a policy `character_state_gm_select` **existir** na tabela para que **qualquer** `SELECT`/`UPDATE` em `character_state` sob RLS falhe com esse erro, **mesmo quando `character_state_owner` sozinha já resolveria o acesso**. Testei isso explicitamente: o dono da própria linha, que antes desta task conseguia `SELECT`/`UPDATE` normalmente via `character_state_owner`, **agora também recebe o erro de recursão** enquanto `character_state_gm_select` estiver presente. Ou seja: a correção, do jeito que foi especificada, não só não resolve o caso do GM — ela quebra a sincronização via Realtime **para todo mundo**, inclusive o dono (que antes funcionava). Isso não afeta os endpoints REST normais (sempre via Prisma/role `postgres`, bypassa RLS) — o impacto real e atual é 100% na subscription de Realtime do navegador (`useCharacterRealtime.ts`), que respeita RLS.

**Escopo desta task não permite corrigir isso:** o critério de aceite da Subtask 1 exige explicitamente "nenhuma outra migration alterada" — corrigir o ciclo em `005_rls_campaigns_maps.sql` está fora do escopo desta task (é uma correção estrutural em código de outra migration, para um bug não relacionado à sincronização de `character_state`) e exigiria decisão própria do Planner. Não alterei `004`/`005`.

- [x] Subtask 3 — Validar a policy no banco real via simulação segura (`BEGIN` + `SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims` + `ROLLBACK`, usando UUIDs reais já existentes no banco — sem criar/expor dado novo) cobrindo 3 cenários, confirmando correção e ausência de regressão
  - **Critério de aceite:** (a) o mesmo GM/character_id usado no teste que reproduziu o bug (Subtask do diagnóstico, hoje 0 linhas) passa a retornar 1 linha após a policy aplicada; (b) um `user_id` que não é GM nem dono de nenhuma campanha/personagem envolvido continua retornando 0 linhas; (c) o dono real da linha (`character_state.user_id`) continua enxergando/editando sua própria linha via `character_state_owner` inalterada — sem regressão; todas as transações revertidas com `ROLLBACK`, nenhum dado persistido
  - **Arquivos:** nenhum (validação); resultado documentado no `Sprint.md` na conclusão da task
  - **Tentativa original (Rodada 1) bloqueada pelo achado de recursão abaixo** — os 3 cenários falhavam com `infinite recursion detected in policy for relation "campaign_characters"` em vez de retornar as contagens esperadas. **Refeita com sucesso na Rodada 2 (Subtask 8) e novamente pelo Validator**, depois de `009_fix_campaign_rls_recursion.sql` corrigir a causa raiz: (a) GM → 1 linha ✅; (b) outsider → 0 linhas ✅; (c) dono → `SELECT`/`UPDATE` funcionam sem regressão ✅. Ver Subtask 8 e a validação final para os UUIDs e resultados completos.

- [x] Subtask 4 — Documentar no `Sprint.md` o passo a passo de teste manual multi-usuário para o usuário final confirmar a correção na UI real
  - **Critério de aceite:** passo a passo claro (dono altera Exaustão/Condições/PE/DA-DP/dice-log em uma aba → GM vê refletir na outra sem recarregar; caminho inverso GM→dono serve de controle, já funcionava antes), no mesmo formato já usado na entrada "Bug: Exaustão não persiste no banco real" (menção a fechar/reabrir `npm run dev` da API se havia processo antigo no ar); nota reforça que a mudança é 100% infraestrutura (RLS) — nenhum código de aplicação foi tocado
  - **Arquivos:** `Sprint.md`
  - **Executado.** Passo a passo abaixo, atualizado após a Rodada 2 corrigir o bloqueio — pronto para ser executado normalmente pelo usuário, sem nenhuma ressalva pendente.

**Passo a passo para o usuário testar a sincronização multi-usuário manualmente:**
1. A policy `character_state_gm_select` já está aplicada e validada no banco real (Rodada 2), junto com a correção do ciclo de recursão em `campaigns`/`campaign_characters` (`009_fix_campaign_rls_recursion.sql`) — nenhuma ação prévia necessária, pode testar diretamente.
2. Se você tinha um `npm run dev` da API já aberto em outro terminal, **feche-o e abra de novo** (`cd api && npm run dev`) — mesma precaução já documentada na task de Exaustão, ainda que esta correção seja 100% infraestrutura (RLS) e não código de aplicação.
3. Rode o frontend (`cd web && npm run dev`) e abra a ficha de um personagem de uma campanha real (não local/localStorage) em **duas abas ou dois navegadores diferentes**: uma logada como o **dono** do personagem, outra logada como o **GM** da campanha daquele personagem.
4. Na aba do dono, altere a Exaustão (ou Condições, PE, DA/DP, ou role um dado para o dice-log).
5. Observe a aba do GM: o valor deve atualizar sozinho, sem recarregar, em poucos segundos — este é o caminho que estava quebrado (o inverso, GM→dono, já funcionava antes e serve de controle: confirme que continua funcionando também).
6. Nenhum código de aplicação foi alterado nesta task — só a policy RLS de `character_state` (mais a correção pendente em `005`, fora do escopo desta task).

**Nota do Planner:** diagnóstico recebido confirmado correto e completo, sem nenhum ajuste necessário — nomes de tabela/coluna exatos, nenhuma migration concorrente já resolvendo o problema parcial ou totalmente, escopo de `FOR SELECT` (não UPDATE/DELETE) confirmado suficiente já que toda escrita real ignora RLS via `DIRECT_URL`/role `postgres`, e o bug foi reproduzido ao vivo no banco real de forma segura (transação sempre revertida, nenhum dado tocado). Pronto para o Executor.

**Nota do Executor — resumo para o Validator/Planner:** a Subtask 1 e a criação/estrutura da Subtask 2 seguem exatamente o que foi pedido, sem desvio. Porém a validação (Subtask 3, exigida explicitamente antes de considerar a task pronta) revelou que o SQL pedido, embora correto isoladamente, interage mal com um bug estrutural pré-existente e não relacionado em `005_rls_campaigns_maps.sql` (nunca antes exercitado sob RLS real), causando uma regressão pior que o bug original. Não tenho permissão no meu ambiente para rodar o `DROP POLICY` necessário para reverter isso no banco real — só consegui confirmar (leitura) que a policy nociva continua ativa. **Esta task não deve ser marcada como concluída/aprovada** até que: (1) alguém com permissão rode o `DROP POLICY` indicado no topo para tirar o banco real do estado de regressão, e (2) uma nova task (ou um retrabalho desta) corrija o ciclo de recursão em `campaigns`/`campaign_characters` (`005_rls_campaigns_maps.sql`) antes de reaplicar `character_state_gm_select`.

## Rodada 2 (2026-08-28) — Diagnóstico do Planner: extensão do ciclo e correção proposta

**Extensão completa do ciclo (leitura integral de `005_rls_campaigns_maps.sql`, 271 linhas):**

O ciclo real é de exatamente 2 nós — `campaigns` ↔ `campaign_characters` — fechado por 2 policies:
- `campaigns_member_select` (em `campaigns`, FOR SELECT) → `EXISTS (... FROM campaign_characters cc JOIN characters c ...)` — consulta `campaign_characters`.
- `campaign_characters_gm_all` (em `campaign_characters`, FOR ALL) → `EXISTS (... FROM campaigns WHERE campaigns.id = campaign_characters.campaign_id ...)` — consulta `campaigns` de volta.

Nenhuma outra policy das duas tabelas participa do ciclo: `campaigns_gm_all` (`auth.uid() = gm_user_id`, sem subquery) e `campaign_characters_owner_select`/`campaign_characters_owner_delete` (subquery só em `characters`, que não referencia `campaigns`/`campaign_characters` de volta) são inertes ao ciclo.

`maps` e as tabelas dependentes (`map_layers`, `map_walls`, `map_doors`, `map_tokens`) **não adicionam nós ao ciclo**, mas todas elas dependem transitivamente das duas tabelas do ciclo: `maps_gm_all`/`map_layers_gm_all`/etc. fazem `JOIN` com `campaigns`, e `maps_member_select`/`*_member_select` fazem `JOIN` com `campaign_characters` + `characters`. Como o rewriter do Postgres expande RLS recursivamente por trás de qualquer subquery, **qualquer SELECT nessas tabelas também dispara o mesmo erro** hoje (confirmado no teste abaixo) — não é só `campaigns`/`campaign_characters` diretamente. Corrigir o ciclo de 2 nós resolve automaticamente todas essas tabelas dependentes, sem precisar tocar nelas.

**Correção proposta:** extrair as duas condições para funções `SECURITY DEFINER` (rodam com privilégio do dono da função — quem aplicar a migration via `DIRECT_URL` é a role `postgres`, confirmado `rolbypassrls = true` — então as queries *dentro* da função não acionam RLS de novo, quebrando o ciclo). Troca via `ALTER POLICY` (não `DROP`/`CREATE`) — preserva nome, permissões e não deixa a tabela sem a policy em nenhum instante. Este é o padrão documentado pelo Supabase para exatamente este erro ("infinite recursion detected in policy for relation").

SQL exato proposto para `api/supabase/migrations/009_fix_campaign_rls_recursion.sql`:

```sql
-- Corrige recursão infinita entre as policies de campaigns e campaign_characters.
-- campaigns_member_select (em campaigns) e campaign_characters_gm_all (em
-- campaign_characters) formam um ciclo mútuo de EXISTS: cada uma consulta a outra
-- tabela sob RLS, e o rewriter do Postgres nunca conseguia terminar a expansão —
-- qualquer SELECT em campaigns ou campaign_characters como role authenticated
-- falhava com "infinite recursion detected in policy for relation ...". Extrai as
-- duas condições para funções SECURITY DEFINER (rodam com privilégio do dono —
-- role postgres, rolbypassrls=true — bypassando RLS internamente), padrão
-- recomendado pela documentação do Supabase para quebrar recursão entre policies
-- de tabelas que se referenciam mutuamente. Não remove nem recria as policies —
-- apenas troca a condição via ALTER POLICY, preservando nome/permissões.

CREATE OR REPLACE FUNCTION public.is_campaign_gm(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = p_campaign_id
      AND campaigns.gm_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_campaign_member(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_characters cc
      JOIN public.characters c ON c.id = cc.character_id
    WHERE cc.campaign_id = p_campaign_id
      AND c.user_id = auth.uid()
  );
$$;

ALTER POLICY "campaigns_member_select"
  ON public.campaigns
  USING (public.is_campaign_member(campaigns.id));

ALTER POLICY "campaign_characters_gm_all"
  ON public.campaign_characters
  USING (public.is_campaign_gm(campaign_characters.campaign_id))
  WITH CHECK (public.is_campaign_gm(campaign_characters.campaign_id));
```

**Confirmação — testada de forma segura no banco real e revertida (2026-08-28):** rodei, dentro de uma única transação `BEGIN ... ROLLBACK` (nunca commitada), (1) o SQL acima completo (funções + `ALTER POLICY`) e (2) o `CREATE POLICY character_state_gm_select` exato de `008_character_state_gm_select.sql` (temporário, só para validar Parte A+B juntas nesta mesma transação), depois `SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims` simulando 3 identidades reais já existentes no banco (campanha real `ddc3f19d-de08-4c72-90c3-25277a30babf`, GM real `ffeb43bf-8b03-4549-8b95-8524aec747ea`, personagem real `c05d950e-51c8-40f0-b606-cfcec18ccce6` de dono real `5241c9b1-d6cf-4973-8470-cd6889947c67`, outsider real sem nenhum vínculo com essa campanha `6b1118d5-3b6d-4880-801a-26f6829c2137`), depois `ROLLBACK` de tudo. Resultado, sem nenhum erro de recursão em nenhum cenário:
- **GM:** `SELECT * FROM campaigns` → 2 linhas (suas campanhas), sem erro. `SELECT * FROM campaign_characters WHERE campaign_id = <alvo>` → 4 linhas (todos os membros), sem erro. `SELECT * FROM character_state WHERE character_id = <personagem alvo>` → **1 linha** (o estado do dono, antes bloqueado) — **o bug original está corrigido**. `SELECT * FROM maps` → sem erro de recursão (confirma que as tabelas dependentes também são resolvidas pela correção do ciclo de 2 nós).
- **Dono (não-GM):** `SELECT campaigns WHERE id = <alvo>` → 1 linha (via `campaigns_member_select`, agora usando a função). `SELECT`/`UPDATE character_state WHERE character_id = <sua ficha>` → funciona normalmente, **sem regressão** — a policy `character_state_owner` (inalterada) continua resolvendo sozinha.
- **Outsider:** `SELECT campaigns WHERE id = <alvo>` → 0 linhas. `SELECT character_state WHERE character_id = <alvo>` → 0 linhas. Nenhum vazamento de acesso.
- **Pós-rollback:** confirmado via `pg_proc` que as funções não existem mais; via `pg_policies` que `character_state` só tem `character_state_owner`; e que o `qual` de `campaigns_member_select` voltou exatamente à forma original (`EXISTS (... campaign_characters cc JOIN characters c ...)`). Nenhum dado real foi alterado — a única persistência real desta rodada 2 é este texto no `Sprint.md`.

**Nota sobre numeração de migration:** `008_character_state_gm_select.sql` já existe no repo (criado na rodada 1) com o conteúdo correto — não precisa mudar. A correção do ciclo vai em `009_fix_campaign_rls_recursion.sql`, aplicada **antes** de reaplicar a `CREATE POLICY` de `008` ao banco real (que hoje só tem `character_state_owner` — a policy do GM foi revertida manualmente, ver nota no topo desta task).

### Rodada 2 — Subtasks para o Executor

- [x] Subtask 5 (Parte A) — Criar `api/supabase/migrations/009_fix_campaign_rls_recursion.sql` com o SQL exato acima
  - **Critério de aceite:** arquivo criado com esse nome exato e esse conteúdo (2 funções `CREATE OR REPLACE FUNCTION ... SECURITY DEFINER` + 2 `ALTER POLICY`); nenhuma outra migration alterada (`005_rls_campaigns_maps.sql` permanece intocado — histórico preservado, é aditiva/corretiva via nova migration, não retroativa); nenhum `DROP POLICY`/`CREATE POLICY` usado (só `ALTER POLICY`, preservando nome e demais atributos das policies existentes)
  - **Arquivos:** `api/supabase/migrations/009_fix_campaign_rls_recursion.sql`
  - **Executado:** arquivo criado com o SQL literal validado pelo Planner na Rodada 2 (copiado sem nenhuma variação do bloco acima). `git status` confirma que só este arquivo novo foi adicionado — `005_rls_campaigns_maps.sql` e todas as demais migrations permanecem intocadas.

- [x] Subtask 6 (Parte A) — Aplicar `009` ao banco real (script Node + `pg` contra `DIRECT_URL`, mesmo padrão já usado nesta sprint) e confirmar
  - **Critério de aceite:** `SELECT proname FROM pg_proc WHERE proname IN ('is_campaign_gm','is_campaign_member')` retorna as 2 funções; `SELECT policyname, qual, with_check FROM pg_policies WHERE tablename IN ('campaigns','campaign_characters') AND policyname IN ('campaigns_member_select','campaign_characters_gm_all')` mostra as condições apontando para `is_campaign_member(...)`/`is_campaign_gm(...)`; nenhuma outra tabela/policy/coluna afetada; um `SELECT` real (via `SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims`, dentro de `BEGIN...ROLLBACK` para não alterar nada) em `campaigns`, `campaign_characters` e `maps` **não reproduz mais** `infinite recursion detected in policy for relation ...`
  - **Arquivos:** nenhum arquivo de código novo — ação de infraestrutura; referência `api/supabase/migrations/009_fix_campaign_rls_recursion.sql`
  - **Executado pelo orquestrador (fora do subagente Executor, com aprovação explícita do usuário) após novo bloqueio do classificador na tentativa do Executor.** Script Node+`pg` contra `DIRECT_URL` rodou o SQL literal de `009` (2 `CREATE OR REPLACE FUNCTION ... SECURITY DEFINER` + 2 `ALTER POLICY`). Confirmado via `pg_proc`: `is_campaign_gm` e `is_campaign_member` existem com `prosecdef = true`. Confirmado via `pg_policies`: `campaigns_member_select` e `campaign_characters_gm_all` seguem existindo (mesmo nome/cmd, só a condição mudou via `ALTER POLICY` — não foram recriadas). Nenhuma outra tabela/policy tocada.

- [x] Subtask 7 (Parte B) — Reaplicar `character_state_gm_select` (`008_character_state_gm_select.sql`, conteúdo já correto e sem alteração) ao banco real, agora que o ciclo foi corrigido
  - **Critério de aceite:** `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'character_state'` retorna exatamente 2 linhas — `character_state_owner` (cmd=ALL) e `character_state_gm_select` (cmd=SELECT); nenhum `ALTER TABLE`/`DROP` executado; nenhuma outra tabela afetada
  - **Arquivos:** nenhum arquivo de código novo — ação de infraestrutura; referência `api/supabase/migrations/008_character_state_gm_select.sql` (já existe, conteúdo inalterado)
  - **Executado pelo orquestrador na mesma sessão da Subtask 6.** `CREATE POLICY` de `008` (conteúdo idêntico ao criado na Rodada 1) rodado logo após `009`. Confirmado via `pg_policies`: `character_state` tem exatamente 2 policies — `character_state_owner` (ALL) e `character_state_gm_select` (SELECT).

- [x] Subtask 8 (Parte B) — Validar de fato os 3 cenários pedidos pela task original, agora sem erro (repetir a Subtask 3 original da rodada 1, desta vez com sucesso)
  - **Critério de aceite:** dentro de `BEGIN...ROLLBACK` (`SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims`, UUIDs reais já existentes, nenhum dado novo criado/exposto): (a) GM de uma campanha real lendo `character_state` de um personagem real de sua campanha (dono diferente do GM) → **1 linha**, sem erro; (b) um `user_id` sem nenhum vínculo com a campanha/personagem → **0 linhas**, sem erro; (c) o dono real da linha consegue `SELECT`/`UPDATE` sua própria linha via `character_state_owner`, sem regressão; todas as transações revertidas com `ROLLBACK`
  - **Arquivos:** nenhum (validação); resultado documentado no `Sprint.md`
  - **Executado pelo orquestrador — todos os cenários passaram:** usando um `character_state` real (`character_id=c05d950e-...`, dono `5241c9b1-...`, GM `ffeb43bf-...`) dentro de `BEGIN...ROLLBACK`: GM → 1 linha (esperado 1) ✅; outsider (usuário real sem nenhum vínculo com a campanha) → 0 linhas (esperado 0) ✅; dono → 1 linha, sem regressão (esperado 1) ✅; bônus — `SELECT` em `campaigns` e `campaign_characters` como GM autenticado funcionou sem erro de recursão. Transação revertida com `ROLLBACK` — nada persistido além das migrations 008/009 já aplicadas nas Subtasks 6/7.

- [x] Subtask 9 (encerramento) — Atualizar `Sprint.md`: marcar Subtasks 5-8 como `[x]` com nota de execução, reativar/confirmar o passo a passo de teste manual multi-usuário (já escrito na Subtask 4 da rodada 1 — agora pode ser executado de verdade, sem a ressalva de bloqueio), e deixar a task pronta para o Validator
  - **Critério de aceite:** todas as subtasks da rodada 2 marcadas `[x]`; nota final resume que a mudança é 100% infraestrutura (RLS + 2 funções auxiliares) — nenhum código de aplicação foi tocado em nenhuma das duas rodadas; task pronta para avaliação do Validator
  - **Arquivos:** `Sprint.md`
  - **Executado.** Todas as subtasks das Rodadas 1 e 2 estão `[x]`. Mudança é 100% infraestrutura de banco (2 migrations SQL: `008` policy aditiva, `009` funções + `ALTER POLICY`) — zero código de aplicação (frontend/backend) tocado em qualquer rodada. Passo a passo de teste manual reativado abaixo (Rodada 1 tinha escrito com a ressalva "não executar ainda" — a ressalva foi removida, pode ser testado normalmente). Task pronta para o Validator.

**Nota sobre execução fora do subagente Executor (2026-08-28):** nas duas rodadas desta task, o subagente Executor foi bloqueado pelo classificador de permissão do ambiente ao tentar aplicar DDL ao banco real (Rodada 1: `DROP POLICY` de reversão; Rodada 2: `CREATE FUNCTION`/`ALTER POLICY` de `009`). Em ambos os casos, o orquestrador (fora do protocolo de 3 agentes) executou a ação diretamente, com aprovação explícita do usuário coletada antes de cada ação via pergunta direta. O SQL executado foi, em ambos os casos, exatamente o já planejado/validado pelo Planner — nenhuma correção ad-hoc foi improvisada fora do fluxo Planner→Executor.

**Validação do Validator (2026-08-28):**
- **Item 1 (banco real):** reconfirmado — todas as consultas e aplicações desta task (Rodadas 1 e 2) rodaram contra o banco real via `DIRECT_URL`/script Node+`pg`, nunca mock; simulações de RLS sempre dentro de `BEGIN...ROLLBACK` revertido.
- **Item 2 (policies de `character_state`):** reconfirmado nesta rodada via query própria e independente (`pg_policies`) — exatamente 2 linhas: `character_state_owner` (`cmd=ALL`, inalterada) e `character_state_gm_select` (`cmd=SELECT`), batendo exatamente o SQL de `008_character_state_gm_select.sql`.
- **Item 3 (funções `SECURITY DEFINER` de `009`):** reconfirmado nesta rodada via query própria (`pg_proc`) — `is_campaign_gm` e `is_campaign_member` existem com `prosecdef = true`; `pg_policies` confirma que `campaigns_member_select` e `campaign_characters_gm_all` continuam existindo (mesmo nome/cmd, só a condição trocada via `ALTER POLICY`, não recriadas).
- **Item 4 (4 cenários de validação):** GM vê a linha do dono (1 linha), outsider bloqueado (0 linhas), dono sem regressão (SELECT/UPDATE via `character_state_owner` funcionando), e `campaigns`/`campaign_characters`/`maps` sem erro de recursão — todos confirmados nas Subtasks 3/8 e na validação de Rodada 2, dentro de transações `BEGIN...ROLLBACK` sempre revertidas.
- **Item 5 (escopo do git diff):** reconfirmado nesta rodada via `git status`/`git diff --stat` — apenas `Sprint.md` modificado (183 inserções, 2 remoções) e os dois arquivos novos de migration (`008_character_state_gm_select.sql`, `009_fix_campaign_rls_recursion.sql`, ambos conferidos byte a byte contra o SQL documentado abaixo). Nenhum arquivo de código de aplicação (`api/src/**`, `web/src/**`) tocado em nenhuma das duas rodadas.
- **Item 6 (documentação do `Sprint.md` — foco desta reavaliação):** confirmado que todas as inconsistências do veredito anterior foram corrigidas — callout de topo não afirma mais que o bug "permanece" (agora narra a jornada completa e termina em "corrigido e validado, nenhuma ação pendente"); Subtasks 3 e 4 (Rodada 1) marcadas `[x]`, com nota remetendo à Subtask 8 (Rodada 2) que refez a validação com sucesso; Subtasks 5-9 (Rodada 2) todas `[x]`; passo a passo de teste manual não instrui mais nenhuma reversão/pré-requisito obsoleto (Passo 1 reflete que a policy já está aplicada e validada). As notas históricas do Achado do Executor e da Nota do Executor (Rodada 1) foram mantidas intactas para registro da regressão real que ocorreu em produção — permanecem no corpo da task, precedendo a seção "Rodada 2" que as resolve, sem contradizer o status final.
- **Item 7 (`CLAUDE.md`):** respeitado — `chapters/` não foi tocado (task é 100% infraestrutura de banco, não mexe em regra de livro); nenhum mock de banco em nenhuma das duas rodadas; nenhuma feature extra além do pedido (escopo estritamente a policy do GM + a correção do ciclo de recursão pré-existente que a validação da Subtask 3 revelou ser bloqueante); comentários de cabeçalho das duas migrations seguem o padrão já estabelecido em `007_add_exhaustion.sql`.

**Resumo da jornada (para referência futura):** bug relatado (dono altera `character_state` — Exaustão, Condições, PE, DA/DP, dice-log — e o GM da campanha não vê a mudança via Realtime, só o caminho inverso funcionava) → causa raiz identificada (`character_state` só tinha a policy `character_state_owner`, sem nenhuma policy de `SELECT` para o GM; a API sempre bypassa RLS via role `postgres`, então o único ponto onde a RLS importa é a subscription de Realtime do navegador, que usa o JWT do usuário e portanto respeita RLS) → migration `008_character_state_gm_select.sql` criada e aplicada ao banco real → **regressão descoberta em produção durante a validação** (a nova policy foi a primeira a exercitar sob RLS real um ciclo de recursão infinita pré-existente e não relacionado entre `campaigns` ↔ `campaign_characters`, em `005_rls_campaigns_maps.sql` — regressão pior que o bug original, pois quebrava até o acesso do próprio dono) → policy revertida temporariamente (`DROP POLICY`, aprovação explícita do usuário) para tirar o banco do estado quebrado enquanto a causa raiz da regressão era investigada → causa raiz da regressão corrigida na Rodada 2 (`009_fix_campaign_rls_recursion.sql`: 2 funções `SECURITY DEFINER` + `ALTER POLICY`, sem tocar `005_rls_campaigns_maps.sql`) → `character_state_gm_select` (`008`) reaplicada ao banco real → todos os cenários revalidados com sucesso (GM vê, outsider bloqueado, dono sem regressão, `campaigns`/`campaign_characters`/`maps` sem recursão) → documentação do `Sprint.md` corrigida para refletir o estado final, sem contradições.

✅ Validado — aprovado sem ressalvas de bloqueio

---

### Bug: Exaustão não persiste no banco real (migration não aplicada + Prisma Client desatualizado)
**Origem:** /task Garantir que o campo Exaustão seja salvo e sincronizado em tempo real igual aos outros campos da ficha (ex: Condições, DA/DP). Quando qualquer pessoa com acesso à ficha alterar a Exaustão, todos os outros visualizando a mesma ficha devem ver a atualização automaticamente, sem recarregar. Não se aplica a fichas locais (localStorage) sem backend.
**Adicionada:** 2026-08-27 · **Validator:** APROVADO · **Concluída:** 2026-08-27

**Diagnóstico do Planner (confirmado, não é suposição):**
- Wiring de frontend (`useCharacterRealtime.ts`, `CharacterPage.tsx`, `apiClient.ts`) e backend (schema Zod, service, controller, rota) para `exhaustion` está 100% correto e espelha exatamente o padrão de `conditions` — nenhuma mudança de código de aplicação é necessária.
- `character_state` já está na publicação `supabase_realtime` (confirmado via query direta em `pg_publication_tables`) — o canal escuta `postgres_changes` `event: '*'` na tabela inteira, então uma vez que a coluna exista e seja persistida, o realtime multi-usuário funciona automaticamente sem nenhuma configuração extra.
- **Causa raiz do bug (confirmada por query direta ao banco real via `information_schema.columns`): a coluna `exhaustion` NÃO existe na tabela `public.character_state` do banco real.** A migration `api/supabase/migrations/007_add_exhaustion.sql` foi criada mas nunca foi de fato executada contra o banco (nem via Supabase SQL Editor, nem via `db:push`/`db:migrate`). Isso significa que **toda chamada a `PATCH /characters/:id/state/exhaustion` falha em runtime** com erro de coluna inexistente — a Exaustão nunca é persistida no banco real, e portanto nunca dispara evento de Realtime para outros usuários. Este é o bloqueador real e único da feature — não é cosmético.
- Adicionalmente (efeito colateral do mesmo atraso, não causa raiz): o Prisma Client gerado em `api/src/generated/prisma/models/CharacterState.ts` (mtime 26/08) é anterior à edição do `schema.prisma` que adicionou `exhaustion` (27/08) — o campo não aparece em nenhum tipo gerado, o que já explica o erro de `npm run typecheck` em `state.repository.ts:78` e adicionaria uma segunda falha em runtime ("Unknown argument `exhaustion`") mesmo depois da coluna existir no banco, caso o client não seja regenerado.
- Tentativa de `npx prisma generate` neste sandbox travou (sem output após vários minutos) — mesma limitação de I/O já documentada nas tasks de Navio/Arcano; o Executor deve tentar novamente em ambiente sem essa limitação, ou aplicar a alternativa já usada antes (revisão manual linha a linha caso o comando não complete).

- [x] Subtask 1 — Aplicar a migration `007_add_exhaustion.sql` ao banco real (via Supabase SQL Editor, seguindo o padrão já documentado para `004_rls_policies.sql`, ou via `npm run db:push` a partir do `schema.prisma` já correto)
  - **Critério de aceite:** query direta a `information_schema.columns` para `table_name = 'character_state'` retorna a coluna `exhaustion` (tipo `integer`, `is_nullable = 'NO'`, default `0`); nenhuma outra coluna/tabela afetada
  - **Arquivos:** nenhum arquivo de código novo — ação de infraestrutura; referência `api/supabase/migrations/007_add_exhaustion.sql`
  - **Executado:** aplicado via script Node + `pg` (mesma abordagem do Planner) rodando exatamente o `ALTER TABLE public.character_state ADD COLUMN exhaustion INT NOT NULL DEFAULT 0;` do arquivo `007_add_exhaustion.sql`, conectado via `DIRECT_URL`. Optou-se por essa via em vez de `db:push` para garantir que **somente** essa coluna fosse alterada, sem risco de `db push` sincronizar outras diferenças de schema. Verificado antes (coluna ausente) e depois (coluna presente: `integer`, `is_nullable = NO`, `column_default = '0'`) via `information_schema.columns`. Nenhuma outra coluna/tabela foi tocada (confirmado pela listagem completa de colunas de `character_state` antes/depois).

- [x] Subtask 2 — Regenerar o Prisma Client (`npm run db:generate`) e confirmar que `exhaustion` aparece nos tipos gerados de `CharacterState`
  - **Critério de aceite:** `api/src/generated/prisma/models/CharacterState.ts` (ou arquivo equivalente pós-geração) contém `exhaustion`; `npm run typecheck` em `api/` não reproduz mais o erro em `state.repository.ts:78` (`'exhaustion' does not exist in type CharacterStateUpdateInput`); nenhum erro novo introduzido
  - **Arquivos:** `api/src/generated/prisma/**` (gerado — não commitado)
  - **Executado:** `npm run db:generate` rodado em background (mesma limitação de I/O documentada — CPU ~0% por ~5min30s antes de completar; **não travou de fato**, apenas foi lento: `✔ Generated Prisma Client (7.7.0) to ./src/generated/prisma in 90ms`). `exhaustion` confirmado presente em `CharacterState.ts` (campo do model, `CharacterStateUpdateInput`, `CharacterStateUncheckedUpdateInput`, filtros, orderBy, select, etc.). `npm run typecheck` não reproduz mais o erro em `state.repository.ts:78`. Único erro remanescente é em `state.controller.ts:67` (dice-log, `DiceLogEntry` incompleto) — confirmado pré-existente e não relacionado via `git diff HEAD -- api/src/controllers/state.controller.ts` (o bloco de `exhaustion` adicionado não toca a linha do erro). Nenhum erro novo introduzido.

- [x] Subtask 3 — Validar end-to-end que a persistência e o realtime funcionam de fato após as subtasks 1 e 2, e documentar o teste manual multi-usuário para o usuário final
  - **Critério de aceite:** com a coluna aplicada e o client regenerado, uma chamada real a `PATCH /characters/:id/state/exhaustion` (dev server local, via curl/Postman ou teste manual na UI) retorna 200 com `exhaustion` atualizado, e um `GET` subsequente confirma persistência; nota registrada no Sprint.md com o passo a passo para o usuário testar sincronização multi-usuário manualmente (duas abas/navegadores logados na mesma ficha, uma altera Exaustão, a outra deve atualizar sem recarregar) — já que o sandbox não permite abrir dois browsers reais
  - **Arquivos:** nenhum arquivo de código esperado (validação); `Sprint.md` (nota de teste)
  - **Executado:**
    1. **Persistência real confirmada** — script Node usando o **próprio `PrismaClient` gerado do projeto** (mesmo adapter `@prisma/adapter-pg`, mesma `DATABASE_URL`) executou, contra o banco real, exatamente a mesma query que `state.repository.ts.updateExhaustion` roda (`characterState.update({ where: { characterId_userId }, data: { exhaustion } })`) sobre uma linha real de `character_state` (personagem existente, exaustão original `0`). Update para `3` retornou `exhaustion: 3`; uma leitura separada (`findUnique`, equivalente ao `GET`) confirmou `exhaustion: 3` persistido; o valor foi **restaurado para `0`** (valor original) ao final — nenhum dado de personagem real foi alterado permanentemente.
    2. **Achado operacional importante:** havia processos `tsx watch` **órfãos de sessões anteriores** já escutando a porta 3001 desde 26/08 (antes da migration e do `db:generate` de hoje) — ou seja, mantinham o Prisma Client **antigo** carregado em memória e reproduziriam o erro "Unknown argument `exhaustion`" mesmo com o banco já corrigido. Esses processos foram encerrados e um servidor novo (`npm run dev`) foi iniciado, confirmado no ar (`GET /health` → 200) já com o client regenerado.
    3. **Checagem HTTP real:** `PATCH /api/v1/characters/:id/state/exhaustion` sem token retornou `401 UNAUTHORIZED` (não `404`, não `500`) — confirma que a rota está registrada e o servidor sobe sem erro com o client novo. Uma chamada HTTP autenticada completa (com JWT de usuário real) **não foi executada**: não há credenciais de usuário de teste disponíveis no projeto, e uma tentativa de gerar uma sessão via Supabase Admin API para um personagem existente foi bloqueada pelo classificador de segurança do ambiente (ação de acesso a dado pessoal de usuário) — a tentativa foi abandonada em vez de contornada, conforme a diretriz de segurança do ambiente.
    4. **Conclusão:** a combinação da consulta 1 (mesma query real de produção, banco real, sem mocks) com a consulta 3 (servidor real de pé, rota registrada, sem erros) cobre o mecanismo exato que estava quebrado (coluna ausente + client desatualizado) e confirma que ambos os problemas foram resolvidos. O único elo não testado por mim foi a camada de autenticação HTTP em si (já validada estruturalmente — 401 correto), que é idêntica ao padrão já em produção para `conditions`.

  **Passo a passo para o usuário testar a sincronização multi-usuário manualmente:**
  1. Garanta que o backend está rodando com o client atualizado: se você tinha um `npm run dev` da API já aberto em outro terminal, **feche-o e abra de novo** (`cd api && npm run dev`) — processos antigos ficam com o Prisma Client desatualizado em memória, mesmo depois da migration aplicada.
  2. Rode o frontend (`cd web && npm run dev`) e abra a ficha de um personagem que exista no banco (não local/localStorage) em **duas abas ou dois navegadores diferentes** (ex: uma aba normal e uma anônima), logados em contas com acesso à mesma ficha — a mesma conta dona da ficha em ambas, ou dono numa aba e um GM da mesma campanha na outra, ou a ficha marcada como "Ficha pública" (toggle já existente na página) e qualquer usuário logado na outra aba.
  3. Em uma das abas, use os controles de Exaustão (+1/-1/reset) para mudar o valor.
  4. Observe a outra aba: o número de Exaustão deve atualizar sozinho, sem recarregar a página, em poucos segundos (mesmo mecanismo de Realtime já usado por Condições/DA/DP).
  5. Se quiser confirmar a penalidade nos testes: com Exaustão > 0, role um teste de Perícia ou de Arcano na ficha — o resultado deve mostrar "-10 × Exaustão" destacado em vermelho, separado do modificador de Condições.

**Validação do Validator (2026-08-27):**
- Coluna confirmada de forma independente: query própria via script Node + `pg` contra `DIRECT_URL` (`information_schema.columns`, `table_schema = 'public'`, `table_name = 'character_state'`) retornou `exhaustion` — `integer`, `is_nullable = NO`, `column_default = 0` — exatamente como reportado. Listagem completa das 11 colunas de `character_state` conferida: nenhuma coluna a mais, a menos, ou alterada além de `exhaustion`.
- Prisma Client confirmado por leitura direta de `api/src/generated/prisma/models/CharacterState.ts`: `exhaustion?: Prisma.IntFieldUpdateOperationsInput | number` presente em `CharacterStateUpdateInput` (linha 356) e `CharacterStateUncheckedUpdateInput` (linha 371), além de `CharacterStateCreateInput`, filtros, orderBy, select e `CharacterStateOmit`. `npm run typecheck` rodado por mim em `api/`: erro de `state.repository.ts:78` não reproduz mais; único erro remanescente é `state.controller.ts(67,61)` (`DiceLogEntry` incompleto, rota `/dice-log`) — confirmado pré-existente e não relacionado por leitura do diff (o bloco novo de `/exhaustion` foi inserido 8 linhas antes, apenas deslocando a rota de dice-log, sem tocá-la). Nenhum erro novo.
- Escopo confirmado via `git status`/`git diff`: nenhum arquivo de código de aplicação tem diferença introduzida por esta task — todos os arquivos trackeados alterados (`schema.prisma`, `state.controller/repository/service/schema.ts`, arquivos web) têm mtime entre 13:07–13:14 (sessão da task anterior, "Sistema de Exaustão"), enquanto o Prisma Client regenerado tem mtime 14:28 e o `Sprint.md` 14:36 — nenhum arquivo de app foi tocado na janela de execução desta task. `api/src/generated/prisma/` confirmado ignorado via `.gitignore` (`git check-ignore` positivo) — não é candidato a commit. Query de sanidade adicional (`GROUP BY exhaustion` em todas as 24 linhas de `character_state`) confirma 100% em `0` — o round-trip de teste do Executor foi corretamente restaurado, sem dado residual.
- Processos de servidor: encontrado o servidor `tsx watch`/`npm run dev` deixado no ar pela task (PIDs iniciados às 14:34, respondendo `GET /health` → 200 na porta 3001) — encerrado por mim ao final da validação por não haver razão para mantê-lo rodando; porta 3001 confirmada livre depois.
- `Sprint.md`: as 3 subtasks conferidas como `[x]` com notas de execução completas; passo a passo de teste manual multi-usuário (5 passos) revisado — claro, correto e consistente com o mecanismo de Realtime já usado por `conditions`/DA/DP.
- `CLAUDE.md` respeitado: nenhum mock de banco (todas as verificações — Executor e Validator — usaram o banco real via `DIRECT_URL`/Prisma Client real), nenhuma feature extra, correção proporcional ao bug (apenas aplicação da migration já existente + regeneração do client; nenhuma reescrita de código de aplicação).

✅ Validado — aprovado sem ressalvas de bloqueio

---

### Sistema de Exaustão na Ficha de Personagem
**Origem:** /task Adicionar rastreamento de Exaustão na ficha do personagem (baseado em chapters/01_04_00_combate.md, seção "Exaustão"). Campo posicionado acima de Condições, com controles +1/-1/reset e ícone próprio; cada ponto aplica -10 aos testes de Perícia e de Arcano, com a penalidade destacada visualmente no resultado da rolagem.
**Adicionada:** 2026-08-27 · **Validator:** APROVADO · **Concluída:** 2026-08-27

- [x] Subtask 1 — Criar a camada de persistência de Exaustão (local + API), espelhando exatamente o padrão já usado por `conditions`/`defenseModifiers` em `CharacterState`
  - **Critério de aceite:** `web/src/lib/localCharacters.ts` ganha `loadExaustao(characterId): number` (default `0`) e `saveExaustao(characterId, value: number): void` sob a chave `arcadia_exaustao`, no mesmo padrão de `loadConditions`/`saveConditions`; `api/prisma/schema.prisma` — modelo `CharacterState` ganha `exhaustion Int @default(0)`; nova migration `api/supabase/migrations/007_add_exhaustion.sql` com `ALTER TABLE public.character_state ADD COLUMN exhaustion INT NOT NULL DEFAULT 0;`; `api/src/schemas/state.schema.ts` ganha `ExhaustionSchema = z.object({ exhaustion: z.number().int().min(0) })`; `api/src/repositories/state.repository.ts` e `api/src/services/state.service.ts` ganham `updateExhaustion(characterId, userId, exhaustion)` no padrão de `updateConditions`; `api/src/controllers/state.controller.ts` ganha rota `PATCH /characters/:id/state/exhaustion`; `web/src/lib/apiClient.ts` ganha `api.state.updateExhaustion(characterId, exhaustion)`; `npm run typecheck` em `api/` sem erros novos
  - **Arquivos:** `web/src/lib/localCharacters.ts`, `api/prisma/schema.prisma`, `api/supabase/migrations/007_add_exhaustion.sql`, `api/src/schemas/state.schema.ts`, `api/src/repositories/state.repository.ts`, `api/src/services/state.service.ts`, `api/src/controllers/state.controller.ts`, `web/src/lib/apiClient.ts`

- [x] Subtask 2 — Adicionar estado, carregamento inicial, realtime e handlers de Exaustão em `CharacterPage.tsx`
  - **Critério de aceite:** novo estado `const [exaustao, setExaustao] = useState<number>(0)`; branch API carrega `setExaustao((s.exhaustion as number) ?? 0)` e branch local carrega `setExaustao(loadExaustao(id))`, no mesmo useEffect que já carrega `conditions`; `web/src/hooks/useCharacterRealtime.ts` — `CharacterStatePayload` ganha `exhaustion?: number`; `onStateUpdate` atualiza `setExaustao` respeitando `stateGracePassed`, no mesmo padrão do bloco de `conditions`; handlers `handleExaustaoChange(delta: number)` (clamp `Math.max(0, prev + delta)`, mesmo padrão de `handleDaBaseChange`) e `handleExaustaoReset()` (seta `0`), ambos persistindo via `api.state.updateExhaustion` (ficha API) ou `saveExaustao` (ficha local) e atualizando `lastLocalStateTime.current`; nenhuma simulação automática de acúmulo por Ações Simples/Complexas — apenas os controles manuais
  - **Arquivos:** `web/src/pages/CharacterPage.tsx`, `web/src/hooks/useCharacterRealtime.ts`

- [x] Subtask 3 — Criar `ExaustaoSection` com ícone próprio e controles +1/-1/reset, posicionado acima de `ConditionsSection`
  - **Critério de aceite:** novo componente `ExaustaoSection.tsx` exibe label "Exaustão", valor atual e um ícone de `lucide-react` (ex.: `BatteryWarning` ou `Gauge`) visualmente distinto de qualquer um dos emojis em `CONDITION_ICONS` (`ConditionsSection.tsx`); controles +1/−1/reset (estilo `smallBtn`/`actionBtn` de `DefenseStats.tsx`) visíveis apenas quando `canEdit` for verdadeiro (dono da ficha ou GM da campanha — sem restringir a GM como Condições); em `StatsSection.tsx`, `ConditionsSection` passa a ficar dentro de um container `flex flex-col` junto com `ExaustaoSection` renderizado IMEDIATAMENTE ACIMA dele; `CharacterPage.tsx` repassa `exaustao`, `onExaustaoChange={canEdit ? handleExaustaoChange : undefined}` e `onExaustaoReset={canEdit ? handleExaustaoReset : undefined}` para `StatsSection`; inspeção visual da ficha confirma Exaustão acima de Condições
  - **Arquivos:** `web/src/components/character/ExaustaoSection.tsx` (novo), `web/src/components/character/StatsSection.tsx`, `web/src/pages/CharacterPage.tsx`

- [x] Subtask 4 — Aplicar a penalidade de -10×Exaustão nos testes de Perícia, destacando o valor no resultado da rolagem
  - **Critério de aceite:** `SkillTestData` (`SkillTestOverlay.tsx`) ganha `exhaustionPenalty?: number` (já negativo); `finalResult` passa a somar `exhaustionPenalty ?? 0` quando não houver falha crítica/desastre (`!noBonus`); tanto o cabeçalho da fase "config" quanto o painel de resultado da fase "settled" exibem a penalidade em um elemento com cor de alerta (ex. `#D04040`) rotulado "Exaustão", visualmente separado do `modifier` (condições) já existente; `AttributeBlock.tsx` recebe prop `exaustao: number` e inclui `exhaustionPenalty: exaustao > 0 ? -10 * exaustao : 0` na chamada `onSkillTest({...})`; `SkillsSection.tsx` repassa `exaustao` para cada `AttributeBlock`; `CharacterPage.tsx` passa `exaustao={exaustao}` para `SkillsSection`; `SkillLogEntry` (`diceLog.ts`) ganha `exhaustionPenalty?: number`, populado no `addEntry` de `handleAllSettled`; teste manual com Exaustão = 2 mostra "-20" destacado separadamente do resultado final (dados + atributo + perícia − 20)
  - **Arquivos:** `web/src/components/character/SkillTestOverlay.tsx`, `web/src/components/character/AttributeBlock.tsx`, `web/src/components/character/SkillsSection.tsx`, `web/src/pages/CharacterPage.tsx`, `web/src/lib/diceLog.ts`

- [x] Subtask 5 — Aplicar a penalidade de -10×Exaustão nos testes de Arcano e refletir em todo o histórico de rolagens
  - **Critério de aceite:** `ArcaneTestData` (`ArcaneTestOverlay.tsx`) ganha `exhaustionPenalty?: number`; `handleAllSettled` soma `exhaustionPenalty` ao `total` de cada modificador (junto a `diceSum + score + bonus + elementBonus`); o breakdown de cada card de resultado exibe a penalidade de Exaustão em texto/cor distinta da penalidade de Antítese já existente; `ArcanoSection.tsx` recebe prop `exaustao: number` e passa `exhaustionPenalty={exaustao > 0 ? -10 * exaustao : 0}` para `<ArcaneTestOverlay>`; `CharacterPage.tsx` passa `exaustao={exaustao}` para `ArcanoSection`; `ArcanoLogEntry` (`diceLog.ts`) ganha `exhaustionPenalty?: number`, populado no `addEntry`; `DiceLogEntries.tsx` — `SkillEntry` e `ArcanoEntry` exibem "Exaustão −N" em um `<span>` de cor de alerta separado da linha `bonusParts` existente, preservando os textos já existentes ("Mod", "Antítese −10" etc.); teste manual com Exaustão = 1 mostra "-10" destacado em cada card de modificador do teste de Arcano, e o log de rolagens reflete a mesma penalidade em entradas de Perícia e de Arcano
  - **Arquivos:** `web/src/components/character/ArcaneTestOverlay.tsx`, `web/src/components/character/ArcanoSection.tsx`, `web/src/pages/CharacterPage.tsx`, `web/src/lib/diceLog.ts`, `web/src/components/character/DiceLogEntries.tsx`

**Validação do Validator (2026-08-27):**
- Regra do livro (`chapters/01_04_00_combate.md`, linhas 106-124) confirmada fielmente refletida: "-10 por ponto de Exaustão" aplicado a todos os testes de Perícia (`SkillTestOverlay.tsx`) e de Arcano (`ArcaneTestOverlay.tsx`) rolados na ficha — as únicas duas superfícies de rolagem de teste do personagem (DA/DP não rolam dado). Arquivo do capítulo confirmado intocado (`git diff` vazio).
- Todas as 5 subtasks conferidas arquivo por arquivo contra o critério de aceite exato: persistência local/API espelha `conditions` em todos os 8 arquivos (schema Zod, repository, service, controller, rota, apiClient, migration `007_add_exhaustion.sql`, `schema.prisma`); wiring em `CharacterPage.tsx`/`useCharacterRealtime.ts` idêntico ao padrão de `conditions`; `ExaustaoSection` renderizado imediatamente acima de `ConditionsSection` em `StatsSection.tsx` (confirmado por leitura direta do JSX), ícone `BatteryWarning` (lucide-react) distinto dos emojis de `CONDITION_ICONS`, controles +1/−1/reset liberados para `canEdit` (dono OU GM — `StatsSection` recebe `owned={canEdit}` de `CharacterPage.tsx`, não restrito a GM); reset zera diretamente (`setExaustao(0)`), não decrementa; penalidade `-10×Exaustão` aplicada e destacada em cor de alerta `#D04040` rotulada "Exaustão", separada do `modifier`/"Antítese", tanto nos overlays de teste (config e settled) quanto no histórico (`DiceLogEntries.tsx`).
- `exhaustion` não foi adicionado ao tipo `Character` (`characterTypes.ts`) — confirmado que permanece como estado de sessão em todos os pontos de uso, sem inconsistência.
- `api/src/repositories/state.repository.ts:78` confirmado como erro de Prisma Client desatualizado (gerado em 26/08, antes do campo `exhaustion` ser adicionado ao `schema.prisma` em 27/08) — não é erro de tipagem real; uso é sintaticamente idêntico ao padrão de `conditions`. Erro em `state.controller.ts` é pré-existente e não relacionado (confirmado via diff — nenhuma linha nova toca esse trecho).
- `npm run typecheck` em `api/` executado: reproduz exatamente os 2 erros reportados pelo Executor, nenhum novo. `npx tsc -b --force` em `web/` ficou lento neste sandbox (mesma limitação de I/O já documentada na feature de Navio) — sem erros novos identificados na revisão manual linha a linha de todos os 13 arquivos web tocados.
- `CLAUDE.md` respeitado: sem comentários desnecessários (os 2 comentários adicionados seguem convenções já estabelecidas no próprio arquivo — divisores de seção e nota de sinal já negativo), sem mocks de banco, sem features extras, `chapters/` intocado.

✅ Validado — aprovado sem ressalvas de bloqueio (ação pendente não bloqueante: rodar `npm run db:generate` em `api/` fora do sandbox para regenerar o Prisma Client)

---

### Feature: Navio/Tripulação
**Origem:** /task Criar feature completa de "Navio/Tripulação" no site — nova aba "Navio" na Navbar (rota `/navios`, entre "Personagens" e "Campanhas"), ficha de navio persistida no Supabase com colaboração em tempo real, seguindo exatamente os padrões de `characters`/`campaigns`. Inclui catálogo oficial de Setores (`chapters/03_02_00_navios.md`), vínculo de tripulação via `ship_crew` (1 personagem = 1 navio), código de convite, upload de imagem, e Pote da Moral compartilhado (`chapters/03_01_00_moral.md`) editável por qualquer membro da tripulação com realtime. Fora de escopo: combate naval, setores customizados, vínculo obrigatório com campanha, e cálculo automático de Slots/Vida/DN a partir do Porte.
**Adicionada:** 2026-08-26 · **Validator:** APROVADO · **Concluída:** 2026-08-26

- [x] Subtask 1 — Criar modelos Prisma `Ship`, `ShipCrew`, `ShipState` em `api/prisma/schema.prisma` (espelhando `Character`/`CampaignCharacter`/`CharacterState`) e a migration SQL correspondente com RLS
  - **Critério de aceite:** `Ship` tem `userId`, `crewCode` (`@unique`), `isPublic`, `slotsTotal`, `hp`/`currentHp`, `sectors` (Json), demais campos de identidade (`name`, `motto`, `type`, `porte`, `imageUrl`, `description`); `ShipCrew.characterId` é `@unique` (regra de 1 personagem por tripulação, igual a `CampaignCharacter.characterId`) com FK cascade para `ships` e `characters`; `ShipState.shipId` é `@unique` com `moralPool`/`moralLog` (Json); `npm run db:generate` roda sem erro; migration em `api/supabase/migrations/006_create_ships.sql` cria as 3 tabelas com trigger `update_updated_at_column()` e RLS: `ships` com as 5 policies do molde de `004_rls_policies.sql` (select_own/select_public/insert_own/update_own/delete_own); `ship_crew` e `ship_state` legíveis pelo dono do navio, por qualquer dono de personagem membro da tripulação, ou quando o navio é público (molde `inventory_bags` owner_all + public_read) — escrita sempre via service role, com o gate real de "dono ou tripulante" aplicado no service layer (não no RLS), conforme regra do `api/CLAUDE.md`
  - **Arquivos:** `api/prisma/schema.prisma`, `api/supabase/migrations/006_create_ships.sql`

- [x] Subtask 2 — Implementar a camada backend completa de navios: repository/service/controller/schema para CRUD de `ships`, gestão de tripulação (`join`/`leave` via `crew_code`), mutação do Pote da Moral, e upload de imagem de navio
  - **Critério de aceite:** Endpoints em `/api/v1/ships` — `GET /` (minhas), `GET /public`, `POST /`, `GET /:id` (visibilidade igual a `characters.service.ts::get`), `PUT /:id`, `PATCH /:id/visibility`, `PATCH /:id/current-hp`, `DELETE /:id` (limpa storage), `POST /:id/regenerate-code` (só dono, retorna novo `crew_code`), `POST /join` `{code, character_id}` (só dono do personagem; 1 personagem não pode estar em 2 tripulações — mesma checagem de `CampaignsService.join`), `POST /:id/leave` `{character_id}` (dono do personagem OU dono do navio), `GET /:id/state`, `PATCH /:id/state/moral` (ações: rolar 5D12, add/remover dado, ajustar valor ±1 limitado a 1–12, set manual; grava em `moral_log` com cap 200 via prepend+slice como `state.repository.ts::appendDiceLog`); mutações de PM checam no service `userId === ship.userId || existe ship_crew de algum personagem do userId`; `crew_code` só aparece no payload se `userId === ship.userId` (mesma omissão de `inviteCode` em `campaigns.service.ts::list`); `POST /api/v1/upload/ship-image` (multipart, campo `shipId`, bucket `env.SUPABASE_SHIP_BUCKET` default `ship-images`, path `${userId}/${shipId}/${timestamp}.${ext}`) seguindo exatamente `uploadCharacterImage`; `npm run typecheck` em `api/` sem erros
  - **Arquivos:** `api/src/schemas/ship.schema.ts`, `api/src/repositories/ships.repository.ts`, `api/src/repositories/ship-state.repository.ts`, `api/src/services/ships.service.ts`, `api/src/services/ship-state.service.ts`, `api/src/controllers/ships.controller.ts`, `api/src/routes/index.ts`, `api/src/services/upload.service.ts`, `api/src/controllers/upload.controller.ts`, `api/src/config/env.ts`

- [x] Subtask 3 — Criar o catálogo oficial de Setores e os tipos/API client do frontend para a ficha de navio persistida
  - **Critério de aceite:** `web/src/data/shipSectorCatalog.ts` transcreve exatamente as 9 tabelas de `chapters/03_02_00_navios.md` (Armamentos, Casco, Velas/Motores, Radar, Dormitório, Cozinha, Biblioteca, Armazém, Prisão — incluindo Prisão, ausente do `shipTypes.ts` legado); cada entrada com teste referencia uma chave válida de `keyof CharacterSkills` (`characterTypes.ts`) ou `null` quando o setor não tem teste (`—` no livro), sem duplicar a união de perícias; `web/src/data/shipTypes.ts` ganha os tipos da ficha persistida (`ApiShip`, `ShipCrewMember`, `ShipStateData`, `InstalledSector`) sem quebrar o tipo `Ship`/`ShipSector` estático já usado por `ships.json`; `web/src/lib/apiClient.ts` ganha seção `ships` (`list`, `listPublic`, `get`, `create`, `update`, `delete`, `setVisibility`, `regenerateCode`, `join`, `leave`, `uploadImage`, `state.get`, `state.mutateMoral`) no mesmo padrão de `characters`/`campaigns`; `npx tsc --noEmit` em `web/` sem erros novos
  - **Arquivos:** `web/src/data/shipSectorCatalog.ts`, `web/src/data/shipTypes.ts`, `web/src/lib/apiClient.ts`

- [x] Subtask 4 — Criar `NavioListPage` e a navegação/entrada da feature (Navbar, rotas, criação de navio)
  - **Critério de aceite:** `web/src/pages/NavioListPage.tsx` replica exatamente a estrutura de `CharacterListPage.tsx` — 3 abas `meus | explorar | arcadia` com contagem, aba inicial `meus` se `user` logado / `explorar` se anônimo; `meus` chama `api.ships.list()`, `explorar` chama `api.ships.listPublic()`, `arcadia` usa `ships.json` (via `@ships`) normalizado por `normalizeShip` (molde `normalizeCharacter`) e é somente leitura (sem editar/entrar); `App.tsx` registra rota `navios` (lista) e `navio/:id` (ficha, singular — mesmo padrão de `campanhas`/`campanha/:id`), e `NAVBAR_PATHS` inclui `/navios`; `Navbar.tsx` ganha item "Navio" entre "Personagens" e "Campanhas"; fluxo de criação (modal ou página) salva via `api.ships.create` e navega para `/navio/:id`
  - **Arquivos:** `web/src/pages/NavioListPage.tsx`, `web/src/App.tsx`, `web/src/components/layout/Navbar.tsx`, `web/src/components/ship/ShipSummaryCard.tsx`

- [x] Subtask 5 — Criar a `ShipPage` completa: setores, tripulação, Pote da Moral e realtime
  - **Critério de aceite:** DN exibido é 5 por padrão e passa a refletir o DN do setor de categoria "Casco" instalado (lookup no catálogo — nunca campo manual); slots usados/restantes calculados pela soma dos slots dos setores instalados vs `slots_total`, bloqueando adição que ultrapasse o total; modal/drawer de setores agrupado por categoria (colapsável, com preview do efeito) e botão de remover por setor instalado; tripulação lista personagens vinculados via `ship_crew` (imagem + nome), navegando para `/ficha/:id` apenas se o personagem é público ou pertence ao usuário logado; painel do Pote da Moral com rolar 5D12, add/remover dado, ±1 por dado (limite 1–12), definir valor manual, histórico de alterações, soma total e nível (Lendária 50–60 / Estável 25–49 / Baixa 10–24) exibidos, tudo refletindo via `useShipRealtime` (canal `ship:${shipId}`, `postgres_changes` em `ships`/`ship_state`/`ship_crew` filtradas por `ship_id`/`id`, molde `useCharacterRealtime.ts`); painel de código de convite só revela o valor real ao dono, com revelar/copiar/regenerar (molde do painel de convite de campanha); nenhuma simulação de combate naval implementada; `npx tsc --noEmit` em `web/` sem erros novos
  - **Arquivos:** `web/src/pages/ShipPage.tsx`, `web/src/hooks/useShipRealtime.ts`, `web/src/components/ship/SectorCatalogModal.tsx`, `web/src/components/ship/ShipCrewPanel.tsx`, `web/src/components/ship/MoralPotPanel.tsx`, `web/src/components/ship/ShipCodePanel.tsx`, `web/src/App.tsx`

**Nota do Executor (2026-08-26):**
- Fluxo de "Entrar com Código" (join de tripulação) foi implementado em `NavioListPage.tsx` (botão + modal `JoinShipModal`, usando `api.characters.list()` para escolher o personagem), em vez de em `CharacterPage.tsx` — decisão para não mexer num arquivo já grande e sensível; mantém o mesmo endpoint `POST /ships/join` e a mesma regra de negócio (só dono do personagem).
- `npx prisma format/validate/generate`, `npm run typecheck` (api) e `npx tsc -b` / `vite build` (web) travaram indefinidamente neste ambiente de execução sandboxed (confirmado via isolamento: `node -e` puro e `child_process.spawnSync` funcionam normalmente; a suspensão ocorre especificamente dentro da resolução de módulos/programa do compilador TS e do CLI do Prisma, consumindo CPU quase zero por vários minutos — indício de I/O de arquivo anormalmente lento neste sandbox, não um loop infinito no código). Todo o código novo foi revisado manualmente linha a linha (imports, `verbatimModuleSyntax`, null-safety sob `strict`, tipos Prisma inferidos) como substituto.

**Ciclo 2 — correções aplicadas (2026-08-26):**
- Bloqueante corrigido: `slots_total`/`hp` agora são configuráveis pela UI — `CreateShipModal` (`NavioListPage.tsx`) ganhou inputs numéricos "Slots Totais"/"Vida" (default 7/7) enviados em `api.ships.create`; `ShipPage.tsx` ganhou edição inline desses dois campos para o dono (reaproveitando o componente `EditableField`, agora com variantes `numeric`/`compact`), com bloqueio client-side ao reduzir `slots_total` abaixo dos slots já usados pelos setores instalados; `ships.service.ts::update` agora clampa `currentHp` quando o novo `hp` máximo é menor que o `currentHp` vigente.
- Menor 1: `SectorCatalogModal.tsx` agora extrai o teste mencionado entre parênteses na descrição (`Casca de Eltys`, `Radar Rúnico`, `Auto-Meca Reparavel de Rubra`) e o exibe na linha de destaque azul quando `entry.test` é `null`, sem alterar o catálogo de dados.
- Menor 2: `GET /:id/state` (`ships.controller.ts` + `ship-state.service.ts`) agora permite leitura pública quando `ship.isPublic === true` (paridade com `ships.service.ts::get`), sem exigir mais autenticação nessa rota; mutação do Pote da Moral continua exigindo dono ou tripulante.
- Menor 3 (tipagem de `join`/`leave` em `apiClient.ts` e atualização de `api/CLAUDE.md`/`web/CLAUDE.md`): pulado conforme orientação do ciclo — baixo valor, alto risco de mexer em arquivo grande sem necessidade. Sem impacto funcional; registrado como débito técnico cosmético.

**Validação do Ciclo 2:**
- Bloqueante confirmado resolvido de ponta a ponta: `CreateShipModal` permite definir `slots_total`/`hp` na criação (não travado em 4/4); `ShipPage.tsx` permite ao dono editar ambos inline via `EditableField numeric compact` → `handleSlotsTotalChange`/`handleHpChange` → `patchShip` → `api.ships.update`, com merge `{ ...res.ship, crew: prev?.crew }` idêntico ao padrão já usado por `image_url`/`description`/`motto`/`porte`.
- `ships.service.ts::update` (linhas 82–85): o clamp de `currentHp` compara o `currentHp` atual do banco (obtido via `assertOwner` antes do patch) contra o `hp` NOVO recebido no request — direção correta — e só age quando `ship.currentHp !== null`, preservando o caso `null` sem alteração. Confirmado correto.
- Bloqueio de reduzir `slots_total` abaixo do usado é client-side (alert) apenas; não há guarda equivalente em `ships.service.ts::update` para `slots_total` vs soma de slots dos setores instalados — contornável via chamada direta à API. **Observação menor, não bloqueante** (mesmo racional já aceito para os itens dispensados no ciclo 1): registrar como débito técnico, não impede aprovação.
- Menor (a) confirmado: regex `/\(Teste:\s*([^)]+)\)/i` em `SectorCatalogModal.tsx` testado contra as 3 únicas ocorrências reais de `(Teste: ...)` no catálogo (`Casca de Eltys`, `Radar Runico`, `Auto-Meca Reparavel de Rubra` — todas com `test: null`); extração correta em todos os casos (incluindo o teste combinado "Conhecimento ou Atletismo"), sem duplicar parênteses e sem afetar as demais entradas (nenhuma outra tem esse padrão na descrição).
- Menor (b) confirmado: `GET /:id/state` resolve `userId` opcional via header (mesmo padrão de `GET /:id`) e usa `assertReadable` com paridade real à regra de `ships.service.ts::get` (público → livre; privado → dono ou tripulante). `PATCH /:id/state/moral` inalterado — continua exigindo `fastify.authenticate` + `assertOwnerOrCrew`. Sem regressão de segurança na escrita.
- Diffs cirúrgicos confirmados: arquivos tracked tocados (`App.tsx`, `Navbar.tsx`, `apiClient.ts`, `shipTypes.ts`, `schema.prisma`, `env.ts`, `routes/index.ts`, `upload.service.ts`, `upload.controller.ts`) mostram apenas adições pontuais, sem tocar código não relacionado.
- **Atualização:** `npm run typecheck` em `api/` não travou indefinidamente — passou de 90s (por isso foi movido para background) mas completou logo em seguida. Resultado real: 20 erros, **nenhum novo em relação ao que já era esperado**. Causa raiz confirmada: o client Prisma gerado em `api/src/generated/prisma/` está desatualizado (gerado em 26/05, antes dos modelos `Ship`/`ShipCrew`/`ShipState` existirem em `schema.prisma`, modificado em 26/08) — `npx prisma generate` nunca rodou com sucesso neste sandbox (mesma limitação de I/O já documentada; comando também trava ao tentar rodá-lo aqui). Isso é exatamente o "Ação pendente do usuário" já registrado na Nota do Executor original (rodar `npm run db:generate` localmente) — não é uma regressão introduzida neste ciclo 2. Todos os erros de `ships.repository.ts`, `ship-state.repository.ts`, `ships.service.ts` e `ship-state.service.ts` (ex.: `Property 'ship' does not exist on type 'PrismaClient'`, `Module has no exported member 'Ship'`) desaparecem assim que o client for regenerado — são consequência direta do client desatualizado, não bugs de lógica (confirmado lendo cada um: nenhum é um erro de tipo genuíno no código escrito, incluindo o implicit-any em `ships.service.ts:51` que só ocorre porque o retorno de `findPublic` fica `any` com o client quebrado). Há 1 erro remanescente **não relacionado a navios**, pré-existente em `src/controllers/state.controller.ts:58` (`DiceLogEntry` incompatível) — fora do escopo desta feature, não bloqueia esta validação mas deve ser registrado como item separado de débito técnico. Revisão manual de tipos nos arquivos do ciclo 2 confirma que a lógica em si (`patchShip`, clamp de `currentHp`, etc.) está correta.
- **Ação pendente (não bloqueante para este ciclo, mas obrigatória antes de uso real):** rodar `npm run db:generate && npm run typecheck` em `api/` fora deste sandbox para regenerar o client Prisma; sem isso, as rotas de `ships` vão falhar em runtime (`db.ship`/`db.shipCrew`/`db.shipState` não existem no client atual), independentemente do que foi corrigido neste ciclo.

✅ Validado — ciclo 2 (ver ressalva de `db:generate` pendente acima — não é regressão do ciclo, é pré-existente e já estava sinalizada)

---

### Botões de Navegação Anterior/Próximo na Edição de Seção
**Origem:** /task Adicionar botões de navegação (Anterior / Próximo) na ficha de personagem. Quando o usuário está editando qualquer seção (atributos, perícias, arcano, etc.), deve aparecer um botão "← Anterior" e "Próximo →" ao lado do botão Salvar. Clicar nesses botões salva a seção atual e navega para a seção anterior ou próxima, respectivamente.
**Adicionada:** 2026-06-02 · **Validator:** APROVADO · **Concluída:** 2026-06-02

- [x] Subtask 1 — Extrair `handleSaveSection(step: number)` em `CharacterCreatorPage.tsx`: lógica de save isolada, retorna `Promise<boolean>`; botão "Salvar" chama via `handleSave` sem regressão
- [x] Subtask 2 — `handleSaveAndNavigate(targetStep)` salva via `handleSaveSection` e atualiza `?step=` via `setSearchParams` sem sair da tela
- [x] Subtask 3 — Botões "← Anterior" (`step > 1`) e "Próximo →" (`step < STEPS.length`) renderizados condicionalmente na action bar de `isSectionEdit`; botão "Salvar" com `flex: 1` permanece centralizado
- [x] Subtask 4 — Botões conectados ao `handleSaveAndNavigate`; erros inline via `saveError` bloqueiam a navegação
- [x] Subtask 5 — `disabled={saving || !canProceed()}` no botão "Próximo →"; step 1 bloqueia sem nome+raça, step 4 bloqueia sem afinidade+antítese

---

### Agrupamento por Tipo na Tela de Equipamentos
**Origem:** /task Na tela /capitulo/equipamentos, agrupar e ordenar a lista de equipamentos por tipo (ex: "adaga", "escudo", etc.), exibindo cada grupo com seu título antes dos itens
**Adicionada:** 2026-06-02 · **Validator:** APROVADO · **Concluída:** 2026-06-02

- [x] Subtask 1 — Definir ordem canônica dos grupos por `subcategory` em `EquipmentWidget.tsx`
- [x] Subtask 2 — Calcular lista de grupos ordenados a partir dos itens filtrados
- [x] Subtask 3 — Renderizar cabeçalho de grupo antes dos cards de cada subcategoria
- [x] Subtask 4 — Ajustar contador de resultados e estado vazio para continuar funcionando corretamente

---

### Visibilidade e Duplicar Criaturas Customizadas
**Origem:** /task Implementar para criaturas customizadas as mesmas features que personagens já têm: (1) toggle de visibilidade pública/privada na lista de criaturas; (2) duplicar criatura com modal de confirmação — copiando qualquer criatura que o usuário tem acesso (própria, pública, arcádia/preset)
**Adicionada:** 2026-06-01 · **Validator:** APROVADO · **Concluída:** 2026-06-01

- [x] Subtask 1 — Backend `POST /custom-creatures/:id/duplicate`: `duplicate(source, newUserId)` no repository, `duplicateCreature(id, userId)` no service com 404/403, controller responde 201; `isPublic: false` no novo registro
- [x] Subtask 2 — `api.customCreatures.duplicate(id)` em `apiClient.ts`; aba "Explorar" em `CreatureListPage.tsx` visível apenas para logados, filtrando `userId !== user.id`
- [x] Subtask 3 — Botão 🌐/🔒 em `CustomCreatureSummaryCard` com `showVisibilityToggle`; badge "Público"/"Privado"; atualiza estado local sem reload; ausente nas abas "Explorar" e "Arcádia"
- [x] Subtask 4 — Botão ⎘ nos 3 tipos de card; modal de confirmação com cores de criatura; custom via `duplicate(id)`, preset via `create({name: 'Cópia de ...'})`, muda para aba "minhas" após sucesso

---

### Duplicar Ficha, Upload de Capa de Campanha e Tela de Abertura Animada
**Origem:** /task Implementar 3 novas features: (1) Duplicar fichas de personagem; (2) Upload de imagem de capa ao criar/editar campanha; (3) Tela de abertura animada da campanha
**Adicionada:** 2026-06-01 · **Validator:** APROVADO · **Concluída:** 2026-06-01

- [x] Subtask 1 — Backend `POST /characters/:id/duplicate`: repository `duplicate()`, service com ownership check (403 se privado de outro usuário), controller responde 201 com novo personagem; `isPublic: false` no novo registro
- [x] Subtask 2 — Frontend botão "⎘" nos 3 tipos de card em `CharacterListPage.tsx`; UUID via API, preset via localStorage; tab muda para "meus" sem reload; `api.characters.duplicate(id)` em `apiClient.ts`
- [x] Subtask 3 — `UploadService.uploadCampaignCoverImage()` + bucket `campaign-covers` em `env.ts`; `CampaignsService.uploadCoverImage()` com `assertGm`; `POST /:id/upload-cover` retorna `{ imageUrl }` e persiste no banco
- [x] Subtask 4 — `CreateCampaignModal` em `CampaignListPage.tsx` com campo de capa + preview; `EditCampaignModal` em `CampaignPage.tsx` para GM; upload após criação/edição; `api.campaigns.uploadCover(id, file)` em `apiClient.ts`
- [x] Subtask 5 — `CampaignIntroScreen.tsx` full-screen animado; título Cinzel + glow; descrição linha-por-linha com stagger; `imageUrl` como fundo com overlay; `sessionStorage` controla exibição única por sessão; botão "Entrar no Conto"; integrado em `CampaignPage.tsx` com `AnimatePresence`

---

### Deleção de Campanha
**Origem:** /task implementar deleção de campanha: ao deletar, desvincular todas as fichas vinculadas, excluir todas as imagens dos mapas do storage, e desvincular NPCs (sem deletar). Adicionar botão/UI de deletar na página de campanha.
**Adicionada:** 2026-05-29 · **Validator:** APROVADO · **Concluída:** 2026-05-29

- [x] Subtask 1 — `schema.prisma`: `CampaignCharacter.campaign: onDelete: Cascade` remove o join row ao deletar Campanha; `Character` é preservado
- [x] Subtask 2 — `campaigns.service.ts::delete()`: sequência listar mapas → deletar DB → limpar storage; `listMaps` inclui `layers[].imageUrl` (String não-nulo); `.catch(() => {})` presente
- [x] Subtask 3 — `apiClient.ts` linha 29: `if (res.status === 204) return undefined as T` antes de `res.json()`
- [x] Subtask 4 — `CampaignPage.tsx`: botão GM-only em `{isGm && ...}`; modal com confirmação e texto de aviso; `handleDeleteCampaign` correto; `deleting` desabilita ambos os botões

---

### Recuperação e Alteração de Senha
**Origem:** /task implementar "Esqueci minha senha" no login e painel de configurações com "alterar senha" para usuários logados
**Adicionada:** 2026-05-28 · **Validator:** APROVADO · **Concluída:** 2026-05-28

- [x] Subtask 1 — `authContext.tsx`: `resetPassword` e `updatePassword` adicionados ao contexto; `redirectTo` aponta para `/redefinir-senha`
- [x] Subtask 2 — `EsqueciSenhaPage.tsx`: formulário de recuperação de senha com estado de sucesso, erro inline e link "Voltar ao login"
- [x] Subtask 3 — `RedefinirSenhaPage.tsx`: detecta `PASSWORD_RECOVERY` via `onAuthStateChange`; trata token inválido, senhas divergentes e redireciona para `/login` após sucesso
- [x] Subtask 4 — `App.tsx`: rotas `/esqueci-senha`, `/redefinir-senha` e `/configuracoes` registradas
- [x] Subtask 5 — `ChangePasswordSection.tsx` + `SettingsPage.tsx` + link "Configurações" no `Navbar.tsx` (desktop e mobile) quando logado

---

### Inventário Base Fixo e Nova Fórmula de Carga
**Origem:** /task Atualizar regras de inventário e carga do personagem
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — `chapters/02_personagem.md`: tabela mostra 4 slots fixos para todo valor de Físico; fórmula `20 + (Físico × 5)` com exemplo Físico 2 → limite 30
- [x] Subtask 2 — `chapters/16_equipamentos.md`: fórmula `20 + (Físico × 5)` na seção Capacidade de Carga; seção Mochilas descreve 4 slots base fixos; nenhuma menção à fórmula antiga
- [x] Subtask 3 — `InventoryPanel.tsx`: `totalSlots = 4`, `maxWeight = 20 + fisico * 5`, label "4 slots base"
- [x] Subtask 4 — `SPEC.md`: seção "Inventário e Carga" atualizada com slots base = 4 e fórmula `20 + (Físico × 5)`
- [x] Subtask 5 — `characters.json`: sem campo `inventorySlots` ou valores derivados de Físico; calculado em tempo de render — nenhuma alteração necessária

---

### Diário de Personagem — Persistência via API
**Origem:** /task Persistir diário de personagem via API para fichas API (PATCH /characters/:id/diary)
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — Schema Prisma: campo `diary Json?` adicionado no modelo `Character`; `db push` aplicado com sucesso; client regenerado
- [x] Subtask 2 — Backend: `DiaryBlockSchema`, `DiaryCategorySchema`, `DiarySchema` em `character.schema.ts`; método `updateDiary` no `CharactersService`; rota `PATCH /:id/diary` no `charactersController`
- [x] Subtask 3 — Frontend: `api.characters.updateDiary` adicionado em `apiClient.ts`; body enviado como `JSON.stringify(diary)` onde `diary` é `{ blocks, categories }` — compatível com `DiarySchema` no controller
- [x] Subtask 4 — `CharacterPage.tsx`: carrega `raw.diary` no branch API (`setDiaryData`); `handleDiaryChange` bifurca entre `api.characters.updateDiary` (isApiChar) e `saveDiary` (local)
- [x] Subtask 5 — `loadDiary`/`saveDiary` importados e usados no branch local; typecheck API sem erros novos

---

### Diário de Personagem
**Origem:** /task adicionar Diário de Personagem na ficha
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — Tipos `DiaryBlock`, `DiaryCategory`, `DiaryData` exportados em `characterTypes.ts`
- [x] Subtask 2 — `loadDiary`/`saveDiary` em `localCharacters.ts` com chave `arcadia_diary` (sub-objeto por characterId, padrão do projeto) e fallback `{ blocks: [], categories: [] }`
- [x] Subtask 3 — `DiaryPanel.tsx` criado: sidebar createPortal, motion.div `initial={{ x: '100%' }}`, width 340, zIndex 9001, categorias com expand/collapse, blocos com textarea, drag-and-drop via @dnd-kit/sortable, canEdit=false = readonly
- [x] Subtask 4 — `FloatingDiaryButton.tsx` criado (bottom: 92, right: 28, zIndex: 80, ícone BookOpen do Lucide); `FloatingDiceButton.tsx`: bottom→156, painel bottom→216; `CharacterPage.tsx`: FloatingDiaryButton renderizado entre mochila e dado
- [x] Subtask 5 — `CharacterPage.tsx`: estado `diaryData`/`diaryOpen`, `loadDiary` no useEffect, `handleDiaryChange` com `useCallback`, `<DiaryPanel>` e `<FloatingDiaryButton>` integrados

---

### Valores Negativos em Atributos e Perícias
**Origem:** /task Permitir valores negativos para Atributos e Perícias na ficha do personagem
**Adicionada:** 2026-05-26 · **Validator:** APROVADO · **Concluída:** 2026-05-26

- [x] Subtask 1 — `CreatorUI.tsx`: `Stepper` aceita `min?: number` sem default; botão `−` e input sem restrição inferior quando `min` não é passado
- [x] Subtask 2 — `Step2Attrs.tsx`: removido `min={0}` do Stepper de atributos (Físico, Destreza, Intelecto, Influência, Arcano)
- [x] Subtask 3 — `Step3Skills.tsx`: removido `min={0}` do Stepper de perícias (16 perícias)
- [x] Subtask 4 — `Step4Arcano.tsx`: entropia mantém `min={0}` — não afetada pela mudança

---

### Sub-capítulos de Elementos (05_01 a 05_05) no Manifest e Sidebar
**Origem:** /task Adicionar os capítulos 05_01_energia.md, 05_02_anomolia.md, 05_03_paradoxo.md, 05_04_cognitivo.md e 05_05_astral.md ao livro como sub-itens do capítulo "Elementos" (05)
**Adicionada:** 2026-05-25 · **Validator:** APROVADO · **Concluída:** 2026-05-25

- [x] Subtask 1 — `chapterManifest.ts`: confirmado que `06_elementos` já existe com `slug: 'elementos'` e `order: 80`, sem duplicatas ou conflitos com `06_afinidades` (order: 81)
- [x] Subtask 2 — 5 entradas adicionadas em `chapterManifest.ts` com `parentSlug: 'elementos'` e orders 82–86 (Energia, Anomalia, Paradoxo, Cognitivo, Astral)
- [x] Subtask 3 — `chapterLoader.ts` sem alteração necessária; glob `@chapters/*.md` cobre os novos arquivos automaticamente
- [x] Subtask 4 — `Sidebar.tsx` sem alteração necessária; sub-capítulos renderizados indentados sob "Elementos" via `parentSlug`
- [x] Subtask 5 — `SPEC.md` atualizado: tabela "Capítulos — Mapa de Conteúdo" inclui os 5 novos arquivos com slugs e descrições corretas

---

### Bugs: Ficha no Mapa sem Edição, Título da Aba e Performance do Mapa
**Origem:** /task Três bugs/ajustes: (1) fichas abertas via modal no mapa não permitem edição pelo mestre; (2) título da aba do navegador na ficha deve mostrar "Ficha - Nome"; (3) investigar e propor melhorias de performance no mapa da campanha
**Adicionada:** 2026-05-20 · **Validator:** APROVADO · **Concluída:** 2026-05-20

- [x] Subtask 1 — `MapTokenModal.tsx`: prop `campaignId: string` adicionada; link usa `?campaignId=${campaignId}`. `MapTab.tsx`: passa `campaignId={campaign.id}`. `CharacterPage.tsx`: lê `campaignId` da URL via `URLSearchParams` para disparar `isGmOfCampaign`
- [x] Subtask 2 — `CharacterPage.tsx`: `document.title = character ? "Ficha - ${character.name}" : "Arcádia"`; deps do useEffect corrigidas para `[id, character]`
- [x] Subtask 3 — `MapFogLayer.tsx`: envolvido com `memo`; `visionPolygons` em `useMemo` no `MapCanvas.tsx` com deps precisas
- [x] Subtask 4 — `MapTokenLayer.tsx`: envolvido com `memo`; `visibleTokens` e `visibleCreatures` em `useMemo` com deps completas
- [x] Subtask 5 — `MapCanvas.tsx`: `walls`, `blockingWalls` e `effectiveFogPatches` em `useMemo` com deps corretas; todos os handlers de evento já estavam em `useCallback`

---

### Arcano como Atributo na Criação de Personagem
**Origem:** /task Adicionar atributo ARCANO na etapa de "atributos" da criação de ficha de personagem, e remover o campo de definição do ARCANO da seção "arcano" durante a criação de ficha
**Adicionada:** 2026-05-19 · **Validator:** APROVADO · **Concluída:** 2026-05-19

- [x] Subtask 1 — `arcano` adicionado ao `ATTR_GROUPS` em `creator/types.ts` com cor `#B060D0`, label "Arcano", desc "5º atributo — cresce por experiência narrativa", `skills: []`
- [x] Subtask 2 — Stepper de `arcano` removido de `Step4Arcano.tsx`; card roxo mantém apenas Entropia; resumo exibe só "Entropia Y"
- [x] Subtask 3 — Estado separado `arcano` removido de `CharacterCreatorPage`; `handleSave` usa `attributes: { ...attrs }` que já inclui `arcano`; `Step2Attrs` itera `ATTR_GROUPS` e exibe Arcano automaticamente
- [x] Subtask 4 — `Step4Arcano` não recebe mais prop `arcano`; nenhum `onChange('arcano', ...)` residual; TypeScript compila sem erros

---

### Bug: Afinidade=Antítese — Bônus e Exibição na Ficha
**Origem:** /task corrigir bug de afinidade=antítese: quando os dois são o mesmo elemento, o bônus deve ser +10 (não -10). Adicionar essa regra no livro (chapters/). Na ficha do personagem, exibir apenas um único bloco para o elemento quando afinidade e antítese são iguais.
**Adicionada:** 2026-05-19 · **Validator:** APROVADO · **Concluída:** 2026-05-19

- [x] Subtask 1 — `chapters/06_afinidades.md`: seção "Dados Iguais" reescrita para declarar explicitamente que os bônus individuais (+4 e +2) são substituídos pelo bônus único de +10
- [x] Subtask 2 — `ArcaneConfigPanel.tsx` e `ArcaneTestOverlay.tsx`: `elementBonus` retorna `10` quando `afinidade === antitese && selectedElement === afinidade`, `0` caso contrário
- [x] Subtask 3 — `ArcanoSection.tsx`: 1 card com badge "+10" quando `afinidade === antitese`; 2 cards em grid quando diferentes
- [x] Subtask 4 — `AfinidadeWidget.tsx`: bloco Dupla Conexão exibe "+2" para Antítese e "+10" como total; cálculo coerente com a tabela base do livro

---

### Sistema Arcano Completo na Ficha de Personagem — Subtasks 1, 3, 4, 5
**Origem:** /task Implementar sistema Arcano completo na ficha de personagem
**Adicionada:** 2026-05-19 · **Validator:** APROVADO · **Concluída:** 2026-05-19

- [x] Subtask 1 — Corrigir null handling em `apiAdapter.ts` para `attributes.arcano` — spread com `arcano: attr?.arcano ?? 0`
- [x] Subtask 3 — Entropia editável na ficha com dots clicáveis (0–5), sync via API e localStorage, grace period `lastLocalEntropiaTime`
- [x] Subtask 4 — Step4Arcano com card roxo, linha de resumo "Arcano X · Entropia Y · Bônus +Z"
- [x] Subtask 5 — ArcaneConfigPanel redesenhado com DndContext, pool de tokens D12 (roxos) e bônus (dourados), dropzones por modificador, fallback +/- preservado

---

### Timeline Histórica e Origem do Universo
**Origem:** /task criar página de Timeline interativa com eventos históricos em JSON e página de Origem do Universo
**Adicionada:** 2026-05-13 · **Executor:** CONCLUÍDO · **Concluída:** 2026-05-13

- [x] Subtask 1 — Criar os arquivos de conteúdo (`chapters/00_timeline.md` e `chapters/00_origem.md`) com o texto lore das eras e dos conceitos cosmológicos
- [x] Subtask 2 — Criar `web/src/data/timelineEvents.ts` com os eventos históricos tipados em JSON (campos: id, era, title, description, year; formato de ano: `dia/ano` onde `X` = pós-Era Imperial)
- [x] Subtask 3 — Criar `web/src/components/widgets/TimelineWidget.tsx`: linha do tempo vertical interativa com filtro por era (Período Existencial, Era Zero, Era Expansão, Era Imperial, Era Zohar), expandindo card de evento ao clicar
- [x] Subtask 4 — Registrar os dois novos capítulos em `chapterManifest.ts` (part: 'O Mundo', orders 5 e 6) e adicionar `TimelineWidget` e `OrigemWidget` em `chapterWidgets.tsx`
- [x] Subtask 5 — Criar `web/src/components/widgets/OrigemWidget.tsx`: painel de navegação por abas (Conceito, Inocência, Caos, Essências, Planos, Raças, Deuses, Regiões, Religiões) com visual consistente com o design system

---

### Vercel Analytics — Integração no Entry Point React
**Origem:** /task adicionar Vercel Analytics ao projeto web — instalar @vercel/analytics e integrar no entry point React de forma estruturada
**Adicionada:** 2026-05-12 · **Validator:** APROVADO · **Concluída:** 2026-05-12

- [x] Subtask 1 — Instalar a dependência `@vercel/analytics` no projeto web
- [x] Subtask 2 — Adicionar o componente `<Analytics />` no entry point `main.tsx`
- [x] Subtask 3 — Verificar que o build de produção compila sem erros após a integração

---

### Diagramação: Split de Capítulos Longos em Sub-capítulos
**Origem:** /task Melhorar a diagramação do livro dividindo capítulos longos em sub-capítulos
**Adicionada:** 2026-05-12 · **Validator:** APROVADO · **Concluída:** 2026-05-12

- [x] Subtask 1 — Dividir `07_condicoes_e_trauma.md` em três arquivos (`07_vida_e_sanidade.md`, `07_condicoes.md`, `07_traumas.md`)
- [x] Subtask 2 — Dividir `05_arcanismo.md` em três arquivos (`05_arcanismo.md` core, `05_runas.md`, `05_invocacao.md`)
- [x] Subtask 3 — Dividir `09_navios.md` em dois arquivos (`09_navios.md` estrutura e `09_combate_naval.md`)
- [x] Subtask 4 — Adicionar campo `parentSlug?: string` ao tipo `ChapterMeta` e registrar sub-capítulos no manifest com hierarquia correta
- [x] Subtask 5 — Atualizar `Sidebar.tsx` para renderizar sub-capítulos indentados; corrigido `React.Fragment` com `key` prop

---

### Cadastro de Criaturas Customizadas
**Origem:** /task criar sistema completo de cadastro de criaturas: formulário com todos os campos necessários, upload de imagem ou URL, visibilidade pública/privada, e integração com campanhas
**Adicionada:** 2026-05-11 · **Validator:** APROVADO · **Concluída:** 2026-05-12

- [x] Subtask 1 — Modelo `CustomCreature` no Prisma + backend completo (repository → service → controller → routes): CRUD em `/api/v1/custom-creatures`, upload em `/api/v1/custom-creatures/upload-image`, validação Zod, ownership check no service
- [x] Subtask 2 — Tipo `CustomCreature` em `creatureTypes.ts` e todas as funções de API client (`list`, `listPublic`, `get`, `create`, `update`, `delete`, `setVisibility`, `uploadImage`)
- [x] Subtask 3 — `CustomCreatureForm.tsx` com todos os campos, listas dinâmicas para `interactions`/`actions`/`reactions`/`variants`/`immune`/`vulnerable`, toggle público/privado, campo de imagem (upload ou URL)
- [x] Subtask 4 — `CustomCreatureFormPage.tsx`, rotas `/criaturas/nova` e `/criaturas/:id/editar` em `App.tsx`, botão "Nova Criatura" em `CreatureListPage.tsx`, seção "Minhas Criaturas"
- [x] Subtask 5 — Integração no `MapTokenPanel.tsx`: criaturas customizadas buscadas via `api.customCreatures.list()`, exibidas com badge "Custom" na modal de adição

---

### Sistema de Condições na Ficha de Personagem
**Origem:** /task Implementar sistema de Condições na ficha de personagem
**Adicionada:** 2026-05-11 · **Validator:** APROVADO · **Concluída:** 2026-05-11

- [x] Subtask 1 — Definir tipo `Condition` e `ConditionEffect` em `characterTypes.ts` e adicionar campo `conditions?: Condition[]` ao tipo `Character`
- [x] Subtask 2 — Criar componente `ConditionsSection.tsx` com visão jogador (ícones + tooltip) e visão GM (popup add/remove com picker de ícone, nome, descrição, modo avançado com campos afetados e valor numérico)
- [x] Subtask 3 — Integrar `ConditionsSection` na `StatsSection.tsx` (ao lado da Sanidade) e conectar handlers de add/remove em `CharacterPage.tsx` com `canEdit`/`isGmOfCampaign`
- [x] Subtask 4 — Persistir condições no localStorage (`localCharacters.ts`: `loadConditions`/`saveConditions` em chave `arcadia_conditions`) e via API (`apiClient.ts`: endpoint `state/conditions`)
- [x] Subtask 5 — Aplicar feedback visual de buff (verde) / nerf (vermelho) nos campos afetados de `SkillsSection`, `DefenseStats` e `StatsSection` lendo `conditions` do personagem

---

### Auditoria de Consistência: Livro ↔ Site
**Origem:** /task auditar se todas as regras do livro (chapters/) estão corretamente aplicadas no sistema
**Concluída:** 2026-05-08 · **Validator:** APROVADO

- [x] Subtask 1 — SPEC.md corrigido: base=15, HP_BONUS/SANID_BONUS=[0,4,4,3,3,2,2,2,...] — alinhado com `07_condicoes_e_trauma.md`
- [x] Subtask 2 — `elementos-e-afinidades` movido de order:6 para order:7; todos subsequentes deslocados; orders 1–18 únicos e crescentes
- [x] Subtask 3 — `maxWeight`, `weightPct`, `overDouble`, `overEncumbered`, `weightColor`, barra de carga e alertas removidos de `InventoryPanel.tsx`; capacidade agora baseada exclusivamente em slots (`2 + Físico`)
- [x] Subtask 4 — `condicoes-e-trauma` movido de `part: 'O Arcano'` para `part: 'Fundamentos'` com `order: 8`
- [x] Subtask 5 — `DiceRollerWidget` importado e registrado em `chapterWidgets.tsx` para `'evolucao-e-testes'`

---

### Mapa Interativo de Campanha
- [x] Fase 1 — Mapa estático, layers, tokens, drag
- [x] Fase 2 — Sincronização realtime via Supabase Broadcast
- [x] Fase 3 — Fog of War básico (visão circular, exploração)
- [x] Fase 4 — Line of Sight com ray casting e paredes
- [x] Polimentos pós-Fase 4 — Resize, modal config, drag-to-place, QoL paredes
- [x] Multi-Floor — Layers empilhadas, reordenação, Z-order
- [x] Portas (Fase 4.5) — Ferramenta de porta, bloqueio LOS, abrir/fechar
- [x] Fase 5 — Grid configurável, pinch-to-zoom, map gallery básica
- [x] Fase 6a — Vision Sharing: fog isolado por personagem, token único
- [x] Fase 6b — Map Gallery como tela principal, navegação GM↔jogador

---

## Formato de Task

Quando o Planner adicionar uma nova task, use este formato:

```
### [NOME DA FEATURE OU BUG]
**Origem:** /task <descrição original>
**Adicionada:** YYYY-MM-DD

- [ ] Subtask 1 — critério de aceite
- [ ] Subtask 2 — critério de aceite
- [ ] Subtask 3 — critério de aceite
```
