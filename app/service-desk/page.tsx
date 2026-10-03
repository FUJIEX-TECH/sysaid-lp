import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Service Desk: o que é, o que faz e como escolher | SysAid Brasil",
  description:
    "Service desk é o ponto único de contato entre os usuários e a TI. O que é, o que faz na prática, a diferença para help desk, os processos da ITIL e como escolher a ferramenta.",
  alternates: { canonical: "/service-desk" },
  openGraph: {
    title: "Service Desk: o que é, o que faz e como escolher",
    description:
      "O ponto único de contato entre os usuários e a TI: definição, funções, diferença para help desk e critérios para escolher a ferramenta.",
    locale: "pt_BR",
    type: "article",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const FUNCOES = [
  {
    n: "01",
    t: "Receber tudo que a TI precisa atender",
    d: "Incidente, dúvida, pedido de acesso, solicitação de equipamento. O service desk é a porta única: qualquer demanda para a tecnologia entra por ele, por portal, e-mail, Teams ou telefone, e passa a existir como registro.",
  },
  {
    n: "02",
    t: "Classificar e priorizar por critério",
    d: "Cada registro recebe categoria, impacto e urgência, e a matriz de prioridade decide o que é atendido primeiro. Prioridade deixa de ser quem gritou mais alto e passa a ser regra escrita.",
  },
  {
    n: "03",
    t: "Resolver ou encaminhar para quem resolve",
    d: "O que é comum se resolve no primeiro contato, com apoio da base de conhecimento. O que exige especialista é escalado para o time certo, sem o usuário ter que recontar a história.",
  },
  {
    n: "04",
    t: "Cumprir o prazo acordado",
    d: "Cada tipo de chamado tem SLA, contado em horário útil, com escalonamento automático e alerta antes do vencimento. O prazo é acompanhado pela ferramenta, não pela memória do analista.",
  },
  {
    n: "05",
    t: "Comunicar o usuário",
    d: "Quem abriu acompanha o andamento sozinho, pelo portal. Em indisponibilidade que afeta muita gente, o service desk avisa antes de o telefone tocar, e é isso que evita a enxurrada de chamados repetidos.",
  },
  {
    n: "06",
    t: "Gerar o dado que orienta a TI",
    d: "Volume por categoria, tempo médio de atendimento, cumprimento de SLA, reincidência e carga por analista. É o que mostra onde investir, o que automatizar e de quanta gente a operação precisa.",
  },
];

const DIFERENCAS = [
  {
    t: "Help desk: resolver o incidente",
    d: "O help desk é reativo e focado no usuário final. Alguma coisa parou de funcionar e o time restabelece o serviço o mais rápido possível. O escopo é o problema técnico pontual, e o sucesso se mede em chamado fechado e tempo de atendimento.",
  },
  {
    t: "Service desk: operar a TI como serviço",
    d: "O service desk engloba o help desk e vai além. Além de incidentes, trata requisições, mudanças, ativos, problemas recorrentes e a comunicação com o negócio. É o ponto único de contato para tudo que envolve a TI, alinhado às práticas da ITIL.",
  },
  {
    t: "Na prática, a diferença é de escopo",
    d: "Um help desk responde à pergunta 'minha máquina parou, e agora?'. Um service desk responde também a 'preciso de acesso ao sistema', 'vamos contratar dez pessoas mês que vem' e 'esse erro volta toda semana, por quê?'. Por isso a operação costuma começar como help desk e amadurecer para service desk.",
  },
];

const PROCESSOS = [
  {
    t: "Gestão de incidentes",
    d: "Restabelecer o serviço no menor tempo possível quando algo para. É o processo de maior volume e o que mais aparece no dia a dia do service desk.",
  },
  {
    t: "Gestão de requisições",
    d: "Atender pedidos previsíveis: acesso, licença, equipamento, instalação. Como são repetitivos, são os primeiros candidatos a catálogo de serviços e automação.",
  },
  {
    t: "Gestão de problemas",
    d: "Achar e eliminar a causa raiz do incidente que volta. É o processo que faz o volume de chamados cair em vez de só ser atendido mais rápido.",
  },
  {
    t: "Gestão de mudanças",
    d: "Avaliar, aprovar e registrar alterações no ambiente, para que a mudança planejada não vire o incidente de amanhã.",
  },
  {
    t: "Gestão de ativos e configuração",
    d: "Saber o que a empresa tem, onde está, com quem está e como se conecta. Sem inventário confiável, o atendimento começa toda vez com uma investigação.",
  },
  {
    t: "Gestão de nível de serviço",
    d: "Acordar prazos e qualidade com as áreas, medir o cumprimento e reportar. É o que transforma a percepção sobre a TI em número discutível.",
  },
];

const CRITERIOS = [
  {
    t: "Ponto único de contato de verdade",
    d: "Portal, e-mail, Teams e WhatsApp caindo na mesma fila. Se cada canal vira uma caixa separada, a ferramenta não entregou o básico do conceito.",
  },
  {
    t: "Catálogo de serviços e automação",
    d: "Pedido repetitivo tem que ter fluxo próprio e aprovação automática. O que não for automatizado vai consumir analista para sempre.",
  },
  {
    t: "Inteligência artificial que resolve, não só sugere",
    d: "A diferença entre uma IA que escreve rascunho de resposta e uma que executa a solicitação inteira sozinha aparece direto no volume que chega ao time.",
  },
  {
    t: "Gestão de ativos na mesma base",
    d: "Chamado e ativo separados em dois sistemas obrigam o analista a procurar em dois lugares e impedem qualquer análise de reincidência por equipamento.",
  },
  {
    t: "Relatório pronto, não exportação",
    d: "SLA, volume por categoria e carga por analista precisam estar em painel. Operação que depende de planilha montada na mão não acompanha, só justifica depois.",
  },
  {
    t: "Custo total, não preço de licença",
    d: "Servidor, atualização de versão, compatibilidade de plugin e as horas da própria equipe mantendo a ferramenta de pé são custo real. Ferramenta gratuita costuma cobrar em hora de time.",
  },
];

const FAQ = [
  {
    q: "O que é service desk?",
    a: "Service desk é o ponto único de contato entre os usuários e a área de TI. É por ele que entram todos os incidentes, dúvidas, requisições e solicitações de mudança, que passam a ser registrados, classificados, priorizados e acompanhados com prazo acordado. O conceito vem da ITIL e descreve tanto o time quanto o processo e a ferramenta que sustentam esse atendimento. Na prática, é o que transforma o atendimento da TI em operação medida, em vez de uma sequência de pedidos avulsos.",
  },
  {
    q: "O que faz um service desk?",
    a: "Um service desk recebe e registra as demandas dirigidas à TI, classifica cada uma por categoria, impacto e urgência, resolve no primeiro contato o que for possível, escala ao especialista o que exigir, acompanha o cumprimento dos prazos (SLA), comunica o usuário sobre o andamento e sobre indisponibilidades, e gera os indicadores da operação. Além do atendimento, participa dos processos de requisição, problema, mudança e gestão de ativos.",
  },
  {
    q: "Qual a diferença entre help desk e service desk?",
    a: "A diferença é de escopo. O help desk é reativo e focado em restabelecer o serviço quando algo para de funcionar para o usuário final. O service desk engloba o help desk e cobre também requisições, mudanças, problemas recorrentes, gestão de ativos e a comunicação com o negócio, funcionando como ponto único de contato para tudo que envolve a TI. Em geral a operação começa como help desk e amadurece para service desk conforme a empresa cresce.",
  },
  {
    q: "O que faz um analista de service desk?",
    a: "O analista de service desk é quem atende o usuário no primeiro nível: registra o chamado, faz o diagnóstico inicial, resolve o que está no escopo dele com apoio da base de conhecimento e escala ao time especialista o que não está. Também acompanha o prazo dos chamados sob sua responsabilidade, mantém o usuário informado e alimenta a base de conhecimento com as soluções que funcionaram. É uma função que combina conhecimento técnico com comunicação, porque boa parte do trabalho é traduzir o problema do usuário em informação útil para quem vai resolver.",
  },
  {
    q: "Service desk é a mesma coisa que ITSM?",
    a: "Não. ITSM (gestão de serviços de TI) é a disciplina inteira, que define como a TI entrega valor ao negócio na forma de serviços. O service desk é a função dentro dessa disciplina que faz o contato com o usuário e coordena o atendimento. Todo service desk faz parte de uma estratégia de ITSM, mas ITSM envolve muito mais do que o atendimento, incluindo desenho de serviço, capacidade, continuidade e melhoria contínua.",
  },
  {
    q: "Preciso seguir a ITIL para ter um service desk?",
    a: "Não é obrigatório. A ITIL é uma biblioteca de boas práticas, não uma norma de cumprimento obrigatório. Ela é útil porque dá vocabulário comum e um caminho já testado, mas a adoção é gradual e adaptada ao tamanho da operação. A maioria das empresas começa por gestão de incidentes e requisições, que é onde está o volume, e incorpora os outros processos conforme a necessidade aparece.",
  },
  {
    q: "Qual ferramenta de service desk escolher?",
    a: "Os critérios que mais pesam são: canais de abertura caindo em fila única, catálogo de serviços com automação para os pedidos repetitivos, gestão de ativos na mesma base do chamado, SLA com escalonamento automático, relatórios prontos em painel e inteligência artificial capaz de resolver solicitações sozinha, não apenas sugerir texto. Vale avaliar também o custo total de operação, que inclui infraestrutura, atualização e as horas da própria equipe mantendo a ferramenta, e não só o preço da licença.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/service-desk"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Service Desk: o que é, o que faz e como escolher",
  description:
    "Definição de service desk, o que a função faz na prática, a diferença para help desk, os processos da ITIL envolvidos e os critérios para escolher a ferramenta.",
  inLanguage: "pt-BR",
  // Aponta pro Organization declarado no layout (@id) em vez de repetir a entidade.
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/service-desk",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "O que é ITSM", item: "https://itsm.sysaid.com.br/o-que-e-itsm" },
    { "@type": "ListItem", position: 3, name: "Service Desk", item: "https://itsm.sysaid.com.br/service-desk" },
  ],
};

export default function ServiceDeskPage() {
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
        {/* HERO INFORMACIONAL — a busca por "service desk" é de entendimento, form só no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · Service Desk</p>
            <h1>
              Service desk: o <span className="hl">ponto único de contato</span>{" "}
              entre o usuário e a TI
            </h1>
            <p className="hero__sub">
              Service desk é a função que recebe tudo que a empresa precisa da
              tecnologia — incidente, dúvida, pedido de acesso, solicitação de
              mudança — e transforma cada demanda em registro com categoria,
              responsável, prioridade e prazo. Neste guia: o que é, o que faz na
              prática, a diferença para o help desk, os processos da ITIL
              envolvidos e como escolher a ferramenta.
            </p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Mais de 400 empresas no país
              usam a plataforma
            </p>
          </div>
        </section>

        {/* DEFINICAO */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O conceito</p>
              <h2>O que é service desk</h2>
            </div>
            <p className="section-head__sub">
              Service desk é o ponto único de contato entre os usuários e a área
              de TI. Em vez de o pedido chegar por e-mail para um analista,
              mensagem para outro e conversa de corredor com um terceiro, tudo
              entra por um mesmo canal e vira um registro rastreável. O termo
              vem da ITIL e descreve ao mesmo tempo o time, o processo e a
              ferramenta que sustentam esse atendimento. A consequência prática
              é que a TI passa a saber quantos pedidos existem, quem está
              atendendo o quê, quanto tempo cada coisa leva e o que se repete —
              e é esse conjunto de respostas que separa uma operação medida de
              uma operação que só reage. O alicerce técnico dessa função é o{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>, e a
              disciplina maior que a organiza é a{" "}
              <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>.
              Quando o mesmo modelo de atendimento é levado além da TI, para
              RH, Facilities e Financeiro, ele passa a se chamar{" "}
              <a href="/esm">ESM</a>.
            </p>
          </div>
        </section>

        {/* O QUE FAZ */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na prática</p>
              <h2>O que um service desk faz</h2>
              <p className="section-head__sub">
                A função não se resume a atender telefone. São seis
                responsabilidades encadeadas, e é a última delas que costuma
                faltar nas operações que nunca saem do modo apagar incêndio.
              </p>
            </div>
            <div className="grid-3">
              {FUNCOES.map((f) => (
                <div className="step" key={f.n}>
                  <span className="step__n">{f.n}</span>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HELP DESK x SERVICE DESK */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A confusão mais comum</p>
              <h2>Help desk e service desk não são sinônimos</h2>
              <p className="section-head__sub">
                Os dois termos aparecem trocados o tempo todo, inclusive em
                material de fornecedor. A diferença é de escopo, e ela importa
                na hora de escolher ferramenta: quem compra pensando em help
                desk costuma trocar de sistema dois anos depois.
              </p>
            </div>
            <div className="grid-3">
              {DIFERENCAS.map((d) => (
                <div className="card" key={d.t}>
                  <h3>{d.t}</h3>
                  <p>{d.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESSOS ITIL */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Os processos</p>
              <h2>O que sustenta um service desk por trás do atendimento</h2>
              <p className="section-head__sub">
                A ITIL organiza a operação em processos. Ninguém implanta todos
                de uma vez: a maioria das empresas começa por incidentes e
                requisições, que é onde está o volume, e incorpora o resto
                conforme a dor aparece.
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

        {/* IA WEDGE */}
        <section className="section section--dark">
          <div className="container ia__grid">
            <div>
              <p className="eyebrow" style={{ color: "var(--lime)" }}>
                O que mudou
              </p>
              <h2>
                O melhor chamado é o que{" "}
                <span className="hl">nunca precisou ser aberto</span>
              </h2>
              <p className="ia__lead">
                Durante trinta anos, melhorar um service desk significou atender
                mais rápido. Com inteligência artificial nativa, passou a
                significar atender menos: o SysAid Copilot entende a
                solicitação, responde o usuário e executa a resolução dos casos
                comuns sozinho, antes de o chamado chegar a uma pessoa.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>Respostas sugeridas ao analista, direto no fluxo</li>
                <li>Categoria e prioridade atribuídas automaticamente</li>
              </ul>
              <a className="btn btn--lime" href="#form">
                Ver o Copilot numa demonstração
              </a>
            </div>
            <div className="ia__stat">
              <div className="stat-big">90%</div>
              <p>dos chamados resolvidos antes de chegar ao seu time</p>
            </div>
          </div>
        </section>

        {/* CRITERIOS DE ESCOLHA */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na hora de escolher</p>
              <h2>Seis critérios para avaliar uma ferramenta de service desk</h2>
            </div>
            <div className="grid-3">
              {CRITERIOS.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
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

        {/* NUMEROS */}
        <section className="section section--soft">
          <div className="container">
            <div className="stats">
              <div className="stat">
                <div className="stat__n">400+</div>
                <div className="stat__l">empresas no Brasil</div>
              </div>
              <div className="stat">
                <div className="stat__n">90%</div>
                <div className="stat__l">dos chamados resolvidos com IA</div>
              </div>
              <div className="stat">
                <div className="stat__n">12x</div>
                <div className="stat__l">mais rápido na resolução</div>
              </div>
              <div className="stat">
                <div className="stat__n">1.000+</div>
                <div className="stat__l">integrações nativas</div>
              </div>
            </div>
            <div className="badges">
              {["badge_2", "badge_5", "badge_7", "badge_3", "badge_6"].map((b) => (
                <Image
                  key={b}
                  src={`/badges/${b}.svg`}
                  alt="Reconhecimento SysAid"
                  width={78}
                  height={78}
                  className="badge"
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>O que perguntam sobre service desk</h2>
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
              Fale com um especialista
            </p>
            <h2>Veja um service desk com IA rodando na sua operação</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a plataforma com a fila,
              o catálogo de serviços, os SLAs e os relatórios da sua operação.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/service-desk" />
    </>
  );
}
