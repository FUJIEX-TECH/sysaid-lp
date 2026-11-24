import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { breadcrumbSchema, datasDaPagina } from "@/lib/seo";
import { altCliente, altSelo } from "@/lib/marcas";

// Comparativa nova (spec em clientes/sysaid/_growth/spec-proxima-comparativa-2026-11-11.md, 11/11/2026).
// Alvo: quem avalia o ManageEngine ServiceDesk Plus ("servicedesk plus", "manageengine servicedesk plus",
// "manageengine brasil", "alternativa ao manageengine"). Preço conferido em manageengine.com em 11/11/2026
// (a página diz "current as of September 2026"); conferir de novo a cada revisão, nada de número inventado.
export const metadata: Metadata = {
  title: "ManageEngine ServiceDesk Plus: preço e alternativa | SysAid",
  description:
    "O que é o ServiceDesk Plus da ManageEngine, como ele cobra (por técnico e por ativo, em dólar) e quando faz sentido. Compare com a SysAid: ITSM completo, IA agêntica e suporte em português.",
  alternates: { canonical: "/manageengine" },
  openGraph: {
    title: "Alternativa ao ManageEngine ServiceDesk Plus — SysAid Brasil",
    description:
      "ITIL 4, CMDB, gestão de ativos e IA agêntica numa plataforma só, sem trocar de edição pra ter mudança e CMDB. Nota 4,5/5 no G2, com mais de 750 avaliações.",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const TRAVAS = [
  {
    t: "O ITSM completo fica na edição de cima",
    d: "O ServiceDesk Plus vem em três edições. Gestão de mudança, projetos e CMDB só aparecem na Enterprise; a Standard é o service desk de chamados e a Professional soma a gestão de ativos.",
  },
  {
    t: "Licença que cresce com técnico e com ativo",
    d: "A Standard é cobrada por técnico. Na Professional e na Enterprise o preço também depende de quantos ativos de TI a ferramenta gerencia, então o custo sobe junto com o parque, não só com o time.",
  },
  {
    t: "Preço em dólar",
    d: "Os valores públicos da ManageEngine são em dólar, com assinatura mensal ou anual. Pra quem orça em real, o custo da renovação acompanha o câmbio do ano.",
  },
  {
    t: "Agentes de IA só na Enterprise",
    d: "A IA da ManageEngine, a Zia, tem recursos em todas as edições, mas os Zia Agents, que executam tarefas, estão incluídos só na edição Enterprise.",
  },
  {
    t: "On-premises é servidor pra manter",
    d: "A versão instalada roda na infraestrutura da empresa: servidor, banco, backup e atualização ficam com a TI. Muita gente escolhe por isso, e muita gente quer sair por isso.",
  },
  {
    t: "Um produto entre dezenas",
    d: "A ManageEngine tem um portfólio grande de ferramentas de TI (monitoramento, endpoint, Active Directory). O ServiceDesk Plus é uma delas, e integrar o resto costuma significar mais licenças.",
  },
];

const COMPARE = [
  { crit: "Para quem foi feito", them: "TIs de todos os portes, da equipe pequena (edição gratuita) à grande empresa", sysaid: "TIs de médio e grande porte que querem ITSM completo sem montar a ferramenta aos poucos" },
  { crit: "Preço", them: "Publicado em dólar: por técnico e, na Professional e na Enterprise, também por ativo", sysaid: "Proposta personalizada em real, com gestão de ativos e Copilot inclusos, sem add-on" },
  { crit: "Gestão de mudança e CMDB", them: "Só na edição Enterprise", sysaid: "Inclusos na plataforma, junto com incidente, problema e requisição" },
  { crit: "Processos ITIL 4", them: "Cobertura completa na Enterprise", sysaid: "Incidente, problema, mudança com aprovação e requisição, prontos pra usar" },
  { crit: "IA", them: "Zia em todas as edições; Zia Agents só na Enterprise", sysaid: "SysAid Copilot com IA agêntica e mais de 100 agentes prontos, incluído na plataforma" },
  { crit: "Nuvem ou instalado", them: "Nuvem e on-premises", sysaid: "Nuvem, com a infraestrutura mantida pela SysAid" },
  { crit: "ESM (RH, facilities, financeiro)", them: "Sim, com instâncias por área", sysaid: "Sim, na mesma plataforma do ITSM" },
  { crit: "Atendimento no Brasil", them: "Fabricante indiano; venda e implantação no Brasil em geral por revenda parceira", sysaid: "Suporte local da SysAid Brasil, em português" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico do que existe",
    d: "Levantamos categorias, filas, SLAs, modelos de solicitação e o inventário de ativos que a sua TI mantém no ServiceDesk Plus, e o que precisa de equivalente na SysAid.",
  },
  {
    n: "02",
    t: "Migração da base",
    d: "Chamados, usuários, categorias, ativos e relações são exportados e importados. Se a sua versão é instalada, a exportação sai do próprio servidor, sem depender do fabricante.",
  },
  {
    n: "03",
    t: "Go live com o time treinado",
    d: "Portal, automações e Copilot configurados, com treinamento e acompanhamento em português, e sem servidor pra manter depois.",
  },
];

const FAQ = [
  {
    q: "O que é o ManageEngine ServiceDesk Plus?",
    a: "É a ferramenta de ITSM da ManageEngine, divisão de software de TI da Zoho Corporation, empresa indiana. Faz gestão de chamados, requisições, ativos e, na edição Enterprise, mudanças, projetos e CMDB, seguindo o ITIL. Existe em versão na nuvem e instalada (on-premises).",
  },
  {
    q: "Quanto custa o ServiceDesk Plus?",
    a: "A ManageEngine publica preço em dólar. Na consulta de 11/11/2026, a página dizia: edição Standard grátis até 5 técnicos e paga a partir de US$ 13 por técnico por mês (on-premises); a partir de US$ 1.195 por ano para 10 técnicos na Standard instalada; Professional e Enterprise cobradas por técnico e por quantidade de ativos de TI. Os valores mudam: confira no site do fabricante e compare com uma proposta da SysAid de mesmo escopo, somando licença, implantação e manutenção de três anos.",
  },
  {
    q: "O ServiceDesk Plus tem versão gratuita?",
    a: "Tem. A edição Standard é gratuita até 5 técnicos, na nuvem e instalada, e há teste de 30 dias das edições pagas. A gratuita é o service desk de chamados: gestão de ativos, mudança e CMDB ficam nas edições pagas.",
  },
  {
    q: "Existe alternativa ao ManageEngine com suporte em português?",
    a: "Sim. A SysAid tem operação no Brasil e suporte local em português, com ITSM alinhado ao ITIL 4, CMDB, gestão de ativos, ESM e IA nativa na mesma plataforma, sem escolher edição pra ter gestão de mudança.",
  },
  {
    q: "O SysAid é um service desk com IA agêntica, que resolve chamados sozinho?",
    a: "Sim. O SysAid Copilot é IA agêntica: não se limita a sugerir texto, ele entende a solicitação, responde o usuário e executa a resolução de casos comuns sozinho, até 90% antes de virar chamado. A plataforma traz mais de 100 agentes de IA prontos para tarefas de ITSM e um AI Builder no-code para criar novos; o Copilot está incluído na plataforma, sem pacote de créditos. No ServiceDesk Plus, os agentes da Zia ficam na edição Enterprise.",
  },
  {
    q: "É difícil migrar do ServiceDesk Plus para a SysAid?",
    a: "Chamados, usuários, categorias e ativos migram por exportação e importação; regras de negócio e modelos de solicitação são refeitos como automações por configuração na SysAid. O diagnóstico inicial mapeia isso e define o prazo antes de começar.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/manageengine"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ManageEnginePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema("/manageengine")) }}
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
        {/* HERO */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
            <div className="hero__ticket hero__ticket--1">
              <span className="hero__dot hero__dot--red" />
              <div>
                <strong>Mudança precisa de aprovação</strong>
                <span>Recurso da edição Enterprise</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--3">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>Renovação da licença</strong>
                <span>US$ · Por técnico e por ativo</span>
              </div>
            </div>
            <div className="hero__resolved">✓ Resolvido pela IA</div>
          </div>

          <div className="container hero__inner">
            <p className="eyebrow">Para quem avalia o ManageEngine</p>
            <h1>
              Alternativa ao ManageEngine ServiceDesk Plus,{" "}
              <span className="hl">com o ITSM inteiro desde o início</span>.
            </h1>
            <p className="hero__sub">
              Incidentes, problemas, mudanças com aprovação, CMDB, ativos e SLA
              numa plataforma só, com IA agêntica incluída e suporte local em
              português, sem escolher edição pra ter gestão de mudança e sem
              servidor pra manter.
            </p>
            <div className="hero__form">
              <LeadForm variant="hero" />
            </div>
            <p className="hero__trust">
              Nota 4,5/5 no G2 (750+ avaliações) · ITIL 4, CMDB e ESM na mesma
              plataforma · Suporte em português
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
                  alt={altCliente(c)}
                  width={150}
                  height={60}
                  className="proof__logo"
                />
              ))}
            </div>
          </div>
        </section>

        {/* O QUE É */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Antes de comparar</p>
              <h2>O que é o ManageEngine ServiceDesk Plus</h2>
            </div>
            <p>
              O ServiceDesk Plus é a ferramenta de ITSM da ManageEngine, a
              divisão de software de gestão de TI da Zoho Corporation, empresa
              indiana. É conhecido pela edição gratuita para equipes pequenas,
              pela versão instalada (on-premises), que muita TI brasileira
              prefere por política de dados, e pelo preço publicado no site.
            </p>
            <p style={{ marginTop: 16 }}>
              Ele vem em três edições: Standard (chamados), Professional
              (chamados e gestão de ativos) e Enterprise (com gestão de mudança,
              projetos e CMDB). Por isso a comparação com a SysAid precisa ser
              feita edição contra escopo: o que a sua TI usa hoje e o que vai
              precisar quando quiser mudança com aprovação, CMDB e agentes de
              IA. Se o próprio termo ainda é novo pra você, o guia{" "}
              <a href="/o-que-e-itsm">o que é ITSM</a> explica o conceito antes
              da comparação.
            </p>
          </div>
        </section>

        {/* TRAVAS */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O ponto de virada</p>
              <h2>O que pesa no ServiceDesk Plus quando a TI cresce</h2>
              <p className="section-head__sub">
                O começo é barato e simples. A conta muda quando a TI precisa de
                mudança, CMDB e IA que executa, e quando o parque de ativos e o
                dólar sobem juntos na renovação.
              </p>
            </div>
            <div className="grid-3">
              {TRAVAS.map((t) => (
                <div className="card" key={t.t}>
                  <h3>{t.t}</h3>
                  <p>{t.d}</p>
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
                O diferencial
              </p>
              <h2>
                Sem esperar a edição de cima: o SysAid Copilot{" "}
                <span className="hl">já resolve o chamado</span>
              </h2>
              <p className="ia__lead">
                A IA nativa da SysAid entende o chamado, responde o usuário e
                executa a solução de casos comuns sozinha, usando o CMDB e a
                base de conhecimento como contexto. Vem incluída na plataforma,
                com mais de 100 agentes prontos, sem pacote à parte.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Sugestão de resposta e resumo pro analista no que chega ao time</li>
                <li>Automação de tarefas repetitivas de TI de ponta a ponta</li>
                <li>Configuração por tela, sem código</li>
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

        {/* COMPARATIVO */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Lado a lado</p>
              <h2>ServiceDesk Plus e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparação de ITSM: o que a TI usa no dia a dia, em qual edição
                cada recurso aparece e quem mantém a ferramenta depois.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo ServiceDesk Plus e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">ServiceDesk Plus</span>
                <span role="columnheader" className="ctable__us">SysAid</span>
              </div>
              {COMPARE.map((row) => (
                <div className="ctable__row" role="row" key={row.crit}>
                  <span className="ctable__crit" role="cell">{row.crit}</span>
                  <span className="ctable__them" role="cell" data-label="ServiceDesk Plus">{row.them}</span>
                  <span className="ctable__mine" role="cell">{row.sysaid}</span>
                </div>
              ))}
            </div>
            <p className="ctable__note">
              ManageEngine, ServiceDesk Plus e Zia são marcas de seus respectivos
              titulares. Preços e edições conferidos no site da ManageEngine em
              11/11/2026; comparativo elaborado pela SysAid Brasil com base em
              informações públicas das soluções.
            </p>
          </div>
        </section>

        {/* QUANDO FAZ SENTIDO */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Sem rodeio</p>
              <h2>Quando o ServiceDesk Plus faz sentido, e quando não</h2>
            </div>
            <h3>O ServiceDesk Plus faz sentido se…</h3>
            <p>
              a equipe de TI é pequena e só precisa de chamados (a edição gratuita
              atende até 5 técnicos), ou a política da empresa exige ferramenta
              instalada no próprio servidor e há gente pra manter esse servidor.
            </p>
            <h3 style={{ marginTop: 28 }}>A SysAid faz mais sentido se…</h3>
            <p>
              a TI quer o ITSM inteiro de uma vez: chamados, problemas, mudanças
              com aprovação, CMDB, ativos e SLA funcionando, IA agêntica
              resolvendo o repetitivo, proposta em real e suporte em português,
              sem servidor pra manter. E, se depois o atendimento precisar
              chegar a RH e facilities, o mesmo sistema já faz{" "}
              <a href="/esm">ESM, a gestão de serviços corporativos</a>.
            </p>
            <p style={{ marginTop: 28 }}>
              Pra montar a sua régua de avaliação: os processos do ITIL 4 no
              guia de <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>,
              o papel do <a href="/service-desk">service desk</a> na operação e,
              na mesma faixa de mercado, <a href="/topdesk">SysAid x TOPdesk</a>,{" "}
              <a href="/freshservice">SysAid x Freshservice</a> e{" "}
              <a href="/servicenow">SysAid x ServiceNow</a>.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do ServiceDesk Plus sem perder o histórico da TI</h2>
            </div>
            <div className="grid-3">
              {MIGRACAO.map((m) => (
                <div className="step" key={m.n}>
                  <span className="step__n">{m.n}</span>
                  <h3>{m.t}</h3>
                  <p>{m.d}</p>
                </div>
              ))}
            </div>
            <div className="badges" style={{ marginTop: 48 }}>
              {["badge_2", "badge_5", "badge_7", "badge_3", "badge_6"].map((b) => (
                <Image
                  key={b}
                  src={`/badges/${b}.svg`}
                  alt={altSelo(b)}
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
              <h2>O que a TI pergunta sobre o ServiceDesk Plus</h2>
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
            <h2>Veja o ITSM completo rodando no cenário da sua TI</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a SysAid no cenário da
              sua TI e, se você já usa o ServiceDesk Plus, como ficaria a migração.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/manageengine" />
    </>
  );
}
