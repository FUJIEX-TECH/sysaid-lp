import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Gestão de Serviços de TI (ITSM): Guia Completo | SysAid Brasil",
  description:
    "Gestão de serviços de TI, também chamada de gerenciamento de serviços de TI ou ITSM: conceito, estágios do ciclo de vida, processos da ITIL, carreira e o que uma ferramenta precisa ter.",
  alternates: { canonical: "/gestao-de-servicos-de-ti" },
  openGraph: {
    title: "Gestão de Serviços de TI (ITSM): Guia Completo",
    description:
      "Conceito, estágios do ciclo de vida, processos da ITIL, carreira e critérios para escolher uma ferramenta de gestão de serviços de TI.",
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

const PROCESSOS = [
  {
    t: "Gestão de incidentes",
    d: "Restabelecer o serviço no menor tempo possível quando algo quebra. É o processo mais visível e onde a maioria das operações começa.",
  },
  {
    t: "Gestão de requisições",
    d: "Atender pedidos padronizados, como acesso, equipamento e licença, por um catálogo com fluxo e aprovação definidos.",
  },
  {
    t: "Gestão de problemas",
    d: "Procurar a causa raiz do incidente que se repete, para que ele pare de acontecer em vez de ser resolvido toda semana.",
  },
  {
    t: "Gestão de mudanças",
    d: "Avaliar risco, aprovar e registrar alterações no ambiente, para que a correção de hoje não vire a indisponibilidade de amanhã.",
  },
  {
    t: "Gestão de ativos e configuração",
    d: "Saber o que a empresa tem, onde está, com quem, sob qual contrato e como cada item se relaciona com os demais.",
  },
  {
    t: "Gestão de nível de serviço",
    d: "Acordar prazos e metas com o negócio, medir o cumprimento e usar o resultado para decidir onde investir.",
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
    q: "Qual a diferença entre gestão de serviços de TI e ITIL?",
    a: "Gestão de serviços de TI é a prática; ITIL é o guia. A ITIL é a biblioteca de boas práticas mais adotada no mundo para orientar como fazer a gestão de serviços, com recomendações de processos, papéis e fluxos. Uma empresa pode praticar a gestão de serviços sem seguir a ITIL à risca, e pode adotar a ITIL sem implementar tudo que está descrito nela. Há ainda a ISO/IEC 20000, que é a norma certificável baseada nos mesmos princípios.",
  },
  {
    q: "O que faz um analista de gestão de serviços de TI?",
    a: "O analista de gestão de serviços de TI desenha, opera e melhora os processos da área: define categorias e matriz de prioridade, mantém o catálogo de serviços, acompanha SLA e indicadores, e configura a plataforma de ITSM que sustenta a operação. As certificações mais pedidas são a ITIL Foundation e o domínio de alguma ferramenta de mercado. É uma evolução comum para quem começa no service desk.",
  },
  {
    q: "Por onde começar a implantar a gestão de serviços de TI?",
    a: "Pelo básico que gera dado: um canal único de abertura de chamados, categorias que façam sentido para a sua realidade, uma matriz simples de prioridade e SLA por tipo de chamado. Com isso rodando por alguns meses, os números mostram onde a operação dói, e a escolha dos próximos processos deixa de ser opinião. O erro comum não é começar pequeno, é escolher uma ferramenta que não acompanhe o amadurecimento.",
  },
  {
    q: "Qual ferramenta usar para a gestão de serviços de TI?",
    a: "Uma ferramenta de gestão de serviços de TI (ou plataforma de ITSM) precisa de, no mínimo: canal único de abertura, catálogo de serviços, matriz de prioridade, SLA com escalonamento, base de conhecimento, gestão de ativos e relatórios prontos. O diferencial atual está na automação com inteligência artificial, que resolve parte dos chamados sozinha em vez de apenas organizar a fila. A SysAid, por exemplo, resolve até 90% dos chamados antes de eles virarem ticket.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Gestão de Serviços de TI (ITSM): o guia completo",
  description:
    "Conceito, estágios do ciclo de vida, processos da ITIL, carreira e critérios para escolher uma ferramenta de gestão de serviços de TI.",
  inLanguage: "pt-BR",
  author: { "@type": "Organization", name: "SysAid Brasil", url: "https://www.sysaid.com.br/" },
  publisher: { "@type": "Organization", name: "SysAid Brasil" },
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
            <p className="eyebrow">Guia · ITSM</p>
            <h1>
              Gestão de Serviços de TI: o{" "}
              <span className="hl">guia completo</span>
            </h1>
            <p className="hero__sub">
              Gestão de serviços de TI, gerenciamento de serviços de TI, GSTI,
              ITSM: nomes diferentes para a mesma disciplina, a que organiza
              como a área de tecnologia entrega valor ao negócio na forma de
              serviços. Neste guia: o conceito, os cinco estágios do ciclo de
              vida, os processos da ITIL, a carreira na área e o que uma
              ferramenta precisa ter.
            </p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Mais de 400 empresas no país
              usam a plataforma
            </p>
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
              que o termo descreve. Quem quiser começar pelo vocabulário
              vizinho pode ler o nosso guia{" "}
              <a href="/o-que-e-itsm">o que é ITSM</a> e a página sobre{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>, o alicerce
              de qualquer operação.
            </p>
          </div>
        </section>

        {/* ESTAGIOS DO CICLO DE VIDA */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O ciclo de vida</p>
              <h2>Os cinco estágios da gestão de serviços de TI</h2>
              <p className="section-head__sub">
                A ITIL descreve a gestão de serviços como um ciclo de vida em
                cinco estágios. A ITIL 4 reorganizou o modelo em uma cadeia de
                valor, mas a lógica do ciclo segue sendo a melhor forma de
                entender a disciplina inteira.
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

        {/* ITIL x ISO */}
        <section className="section section--soft">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">A confusão mais comum</p>
              <h2>ITSM é a prática. ITIL é o guia. ISO 20000 é a norma</h2>
            </div>
            <p className="section-head__sub">
              Gestão de serviços de TI é o que a empresa faz. ITIL é a
              biblioteca de boas práticas mais adotada no mundo para orientar
              como fazer, com recomendações de processos, papéis e fluxos. E a
              ISO/IEC 20000 é a norma internacional certificável construída
              sobre os mesmos princípios, usada quando a empresa precisa provar
              a maturidade da operação para clientes ou órgãos reguladores. Uma
              empresa pode praticar a gestão de serviços sem seguir a ITIL à
              risca, e pode adotar a ITIL sem buscar a certificação. Tratar o
              guia como obrigação é o motivo de muitos projetos travarem antes
              de entregar valor.
            </p>
          </div>
        </section>

        {/* PROCESSOS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na prática</p>
              <h2>Os processos que sustentam a gestão de serviços de TI</h2>
              <p className="section-head__sub">
                Ninguém implanta todos de uma vez. A maioria das operações
                começa pelos dois primeiros e agrega os demais conforme o volume
                e a maturidade crescem.
              </p>
            </div>
            <div className="grid-3">
              {PROCESSOS.map((p) => (
                <div className="card" key={p.t}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARREIRA */}
        <section className="section section--soft">
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

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <Image src="/logos/logo-white.svg" alt="SysAid" width={116} height={30} />
          <p>SysAid Brasil · Software ITSM com Inteligência Artificial</p>
        </div>
      </footer>
    </>
  );
}
