import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

// Fatos conferidos em 09/10/2026 (PeopleCert + duas fontes independentes):
// Foundation (Version 5) desde 12/02/2026; bridge para quem tem ITIL 4; 8 atividades
// do ciclo de vida (Discover, Design, Acquire, Build, Transition, Operate, Deliver,
// Support); 7 princípios e nomes das 34 práticas mantidos; módulo ITIL AI Governance
// (Version 5). A data de lançamento do framework (29/01) não fechou entre as fontes,
// por isso o texto fala só em "início de 2026".

export const metadata: Metadata = {
  title: "ITIL 5: o que muda em relação ao ITIL 4 na prática | SysAid",
  description:
    "O que é o ITIL 5, o que muda em relação ao ITIL 4 (ciclo de vida de produto e serviço, governança de IA) e o que a equipe de TI precisa ajustar no service desk agora.",
  alternates: { canonical: "/itil-5" },
  openGraph: {
    title: "ITIL 5: o que mudou e como aplicar na gestão de serviços de TI",
    description:
      "ITIL 4 x ITIL 5, as oito atividades do ciclo de vida, governança de IA e seis ajustes no service desk para começar agora.",
    locale: "pt_BR",
    type: "article",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const RESUMO =
  "O ITIL 5 (ITIL Version 5) é a nova versão do principal guia de boas práticas de gestão de serviços de TI, publicada pela PeopleCert no início de 2026. Ele amplia o escopo da gestão de serviços para a gestão de produtos e serviços digitais, troca a cadeia de valor do ITIL 4 por um ciclo de vida de oito atividades e trata a inteligência artificial como capacidade que precisa de governança. Os sete princípios orientadores e as 34 práticas continuam.";

const ITIL4_X_ITIL5 = [
  { crit: "Escopo", v4: "Gestão de serviços de TI, com abertura para o restante da empresa", v5: "Gestão de produtos e serviços digitais: o mesmo time cuida do produto e do serviço que o sustenta" },
  { crit: "Modelo central", v4: "Sistema de valor de serviço, com a cadeia de valor de seis atividades", v5: "Ciclo de vida de produto e serviço, com oito atividades e movimento em qualquer direção" },
  { crit: "Inteligência artificial", v4: "Aparece como tecnologia dentro das práticas, sem modelo próprio de governança", v5: "Tratada como capacidade da organização, com governança, responsáveis e medição; ganhou módulo próprio" },
  { crit: "Práticas", v4: "34 práticas de gestão", v5: "Os mesmos 34 nomes de prática, relidos à luz do ciclo de vida" },
  { crit: "Princípios orientadores", v4: "Sete", v5: "Os mesmos sete" },
  { crit: "Certificação de entrada", v4: "ITIL 4 Foundation, que segue válida", v5: "ITIL Foundation (Version 5), desde fevereiro de 2026, com bridge para quem já tem a do ITIL 4" },
];

const CICLO = [
  { t: "Discover (descobrir)", d: "Entender a demanda e a oportunidade antes de construir. Na ferramenta: os chamados e as requisições viram dado de demanda, não só fila." },
  { t: "Design (desenhar)", d: "Definir o produto ou serviço, o nível de serviço e a experiência de quem usa. Na ferramenta: item de catálogo com dono, SLA e formulário pensados juntos." },
  { t: "Acquire (adquirir)", d: "Contratar o que vem de fora: software, nuvem, fornecedor. Na ferramenta: contratos e licenças ligados aos itens que eles cobrem." },
  { t: "Build (construir)", d: "Desenvolver ou configurar o que é feito dentro de casa. Na ferramenta: o trabalho de construção fica rastreável até o serviço que ele muda." },
  { t: "Transition (transição)", d: "Levar a mudança para a operação com risco controlado. Na ferramenta: gestão de mudanças com análise de impacto pela CMDB." },
  { t: "Operate (operar)", d: "Manter o que está em produção funcionando. Na ferramenta: monitoramento, eventos e ativos atualizados sem digitação." },
  { t: "Deliver (entregar)", d: "Fazer o valor chegar a quem usa, no canal que ele usa. Na ferramenta: portal de autoatendimento e catálogo, inclusive para áreas fora da TI." },
  { t: "Support (suportar)", d: "Resolver o que deu errado e o que o usuário pede. Na ferramenta: incidente, requisição e problema, com a base de conhecimento por trás." },
];

const IA = [
  { t: "Dono para cada uso de IA", d: "Quem responde pelo agente que fecha chamado sozinho ou pelo assistente que sugere resposta? O ITIL 5 pede um responsável nomeado, como qualquer outro serviço." },
  { t: "Medição de resultado, não de uso", d: "Quantos chamados a IA resolveu sem reabertura, quanto tempo poupou, quantas respostas o analista precisou corrigir. Volume de uso não diz se ela ajuda." },
  { t: "Trilha de decisão", d: "Registrar o que a IA fez, com que base e quem revisou. É o que permite auditar, corrigir e explicar uma decisão para o usuário." },
  { t: "Decisão automatizada revisável", d: "No Brasil, a LGPD dá ao titular o direito de pedir revisão de decisão tomada só por tratamento automatizado. Fluxo de IA que decide sobre pessoas precisa de um caminho de revisão humana." },
];

const AJUSTES = [
  { n: "01", t: "Releia o catálogo como produto", d: "Cada item do catálogo ganha dono, público, nível de serviço e indicador de valor. Item que ninguém pede há seis meses sai; item que gera muito chamado de dúvida volta para o desenho." },
  { n: "02", t: "Dê dono e trilha a cada automação com IA", d: "Liste onde há IA no atendimento (resposta automática, classificação, agente que executa tarefa), nomeie o responsável e garanta que cada ação fique registrada no chamado." },
  { n: "03", t: "Troque métrica de esforço por métrica de valor", d: "Além de tempo de resposta e volume, acompanhe resolução no primeiro contato, chamados evitados pelo autoatendimento e satisfação por serviço. É o que mostra valor para a diretoria." },
  { n: "04", t: "Ligue a mudança à CMDB", d: "A transição do ITIL 5 só controla risco se a mudança enxerga o que depende do item alterado. Sem CMDB viva, a análise de impacto é chute." },
  { n: "05", t: "Ponha aprovação humana onde a lei e o risco pedem", d: "Automação de ponta a ponta para o que é repetitivo e de baixo risco; aprovação humana para acesso privilegiado, dado pessoal e decisão que afeta pessoas." },
  { n: "06", t: "Trate a base de conhecimento como insumo da IA", d: "O assistente responde com o que está na base. Artigo desatualizado vira resposta errada em escala: dê dono, data de revisão e retire o que caducou." },
];

const SYSAID = [
  { t: "Práticas ITIL na mesma plataforma", d: "Incidente, requisição, problema, mudança, catálogo de serviços e gestão de ativos no mesmo ITSM, com a CMDB nativa por trás de todos." },
  { t: "Copilot sobre a sua base de conhecimento", d: "O SysAid Copilot responde e resolve pedidos comuns antes de virarem ticket e sugere respostas ao analista, usando os artigos da sua base." },
  { t: "Mudança com análise de impacto", d: "Antes de aprovar, a equipe vê os itens e serviços que dependem do que vai mudar, pelo grafo de relações da CMDB." },
  { t: "Fora da TI também", d: "RH, Facilities e Financeiro atendem pelo mesmo portal e catálogo, que é a gestão de serviços corporativos (ESM) que o escopo ampliado do ITIL 5 pressupõe." },
];

const FAQ = [
  {
    q: "O que é o ITIL 5?",
    a: "O ITIL 5, ou ITIL Version 5, é a versão de 2026 do ITIL, o conjunto de boas práticas de gestão de serviços de TI mantido pela PeopleCert. Ele amplia o foco para a gestão de produtos e serviços digitais, organiza o trabalho num ciclo de vida de oito atividades e dá tratamento próprio à governança de inteligência artificial, mantendo os princípios e as práticas do ITIL 4.",
  },
  {
    q: "Quando o ITIL 5 foi lançado?",
    a: "O ITIL 5 foi publicado no início de 2026. A certificação de entrada, ITIL Foundation (Version 5), está disponível desde 12 de fevereiro de 2026, e os módulos avançados vêm sendo lançados em fases ao longo do ano.",
  },
  {
    q: "O ITIL 4 ainda vale?",
    a: "Vale. A certificação ITIL 4 Foundation continua válida, e o conteúdo do ITIL 4 segue útil porque os sete princípios orientadores e as 34 práticas foram mantidos no ITIL 5. O que muda é o modelo que organiza essas práticas e o peso dado a produto digital e IA.",
  },
  {
    q: "Preciso me recertificar no ITIL 5?",
    a: "Não é obrigatório. Quem tem ITIL 4 Foundation pode fazer o ITIL Foundation Bridge (Version 5), que cobre só as mudanças da nova versão. A prova completa da Foundation (Version 5) tem 40 questões de múltipla escolha, 60 minutos e nota mínima de 65%.",
  },
  {
    q: "O que mudou nas práticas do ITIL 5?",
    a: "Os nomes das 34 práticas do ITIL 4 continuam os mesmos. A mudança está em como elas se encaixam: em vez de servir à cadeia de valor de seis atividades, cada prática passa a contribuir para as oito atividades do ciclo de vida de produto e serviço, e a orientação inclui o uso de IA dentro delas.",
  },
  {
    q: "Quais são as oito atividades do ciclo de vida do ITIL 5?",
    a: "Discover (descobrir), Design (desenhar), Acquire (adquirir), Build (construir), Transition (transição), Operate (operar), Deliver (entregar) e Support (suportar). O ciclo não é linear: o trabalho pode ir e voltar entre as atividades, conforme o produto ou serviço evolui.",
  },
  {
    q: "Como o ITIL 5 trata a inteligência artificial?",
    a: "Como uma capacidade da organização que precisa de governança: responsáveis definidos, gestão de risco, medição de resultado e confiança de quem usa. A PeopleCert lançou um módulo específico, o ITIL AI Governance (Version 5). No dia a dia do service desk, isso significa saber onde há IA, quem responde por ela e como revisar o que ela decidiu.",
  },
  {
    q: "O ITIL 5 serve para áreas fora da TI?",
    a: "Serve. Ao falar de produtos e serviços digitais em geral, o ITIL 5 reforça o que já acontecia na prática: RH, Facilities, Jurídico e Financeiro prestam serviços internos com os mesmos conceitos de catálogo, requisição e nível de serviço. É o que se chama de gestão de serviços corporativos, ou ESM.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/itil-5"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "ITIL 5: o que mudou e como aplicar na gestão de serviços de TI",
  description:
    "O que é o ITIL 5, a comparação ITIL 4 x ITIL 5, as oito atividades do ciclo de vida de produto e serviço, a governança de IA e seis ajustes no service desk.",
  inLanguage: "pt-BR",
  datePublished: "2026-10-09",
  dateModified: "2026-10-09",
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/itil-5",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "ITIL 5", item: "https://itsm.sysaid.com.br/itil-5" },
  ],
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "ITIL 5",
  alternateName: ["ITIL Version 5", "ITIL 5.0", "ITIL v5"],
  description: RESUMO,
  inDefinedTermSet: "https://itsm.sysaid.com.br/itil-5",
};

export default function Itil5Page() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
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
          <a className="btn btn--lime btn--sm" href="#demo">
            Agende uma demonstração
          </a>
        </div>
      </header>

      <main>
        {/* HERO INFORMACIONAL: busca de entendimento; o form fica no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · ITIL 5</p>
            <h1>
              ITIL 5: o que mudou e como aplicar na{" "}
              <span className="hl">gestão de serviços de&nbsp;TI</span>
            </h1>
            <p className="hero__sub">{RESUMO}</p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Nota 4,5/5 no G2 (750+
              avaliações)
            </p>
          </div>
        </section>

        {/* O QUE E */}
        <section className="section" id="o-que-e">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O conceito</p>
              <h2>O que é o ITIL 5 (e o que ele não é)</h2>
            </div>
            <p className="section-head__sub">
              O ITIL 5 não é um framework novo do zero. É a evolução do ITIL 4
              para um cenário em que quase todo serviço da empresa é, também,
              um produto digital, e em que a IA já atende usuário, classifica
              chamado e executa tarefa. A pergunta que ele responde deixou de
              ser só “como a TI presta serviço” e passou a ser “como a empresa
              descobre, constrói, opera e sustenta produtos e serviços
              digitais, com IA dentro deles”.
            </p>
            <p className="section-head__sub">
              Quem está começando pelo ITIL em si (o que é, as práticas, as
              quatro dimensões) encontra o caminho no guia de{" "}
              <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>.
              Aqui o foco é o que muda com a versão 5 e o que isso pede do seu
              service desk.
            </p>
          </div>
        </section>

        {/* ITIL 4 x ITIL 5 */}
        <section className="section section--soft" id="itil-4-x-itil-5">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Lado a lado</p>
              <h2>ITIL 4 x ITIL 5: o que muda e o que fica</h2>
              <p className="section-head__sub">
                Boa notícia para quem investiu no ITIL 4: princípios e práticas
                ficam. O que muda é o modelo que organiza o trabalho e o lugar
                da IA.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo ITIL 4 e ITIL 5">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">ITIL 4</span>
                <span role="columnheader" className="ctable__us">ITIL 5</span>
              </div>
              {ITIL4_X_ITIL5.map((r) => (
                <div className="ctable__row" role="row" key={r.crit}>
                  <span className="ctable__crit" role="cell">{r.crit}</span>
                  <span className="ctable__them" role="cell" data-label="ITIL 4">{r.v4}</span>
                  <span className="ctable__mine" role="cell">{r.v5}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CICLO DE VIDA */}
        <section className="section" id="ciclo-de-vida">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O modelo novo</p>
              <h2>As oito atividades do ciclo de vida de produto e serviço</h2>
              <p className="section-head__sub">
                No lugar da cadeia de valor de seis atividades, o ITIL 5 usa um
                ciclo de vida com oito. Ele não é linear: o trabalho vai e volta
                entre elas. Ao lado de cada uma, o que ela pede da ferramenta de{" "}
                <a href="/o-que-e-itsm">ITSM</a>.
              </p>
            </div>
            <div className="grid-3">
              {CICLO.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IA */}
        <section className="section section--soft" id="ia">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A maior novidade</p>
              <h2>Governança de IA no ITIL 5</h2>
              <p className="section-head__sub">
                O ITIL 5 trata a IA como capacidade da organização, não como
                recurso de uma ferramenta, e a PeopleCert criou um módulo só
                para isso, o ITIL AI Governance (Version 5). Na prática do
                service desk, governar IA se resume a quatro perguntas.
              </p>
            </div>
            <div className="grid-3">
              {IA.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE FAZER */}
        <section className="section" id="o-que-fazer">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na segunda-feira</p>
              <h2>Seis ajustes no service desk para trabalhar no ITIL 5</h2>
              <p className="section-head__sub">
                Nenhum deles exige trocar processo inteiro nem esperar a
                certificação do time. Todos começam pela ferramenta que você já
                usa. Para o item 4, veja o guia de{" "}
                <a href="/cmdb">CMDB</a>; para levar o catálogo a RH e
                Facilities, o de <a href="/esm">ESM</a>.
              </p>
            </div>
            <div className="grid-3">
              {AJUSTES.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step__n">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICACAO */}
        <section className="section section--soft" id="certificacao">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Para quem pergunta da prova</p>
              <h2>Certificação ITIL 5: o essencial</h2>
            </div>
            <p className="section-head__sub">
              A ITIL Foundation (Version 5) está disponível desde 12 de
              fevereiro de 2026: 40 questões de múltipla escolha, 60 minutos,
              sem consulta e nota mínima de 65%. Quem já tem a ITIL 4
              Foundation pode fazer o ITIL Foundation Bridge (Version 5), que
              cobre só o que mudou, e a certificação do ITIL 4 continua válida.
              Os módulos avançados da versão 5 estão saindo em fases ao longo
              de 2026. Para a equipe de TI, a prova é opcional; o que muda o
              resultado do atendimento são os ajustes acima.
            </p>
          </div>
        </section>

        {/* COMO A SYSAID AJUDA */}
        <section className="section section--dark" id="sysaid">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow" style={{ color: "var(--lime)" }}>
                Na plataforma
              </p>
              <h2>
                Como a SysAid ajuda a aplicar o ITIL 5:{" "}
                <span className="hl">práticas e IA</span> na mesma base
              </h2>
              <p className="section-head__sub">
                O ITIL 5 pede que práticas, dados de configuração e IA
                conversem. Na SysAid, eles já moram na mesma plataforma de{" "}
                <a href="/service-desk" style={{ color: "var(--lime)" }}>
                  service desk
                </a>
                .
              </p>
            </div>
            <div className="grid-3">
              {SYSAID.map((s) => (
                <div className="card" key={s.t}>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
            <p className="section-head__sub" style={{ marginTop: 24 }}>
              Implantação e suporte em português pela SysAid Brasil.{" "}
              <a href="#demo" style={{ color: "var(--lime)" }}>
                Agende uma demonstração
              </a>{" "}
              para ver catálogo, mudança e Copilot rodando com um serviço da sua
              TI.
            </p>
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
            <div className="badges" style={{ marginTop: 48 }}>
              {["badge_2", "badge_5", "badge_7", "badge_3", "badge_6"].map((b) => (
                <Image
                  key={b}
                  src={`/badges/${b}.svg`}
                  alt="Reconhecimento SysAid em ITSM"
                  width={78}
                  height={78}
                  className="badge"
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
              <h2>O que perguntam sobre o ITIL 5</h2>
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
        <section className="section section--dark" id="demo">
          <div className="container container--narrow text-center">
            <p className="eyebrow" style={{ color: "var(--lime)" }}>
              Fale com um especialista
            </p>
            <h2>Veja as práticas do ITIL rodando com IA</h2>
            <p className="form-final__sub">
              Demonstração sem compromisso. Mostramos catálogo, mudança com
              análise de impacto pela CMDB e o Copilot resolvendo pedidos
              comuns, na mesma plataforma.
            </p>
            <div className="form-final__box" id="form">
              <LeadForm variant="final" submitLabel="Agende uma demonstração" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/itil-5" />
    </>
  );
}
