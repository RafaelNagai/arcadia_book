import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Data ───────────────────────────────────────────────────────── */

interface TabContent {
  id: string
  label: string
  title: string
  body: string[]
}

const TABS: TabContent[] = [
  {
    id: 'conceito',
    label: 'Conceito',
    title: 'O Conceito',
    body: [
      'No início, o universo não existia de forma definida. Quando ele duvidou de sua própria existência, um Conceito emergiu para se nomear e se definir.',
      'Nomear é criar — e ao se nomear, o Conceito trouxe o universo à existência. Para se compreender, o Conceito precisou identificar suas próprias essências. Esse processo foi a origem de tudo que existe em Arcádia.',
      'O Conceito não é uma entidade com vontade consciente no sentido humano — é uma força cosmológica, a própria ideia de existir transformada em presença.',
    ],
  },
  {
    id: 'inocencia',
    label: 'Inocência',
    title: 'A Essência da Inocência',
    body: [
      'A primeira essência criada foi a Inocência — o sentimento puro de querer conhecer a si mesmo.',
      'O Conceito procurava e procurava em si algo para nomear. Sem encontrar nada, mas sem perceber, sua própria vontade criou o Caos. A insistência de preencher o vazio encontrou algo — e esse encontro iniciou o ciclo que daria origem a tudo.',
      'Inocência não é ingenuidade. É o impulso original de explorar, de perguntar, de não aceitar o vazio como resposta. Ela é a força que move mundos antes mesmo de existirem mundos para se moverem.',
    ],
  },
  {
    id: 'caos',
    label: 'Caos',
    title: 'A Essência do Caos',
    body: [
      'O Caos representa Inovação, Evolução e Expansão.',
      'Emergido da insistência da Inocência, o Caos preencheu os planos criados, desenvolveu e retornou tudo para atender à Inocência — criando um ciclo infinito de expandir e criar.',
      'O Caos não é destruição: é a força que transforma o vazio em possibilidade, que pega o rascunho inacabado e o molda em algo concreto. Os Deuses que surgiriam depois buscariam representar fisicamente o que o Caos é naturalmente.',
    ],
  },
  {
    id: 'essencias',
    label: 'Essências',
    title: 'As Essências',
    body: [
      'As Essências são forças naturais que regem o universo de Arcádia.',
      'Inocência e Caos são as duas essências primordiais — mas delas derivam todas as outras forças que moldam o mundo: a magia, os elementos, a fé, a separação entre raças e culturas.',
      'Compreender as essências é compreender a lógica por trás da existência. Arcanistas avançados estudam essa estrutura para compreender de onde vem o poder arcano e por que ele se manifesta de formas tão diferentes em pessoas diferentes.',
    ],
  },
  {
    id: 'planos',
    label: 'Planos',
    title: 'Os Cinco Planos',
    body: [
      'O Caos e a Inocência criaram cinco planos de existência:',
      'Plano Infinito — O plano material: onde todos vivem, respiram e existem. Fragnéia está contido aqui.',
      'Rede dos Sonhos — Todo o conhecimento acumulado por pessoas vivas e mortas se preserva aqui. Arcanistas de tradições antigas buscam acessar esse plano para encontrar sabedorias perdidas.',
      'Rede das Almas — Um plano de memória conectada. Toda memória existente está armazenada aqui. As almas se conectam entre si de formas que os vivos raramente compreendem.',
      'Reino das Almas — Para onde vão os mortos. Espectros que permanecem por tempo excessivo se corrompem, fundindo-se ao próprio plano e perdendo qualquer identidade que tiveram em vida.',
      'Mundo das Tintas — Um plano de rascunhos e definições, onde todo conceito é formado antes de se tornar real. Emoções e intenções se manifestam como cores.',
    ],
  },
  {
    id: 'racas',
    label: 'Raças',
    title: 'Origem das Raças',
    body: [
      'A primeira raça inteligente a existir em Fragnéia foram os Elfos — chamados de Raça Zero. Imortais, hermafroditas, de pele branca e orelhas pontudas. Crescem normalmente até a maturidade, então param de envelhecer.',
      'Os Elfos, movidos pela curiosidade, criaram outras raças: Humanos, Orcs e Avaros. Anões surgiram como derivação dos Elfos — estatura baixa, intelecto avançado, pelos abundantes.',
      'Quando ocorreu o primeiro conflito entre indivíduos, surgiu o conceito de separação. O Caos respondeu: para cada grupo dividido, individualidades únicas se desenvolveram — acelerando o surgimento das raças distintas que habitam Fragnéia.',
      'Durante a Guerra Imperial, um ritual élfico fracassado destruiu uma cidade inteira. Os poucos sobreviventes tiveram suas peles tingidas de azul-escuro ou cinzento — tornando-se os Elfos Noturnos.',
    ],
  },
  {
    id: 'deuses',
    label: 'Deuses',
    title: 'Os Deuses de Arcádia',
    body: [
      'Os Deuses surgiram do conceito de fé — seres que buscaram representar fisicamente o que o Caos é por natureza. São entidades reais, não metáforas.',
      'Alfa — Deus da Arte, Evidência e Luz. Alfa representa a ideia de que a existência é uma obra de arte em constante criação, e que cada indivíduo carrega uma parte dessa obra. É o alimentador da Ação.',
      'Beta — Deus do Equilíbrio, Justiça e Ória. Beta administra e recebe. Crê que as ações de todos estão interligadas — e que o equilíbrio é o estado natural a que o universo retorna, inevitavelmente.',
      'Gama — Deusa da Aprendizagem, Inovação e Cultura. A maior das divindades em escala, raramente manifesta de forma direta. Cuida do que persiste: o conhecimento que sobrevive às gerações. É a alimentadora da Evolução.',
    ],
  },
  {
    id: 'regioes',
    label: 'Regiões',
    title: 'As Regiões de Fragnéia',
    body: [
      'Union — Planícies extensas com sistema agrícola desenvolvido a duras penas. Cidades em terrenos firmes ou flutuando sobre rios. Conhecida por acolher qualquer raça.',
      'Britannia — Montanhas profundas e penhascos. Comércio legalizado e forte. Predominantemente habitada por Orcs, Anões e Avaros. Os viajantes se movem na vertical, pelos penhascais.',
      'Nobre — País natal dos Anões. Cidades subterrâneas e sistemas de dunas que apenas os locais sabem navegar.',
      'Canelot — Outrora o império mais poderoso de Arcádia. Cada habitante deve, ao atingir a maturidade, cavar seu próprio caminho. Toda riqueza dentro de um duto escavado pertence ao seu dono.',
      'Galahad — Região de abundância agrícola. Sociedade dividida em Alta Escala e Baixa Escala — o número herdado determina posição social. Quanto maior o número, mais influente.',
      'Nubra — Vasto deserto com morros de pedras preciosas. Calor extremo de dia, frio extremo de noite. Uma sociedade solidária onde riqueza é compartilhada. Tecnologia baseada em engenharia, não em magia.',
    ],
  },
  {
    id: 'religioes',
    label: 'Religiões',
    title: 'As Três Religiões',
    body: [
      'Alfalismo — "A luz que nos ilumina, nos temos iluminar." Acredita que toda a criação foi obra de Alfa. Seus seguidores veem atos de criação como atos de resistência contra a destruição — pois houve um irmão de Alfa que tentou destruir tudo que foi criado.',
      'Betaísmo — "Somos filhos do passado, irmãos do presente e condenados ao futuro." Acredita que todos somos parte de um sistema revelado por Beta. Beta vê os seres como defeitos funcionais — cada um com suas falhas, mas cada falha sendo parte necessária do todo.',
      'Gamaísmo — "A luz que guia os criadores." Acredita que fracassar é sinal de que fomos criados por algo ainda mais imperfeito — e que isso é razão para evoluir. Gama, filha de Alfa e Beta, é a única capaz de continuar o legado de cuidar do universo.',
    ],
  },
]

/* ─── Main Widget ────────────────────────────────────────────────── */

export function OrigemWidget() {
  const [activeId, setActiveId] = useState<string>('conceito')

  const active = TABS.find(t => t.id === activeId)!

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ background: 'var(--color-deep)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <span style={{ color: 'var(--color-arcano)', fontSize: '1.1rem' }}>✦</span>
        <div>
          <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-arcano-glow)' }}>
            Origem do Universo
          </h3>
          <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--color-text-muted)' }}>
            Selecione um conceito cosmológico para explorar
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex flex-wrap gap-1 px-5 pt-4 pb-0 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {TABS.map(tab => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className="px-3 py-2 text-xs font-ui font-semibold rounded-t transition-all duration-150 border-x border-t relative"
              style={{
                background: isActive ? 'var(--color-surface)' : 'transparent',
                borderColor: isActive ? 'var(--color-arcano)' : 'transparent',
                color: isActive ? 'var(--color-arcano-glow)' : 'var(--color-text-muted)',
                marginBottom: isActive ? '-1px' : 0,
                zIndex: isActive ? 1 : 0,
                borderBottomColor: isActive ? 'var(--color-surface)' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="p-5 space-y-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <h4
            className="font-display font-bold text-lg"
            style={{ color: 'var(--color-arcano-glow)' }}
          >
            {active.title}
          </h4>
          <div className="space-y-3">
            {active.body.map((paragraph, i) => (
              <p
                key={i}
                className="text-sm font-body leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
