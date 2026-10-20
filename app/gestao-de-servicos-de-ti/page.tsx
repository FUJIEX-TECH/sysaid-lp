import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gestão de Serviços de TI: Processos, ITIL 4 e Como Implantar | SysAid Brasil",
  description:
    "Gestão de serviços de TI na prática: a cadeia de valor e as quatro dimensões da ITIL 4, as práticas que toda operação precisa, o que mudou desde a ITIL v3 e um roteiro de implantação em cinco passos.",
  alternates: { canonical: "/gestao-de-servicos-de-ti" },
  openGraph: {
    title: "Gestão de Serviços de TI: Processos, ITIL 4 e Como Implantar",
    description:
      "Cadeia de valor e dimensões da ITIL 4, práticas essenciais, ITIL v3 × ITIL 4 e um roteiro de implantação em cinco passos.",
    locale: "pt_BR",
    type: "article",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const NOMES = [
  {
    t: "Gestão de serviços de TI",
    d: "A forma mais comum em português. É a disciplina que organiza como a área de TI entrega valor ao negócio na forma de serviços, com processos, prazos e qualidade medida.",
  },
  {
    t: "Gerenciamento de serviços de TI",
    d: "Tradução alternativa do mesmo conceito, frequente em livros, apostilas e na literatura acadêmica brasileira. Gestão e gerenciamento aqui são sinônimos: não há diferença técnica entre os dois.",
  },
  {
    t: "ITSM / IT Service Management",
    d: "A sigla em inglês de Information Technology Service Management, usada pelo mercado de software e pelas certificações. É o termo que você vai encontrar ao pesquisar ferramentas.",
  },
  {
    t: "GSTI",
    d: "A sigla em português, comum em concursos, disciplinas de graduação e órgãos públicos. Administração de serviços de TI também aparece com o mesmo sentido em editais e ementas.",
  },
];

const ESTAGIOS = [
  {
    n: "01",
    t: "Estratégia de serviço",
    d: "Definir quais serviços a TI oferece, para quem, a que custo e com qual retorno. É onde o catálogo nasce como decisão de negócio, não como lista técnica.",
  },
  {
    n: "02",
    t: "Desenho de serviço",
    d: "Projetar cada serviço antes de ele existir: níveis de serviço, capacidade, disponibilidade, continuidade e fornecedores envolvidos.",
  },
  {
    n: "03",
    t: "Transição de serviço",
    d: "Levar o serviço do papel para a operação com gestão de mudanças, testes, e a base de configuração que documenta o que foi para o ar.",
  },
  {
    n: "04",
    t: "Operação de serviço",
    d: "O dia a dia: atender incidentes e requisições, cumprir SLA, operar o service desk. É o estágio mais visível e onde a maioria das empresas começa.",
  },
  {
    n: "05",
    t: "Melhoria contínua",
    d: "Medir, comparar com a meta e ajustar. Fecha o ciclo e reabre: o dado da operação alimenta a estratégia do próximo ciclo.",
  },
];

const CADEIA = [
  {
    n: "01",
    t: "Planejar",
    d: "Dar direção comum a tudo o que vem depois: quais serviços manter, onde investir, que nível de risco a TI aceita e como isso se liga aos objetivos da empresa.",
  },
  {
    n: "02",
    t: "Melhorar",
    d: "Atravessa todas as outras atividades. Cada número da operação (SLA estourado, chamado reaberto, mudança que falhou) vira uma ação de melhoria com dono e prazo.",
  },
  {
    n: "03",
    t: "Engajar",
    d: "Entender o que usuários, áreas de negócio e fornecedores precisam e manter a conversa aberta com eles. É aqui que entram o portal, a pesquisa de satisfação e as reuniões de serviço.",
  },
  {
    n: "04",
    t: "Desenhar e fazer a transição",
    d: "Garantir que um serviço novo ou alterado chegue à operação atendendo à expectativa de prazo, custo e qualidade, sem quebrar o que já funciona.",
  },
  {
    n: "05",
    t: "Obter ou construir",
    d: "Conseguir os componentes do serviço, seja comprando, contratando ou desenvolvendo: licenças, equipamentos, integrações, configurações.",
  },
  {
    n: "06",
    t: "Entregar e dar suporte",
    d: "A operação do dia: o serviço funcionando de acordo com o combinado, com incidentes e requisições atendidos dentro do prazo.",
  },
];

const DIMENSOES = [
  {
    t: "Organizações e pessoas",
    d: "Estrutura, papéis, competências e cultura. Uma fila bem desenhada não sobrevive a um time que não sabe quem decide o quê.",
  },
  {
    t: "Informação e tecnologia",
    d: "Os dados que o serviço gera e consome e as ferramentas que sustentam o trabalho: plataforma de chamados, base de conhecimento, inventário, automação.",
  },
  {
    t: "Parceiros e fornecedores",
    d: "Quem está fora da TI e mesmo assim faz parte da entrega: operadora, fabricante, prestador de suporte. Contrato sem SLA espelhado vira gargalo invisível.",
  },
  {
    t: "Fluxos de valor e processos",
    d: "Como o trabalho anda de ponta a ponta, do pedido do usuário ao resultado entregue, e onde ele para esperando alguém.",
  },
];

const PRATICAS = [
  {
    t: "Central de serviço (service desk)",
    d: "O ponto único de contato com o usuário. Registra tudo, dá número e prazo a cada pedido e é a origem dos dados que alimentam as outras práticas.",
  },
  {
    t: "Gerenciamento de incidentes",
    d: "Volta o serviço ao normal quando algo para. O indicador que importa é o tempo até o usuário voltar a trabalhar, não o tempo até o chamado ser fechado.",
  },
  {
    t: "Gerenciamento de requisições",
    d: "Trata o pedido previsível (acesso, equipamento, software) por um catálogo com fluxo de aprovação. É a prática que mais se beneficia de automação.",
  },
  {
    t: "Gerenciamento de problemas",
    d: "Olha para os incidentes em conjunto, encontra o padrão e elimina a causa. Sem ela, o service desk resolve o mesmo defeito toda segunda-feira.",
  },
  {
    t: "Habilitação de mudanças",
    d: "O nome da ITIL 4 para a gestão de mudanças. Classifica cada alteração pelo risco: mudança padrão já nasce aprovada, mudança normal passa por avaliação.",
  },
  {
    t: "Gerenciamento de ativos e de configuração",
    d: "O inventário que responde o que existe, onde está, quanto custa e do que depende. É o que permite avaliar o impacto real de um incidente ou de uma mudança.",
  },
];

const IMPLANTAR = [
  {
    n: "01",
    t: "Fotografe o ponto de partida",
    d: "Antes de desenhar processo, meça: quantos chamados por mês, por qual canal, quanto tempo levam, quais tipos se repetem. É o primeiro princípio da ITIL 4, começar de onde você está.",
  },
  {
    n: "02",
    t: "Feche os canais paralelos",
    d: "Um canal oficial de abertura, com registro obrigatório. WhatsApp, e-mail direto e pedido de corredor continuam existindo, mas passam a virar chamado.",
  },
  {
    n: "03",
    t: "Defina prioridade e prazo",
    d: "Uma matriz simples de impacto × urgência e um SLA por categoria. Comece com poucas categorias: dá para refinar depois com dado real.",
  },
  {
    n: "04",
    t: "Monte o catálogo dos pedidos repetidos",
    d: "Os dez tipos de requisição mais frequentes viram itens de catálogo com formulário e fluxo próprio. Só isso costuma tirar boa parte do vaivém de e-mail.",
  },
  {
    n: "05",
    t: "Revise todo mês e amplie",
    d: "Com três a seis meses de dado, o próprio número indica a próxima prática: problemas, se o mesmo incidente volta; mudanças, se a correção de ontem derruba o serviço de hoje.",
  },
];

const CARREIRA = [
  {
    t: "Analista de service desk",
    d: "Porta de entrada da carreira. Atende incidentes e requisições, alimenta a base de conhecimento e vive os processos na prática.",
  },
  {
    t: "Analista de gestão de serviços de TI",
    d: "Desenha e melhora os processos: matriz de prioridade, catálogo, SLA, indicadores. Costuma pedir ITIL Foundation e domínio de alguma plataforma de ITSM.",
  },
  {
    t: "Gestor de serviços de TI",
    d: "Responde pelo desempenho da operação diante do negócio: cumprimento de SLA, custo por chamado, satisfação do usuário e evolução da maturidade.",
  },
];

const FAQ = [
  {
    q: "O que é gestão de serviços de TI?",
    a: "Gestão de serviços de TI é a disciplina que organiza como a área de TI entrega valor ao negócio na forma de serviços, com processos definidos, papéis claros, prazos acordados e métricas de acompanhamento. Em vez de reagir a pedidos soltos, a TI passa a operar com catálogo de serviços, fila única, prioridade e qualidade medida. O termo equivale ao inglês IT Service Management, cuja sigla é ITSM.",
  },
  {
    q: "Gestão de serviços de TI e gerenciamento de serviços de TI são a mesma coisa?",
    a: "Sim. Gestão de serviços de TI, gerenciamento de serviços de TI e administração de serviços de TI são traduções diferentes do mesmo conceito, o IT Service Management (ITSM). Livros e apostilas costumam usar gerenciamento; o mercado de software costuma usar a sigla ITSM; concursos e órgãos públicos usam GSTI. Não há diferença técnica entre os termos.",
  },
  {
    q: "O que o gerenciamento de serviços de TI visa?",
    a: "O objetivo do gerenciamento de serviços de TI é garantir que os serviços de tecnologia sustentem os resultados do negócio: sistemas disponíveis, pedidos atendidos dentro do prazo acordado, riscos de mudança controlados e custo de operação conhecido. Na prática, ele visa transformar a TI de um grupo que apaga incêndio em um prestador de serviço com catálogo, prazo e qualidade medida.",
  },
  {
    q: "Quais são os estágios da gestão de serviços de TI?",
    a: "No ciclo de vida descrito pela ITIL, são cinco estágios: estratégia de serviço (decidir o que oferecer e a que custo), desenho de serviço (projetar níveis de serviço, capacidade e continuidade), transição de serviço (levar o serviço à operação com gestão de mudanças e testes), operação de serviço (o dia a dia de incidentes, requisições e service desk) e melhoria contínua (medir e ajustar). A ITIL 4 reorganizou esses estágios em uma cadeia de valor de serviço, mas a lógica do ciclo permanece.",
  },
  {
    q: "O que mudou da ITIL v3 para a ITIL 4?",
    a: "A ITIL v3 organizava a gestão de serviços em um ciclo de vida de cinco estágios e 26 processos. A ITIL 4, publicada em 2019, troca o ciclo por um sistema de valor de serviço, com uma cadeia de seis atividades (planejar, melhorar, engajar, desenhar e fazer a transição, obter ou construir, entregar e dar suporte), quatro dimensões e sete princípios orientadores. Os processos viraram 34 práticas, e a ênfase saiu do controle de etapas para o valor entregue, com espaço para métodos ágeis, DevOps e automação.",
  },
  {
    q: "Quais são as quatro dimensões da ITIL 4?",
    a: "Organizações e pessoas; informação e tecnologia; parceiros e fornecedores; e fluxos de valor e processos. A ideia é que nenhum serviço funciona olhando só para uma delas: uma ferramenta excelente com papéis mal definidos, ou um processo bem desenhado com um fornecedor sem SLA, entrega menos do que promete.",
  },
  {
    q: "Quais são os princípios orientadores da ITIL 4?",
    a: "São sete: foco no valor; começar de onde você está; progredir de forma iterativa com feedback; colaborar e promover visibilidade; pensar e trabalhar de forma holística; manter a simplicidade e a praticidade; otimizar e automatizar. Funcionam como critério de decisão quando o manual não cobre o caso, o que, na operação real, é quase sempre.",
  },
  {
    q: "O que faz um analista de gestão de serviços de TI?",
    a: "O analista de gestão de serviços de TI desenha, opera e melhora os processos da área: define categorias e matriz de prioridade, mantém o catálogo de serviços, acompanha SLA e indicadores, e configura a plataforma de ITSM que sustenta a operação. As certificações mais pedidas são a ITIL Foundation e o domínio de alguma ferramenta de mercado. É uma evolução comum para quem começa no service desk.",
  },
  {
    q: "Como implantar a gestão de serviços de TI?",
    a: "Em cinco passos: medir o ponto de partida (volume, canais, tempo de atendimento); fechar os canais paralelos num canal oficial de abertura; definir uma matriz de prioridade e um SLA por categoria; transformar os pedidos mais repetidos em itens de catálogo; e revisar os números todo mês para decidir a próxima prática a implantar. Começar pequeno não é o erro; o erro é desenhar dezenas de processos antes de ter o dado que mostra quais deles fazem falta.",
  },
  {
    q: "Qual ferramenta usar para a gestão de serviços de TI?",
    a: "Uma ferramenta de gestão de serviços de TI (ou plataforma de ITSM) precisa de, no mínimo: canal único de abertura, catálogo de serviços, matriz de prioridade, SLA com escalonamento, base de conhecimento, gestão de ativos e relatórios prontos. O diferencial atual está na automação com inteligência artificial, que resolve parte dos chamados sozinha em vez de apenas organizar a fila. A SysAid, por exemplo, resolve até 90% dos chamados antes de eles virarem ticket.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/gestao-de-servicos-de-ti"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Gestão de Serviços de TI: processos, ITIL 4 e como implantar",
  description:
    "Cadeia de valor e dimensões da ITIL 4, práticas essenciais, ITIL v3 × ITIL 4 e um roteiro de implantação em cinco passos.",
  inLanguage: "pt-BR",
  // Aponta pro Organization declarado no layout (@id) em vez de repetir a entidade.
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/gestao-de-servicos-de-ti",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "O que é ITSM", item: "https://itsm.sysaid.com.br/o-que-e-itsm" },
    { "@type": "ListItem", position: 3, name: "Gestão de Serviços de TI", item: "https://itsm.sysaid.com.br/gestao-de-servicos-de-ti" },
  ],
};

export default function GestaoDeServicosDeTiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <header className="site-header">
        <div className="container site-header__inner">
          <Image
            src="/logos/logo-white.svg"
            alt="SysAid"
            width={132}
            height={34}
            priority
          />
          <a className="btn btn--lime btn--sm" href="#form">
            Testar grátis
          </a>
        </div>
      </header>

      <main>
        {/* HERO INFORMACIONAL — intenção de estudo/entendimento, form só no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · Processos e ITIL 4</p>
            <h1>
              Gestão de Serviços de TI:{" "}
              <span className="hl">processos, ITIL 4</span> e como implantar
            </h1>
            <p className="hero__sub">
              Saber o que é gestão de serviços de TI é a parte fácil. Este guia
              é sobre fazer: como a ITIL 4 organiza o trabalho em uma cadeia de
              valor e quatro dimensões, quais práticas sustentam uma operação
              de verdade, o que mudou desde a ITIL v3 e um roteiro de
              implantação em cinco passos para sair do atendimento por
              demanda.
            </p>
            <p className="hero__trust">Guia escrito pela SysAid Brasil</p>
          </div>
        </section>

        {/* NOMES / SINONIMOS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Antes de tudo</p>
              <h2>
                Gestão, gerenciamento, administração de serviços de TI: qual é
                a diferença?
              </h2>
              <p className="section-head__sub">
                Nenhuma. São traduções diferentes de Information Technology
                Service Management, o mesmo conceito que o mercado abrevia como
                ITSM. Saber os nomes evita a impressão de que existem quatro
                disciplinas distintas onde existe uma só.
              </p>
            </div>
            <div className="grid-3">
              {NOMES.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEFINICAO */}
        <section className="section section--soft">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O conceito</p>
              <h2>O que a gestão de serviços de TI faz, na prática</h2>
            </div>
            <p className="section-head__sub">
              Sem gestão de serviços, a TI funciona por demanda: alguém pede no
              corredor, alguém resolve quando dá, e ninguém mede nada. Com
              gestão de serviços, cada entrega da TI vira um serviço com nome,
              dono, prazo e qualidade acordada. O usuário abre um chamado em um
              canal único, o pedido entra numa fila com prioridade definida por
              critério, o prazo é acompanhado por SLA e o resultado vira
              indicador. É essa mudança, de reativo para operado como serviço,
              que o termo descreve. Se você ainda está no conceito, comece pelo
              guia <a href="/o-que-e-itsm">o que é ITSM</a>, que explica a
              disciplina do zero e a diferença entre ITSM e ITIL. Vale também a
              página sobre{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>, o alicerce
              de qualquer operação, e o guia sobre{" "}
              <a href="/service-desk">service desk</a>, a função que faz o
              contato com o usuário. Quando esse modelo é estendido às outras
              áreas da empresa, o nome é <a href="/esm">ESM</a>.
            </p>
          </div>
        </section>

        {/* ITIL v3 x ITIL 4 */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O guia de referência</p>
              <h2>Da ITIL v3 à ITIL 4: de processos em sequência a valor entregue</h2>
            </div>
            <p className="section-head__sub">
              A ITIL é a biblioteca de boas práticas que a maior parte das
              operações usa como referência. A versão 3 descrevia a gestão de
              serviços como um ciclo de vida em cinco estágios, com 26
              processos encaixados em cada um. Funcionava, mas convidava a
              tratar o manual como checklist. A ITIL 4, publicada em 2019,
              trocou o ciclo por um sistema de valor: uma cadeia de seis
              atividades que se combinam conforme a demanda, quatro dimensões
              que precisam andar juntas e sete princípios orientadores. Os
              processos viraram 34 práticas, e a pergunta deixou de ser
              &ldquo;qual etapa vem agora&rdquo; para ser &ldquo;o que isso
              entrega de valor para quem usa o serviço&rdquo;. Para uma visão
              geral da relação entre ITSM, ITIL e a norma ISO/IEC 20000, veja o
              guia <a href="/o-que-e-itsm">o que é ITSM</a>.
            </p>
          </div>
        </section>

        {/* CADEIA DE VALOR */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">ITIL 4 · Cadeia de valor de serviço</p>
              <h2>As seis atividades da cadeia de valor</h2>
              <p className="section-head__sub">
                Não é uma sequência fixa. Um chamado simples passa por engajar
                e entregar; um serviço novo atravessa quase todas. O que a
                cadeia garante é que nenhuma atividade fique sem dono.
              </p>
            </div>
            <div className="grid-3">
              {CADEIA.map((e) => (
                <div className="step" key={e.n}>
                  <span className="step__n">{e.n}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DIMENSOES */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">ITIL 4 · Quatro dimensões</p>
              <h2>As quatro dimensões que todo serviço precisa equilibrar</h2>
              <p className="section-head__sub">
                A causa mais comum de projeto de ITSM que não decola é cuidar
                de uma dimensão só, quase sempre a ferramenta.
              </p>
            </div>
            <div className="grid-2">
              {DIMENSOES.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRATICAS */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na prática</p>
              <h2>As seis práticas que sustentam uma operação de serviços de TI</h2>
              <p className="section-head__sub">
                Das 34 práticas da ITIL 4, estas são as que quase toda
                operação implanta primeiro. O{" "}
                <a href="/sistema-de-chamados">sistema de chamados</a> é a base
                das três primeiras; a{" "}
                <a href="/service-desk">central de serviço</a> é onde todas se
                encontram com o usuário.
              </p>
            </div>
            <div className="grid-3">
              {PRATICAS.map((p) => (
                <div className="card" key={p.t}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO IMPLANTAR */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Roteiro</p>
              <h2>Como implantar a gestão de serviços de TI em cinco passos</h2>
              <p className="section-head__sub">
                Vale para uma TI de cinco pessoas ou de cinquenta. O que muda é
                o volume, não a ordem.
              </p>
            </div>
            <div className="grid-3">
              {IMPLANTAR.map((e) => (
                <div className="step" key={e.n}>
                  <span className="step__n">{e.n}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESTAGIOS ITIL v3 */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Ainda cai em prova</p>
              <h2>Os cinco estágios do ciclo de vida da ITIL v3</h2>
              <p className="section-head__sub">
                Muita apostila, concurso e ementa de graduação ainda usa o
                modelo da v3. Ele continua útil para entender a disciplina
                inteira, e cada estágio tem correspondência na cadeia de valor
                da ITIL 4.
              </p>
            </div>
            <div className="grid-3">
              {ESTAGIOS.map((e) => (
                <div className="step" key={e.n}>
                  <span className="step__n">{e.n}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARREIRA */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Quem trabalha com isso</p>
              <h2>A carreira em gestão de serviços de TI</h2>
              <p className="section-head__sub">
                A disciplina virou matéria de graduação, pós e concurso, e
                sustenta uma trilha de carreira própria dentro da TI. Os papéis
                mais comuns no mercado brasileiro:
              </p>
            </div>
            <div className="grid-3">
              {CARREIRA.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IA */}
        <section className="section section--dark">
          <div className="container ia__grid">
            <div>
              <p className="eyebrow" style={{ color: "var(--lime)" }}>
                O que mudou recentemente
              </p>
              <h2>
                A IA tirou a gestão de serviços do papel de{" "}
                <span className="hl">organizar fila</span>
              </h2>
              <p className="ia__lead">
                Durante anos, gerir serviços de TI era registrar, categorizar e
                distribuir o trabalho entre pessoas. A automação com IA mudou a
                pergunta: em vez de quem vai atender, passou a ser se esse
                chamado precisa de alguém.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>Categoria, prioridade e roteamento definidos sozinhos</li>
                <li>A equipe sobra para projeto, não para pedido repetido</li>
              </ul>
            </div>
            <div className="ia__stat">
              <div className="stat-big">90%</div>
              <p>dos chamados resolvidos antes de chegar ao time</p>
            </div>
          </div>
        </section>

        {/* PROVA */}
        <section className="proof">
          <div className="container">
            <p className="proof__label">
              A TI de grandes empresas no Brasil e no mundo roda com SysAid
            </p>
            <div className="proof__logos">
              {CLIENTES.map((c) => (
                <Image
                  key={c}
                  src={`/clientes/${c}.png`}
                  alt={c}
                  width={150}
                  height={60}
                  className="proof__logo"
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section--soft">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>Perguntas comuns sobre gestão de serviços de TI</h2>
            </div>
            <div className="faq">
              {FAQ.map((item) => (
                <details className="faq__item" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FORM FINAL */}
        <section className="section section--dark" id="form">
          <div className="container container--narrow text-center">
            <p className="eyebrow" style={{ color: "var(--lime)" }}>
              Quer ver isso rodando?
            </p>
            <h2>Do conceito à operação, na sua realidade</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos como os estágios e
              processos descritos aqui ficam na prática, com a fila, os prazos
              e os serviços da sua TI.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/gestao-de-servicos-de-ti" />
    </>
  );
}
