import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

// Comparativa nova (7c, spec em clientes/sysaid/_growth/spec-7c-servicenow.md, 06/10/2026).
// Alvo: quem avalia o ServiceNow para ITSM ("itsm servicenow", "o que é servicenow", "servicenow preço"),
// não o "servicenow" seco, que é login de funcionário. O ServiceNow não publica preço: não inventar número.
export const metadata: Metadata = {
  title: "ServiceNow ITSM: o que é, preço e alternativa | SysAid",
  description:
    "O que é o ServiceNow, como ele cobra e quando faz sentido. Compare com a SysAid: ITSM com ITIL 4, CMDB e IA, sem projeto de plataforma e com suporte em português.",
  alternates: { canonical: "/servicenow" },
  openGraph: {
    title: "Alternativa ao ServiceNow para ITSM — SysAid Brasil",
    description:
      "O núcleo de ITSM com ITIL 4, CMDB e IA nativa, sem time de desenvolvimento pra manter a ferramenta. Nota 4,5/5 no G2, com mais de 750 avaliações.",
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
    t: "Preço que não está na vitrine",
    d: "O ServiceNow não publica preço. A licença é por usuário que atende chamados e por pacote, negociada caso a caso e muitas vezes contratada junto com um parceiro de implantação.",
  },
  {
    t: "Implantação vira projeto",
    d: "Deixar a plataforma do jeito da empresa costuma envolver parceiro certificado, levantamento de processos e semanas ou meses de configuração antes de o time de TI sentir a diferença.",
  },
  {
    t: "Precisa de gente só pra manter",
    d: "Administrador e desenvolvedor ServiceNow são cargos próprios no mercado. Formulários, fluxos e integrações sob medida são escritos na plataforma e pedem alguém dedicado depois do go live.",
  },
  {
    t: "Duas versões novas por ano",
    d: "A plataforma lança duas versões por ano. Cada atualização pede teste das customizações feitas, e quanto mais a instância foi personalizada, mais trabalho o upgrade dá.",
  },
  {
    t: "IA generativa nos pacotes de cima",
    d: "O Now Assist, a IA generativa do ServiceNow, vem nos pacotes superiores da plataforma. Pra quem contrata o pacote de entrada, a IA vira mais um item da negociação.",
  },
  {
    t: "Escala de grande corporação",
    d: "São dezenas de módulos e muita possibilidade. Uma TI que precisa de chamados, mudanças, ativos e SLA bem feitos acaba pagando por um tamanho de plataforma que não chega a usar.",
  },
];

const COMPARE = [
  { crit: "Para quem foi feito", them: "Grandes corporações com time interno dedicado à plataforma", sysaid: "TIs de médio e grande porte que querem ITSM completo sem time de desenvolvimento" },
  { crit: "Preço", them: "Não publicado: licença por usuário e por pacote, sob consulta", sysaid: "Proposta personalizada, com gestão de ativos e Copilot inclusos, sem add-on" },
  { crit: "Implantação", them: "Projeto, geralmente com parceiro certificado", sysaid: "Configuração guiada com suporte local em português; prazo definido no diagnóstico" },
  { crit: "Quem administra no dia a dia", them: "Administrador da plataforma e, pra customizar, desenvolvedor", sysaid: "O próprio time de TI, por configuração em tela, sem código" },
  { crit: "Processos ITIL 4", them: "Incidente, problema, mudança e requisição, com cobertura ampla", sysaid: "Incidente, problema, mudança com aprovação e requisição, prontos pra usar" },
  { crit: "CMDB e ativos", them: "CMDB na plataforma; descoberta automática em módulo de operações (ITOM)", sysaid: "CMDB nativo e gestão de ativos inclusos na mesma base" },
  { crit: "IA generativa", them: "Now Assist, nos pacotes superiores", sysaid: "SysAid Copilot incluído na plataforma" },
  { crit: "ESM (RH, facilities, financeiro)", them: "Sim, em módulos próprios por área", sysaid: "Sim, na mesma plataforma do ITSM" },
  { crit: "Atendimento no Brasil", them: "Escritório no Brasil; implantação e sustentação em geral com parceiro", sysaid: "Suporte local da SysAid Brasil, em português" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico do que existe",
    d: "Levantamos processos, categorias, filas, SLAs e o CMDB que a sua TI mantém no ServiceNow, e separamos o que é customização que precisa de equivalente.",
  },
  {
    n: "02",
    t: "Migração da base",
    d: "Chamados, usuários, categorias, itens de configuração e relações do CMDB são exportados e importados. O que a sua TI já modelou não se perde.",
  },
  {
    n: "03",
    t: "Go live com o time treinado",
    d: "Portal, automações e Copilot configurados, com treinamento e acompanhamento em português, sem desenvolvedor no meio do caminho.",
  },
];

const FAQ = [
  {
    q: "O que é o ServiceNow?",
    a: "É uma plataforma americana de fluxos de trabalho corporativos que nasceu como ferramenta de ITSM. Hoje reúne módulos de TI, RH, atendimento ao cliente e segurança sobre a mesma base, a Now Platform, e é usada principalmente por grandes empresas.",
  },
  {
    q: "O ServiceNow é uma ferramenta de ITSM?",
    a: "Sim. O ITSM é o módulo de origem e o mais usado: incidentes, problemas, mudanças, requisições, catálogo e CMDB, seguindo o ITIL. A diferença pra uma ferramenta de ITSM dedicada está no tamanho da plataforma em volta e no esforço pra implantar e manter.",
  },
  {
    q: "Quanto custa o ServiceNow?",
    a: "O ServiceNow não publica preço. A licença é negociada por usuário que atende chamados e por pacote, e o custo total inclui a implantação, em geral com parceiro, e as pessoas que administram a plataforma. Pra comparar com a SysAid, peça as duas propostas com o mesmo escopo e some licença, implantação e sustentação de três anos.",
  },
  {
    q: "Existe alternativa ao ServiceNow com suporte em português?",
    a: "Sim. A SysAid tem operação no Brasil e suporte local em português, com ITSM alinhado ao ITIL 4, CMDB, gestão de ativos, ESM e IA nativa na mesma plataforma.",
  },
  {
    q: "É difícil migrar do ServiceNow para a SysAid?",
    a: "Depende de quanto a sua instância foi customizada. Chamados, usuários, categorias e itens do CMDB migram; fluxos escritos sob medida são refeitos como automações por configuração na SysAid. O diagnóstico inicial mapeia isso e define o prazo antes de começar.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/servicenow"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ServiceNowPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                <strong>Upgrade de versão agendado</strong>
                <span>Plataforma · Testar customizações</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--3">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>Licença por usuário</strong>
                <span>Sob consulta · Via parceiro</span>
              </div>
            </div>
            <div className="hero__resolved">✓ Resolvido pela IA</div>
          </div>

          <div className="container hero__inner">
            <p className="eyebrow">Para quem avalia o ServiceNow</p>
            <h1>
              Alternativa ao ServiceNow para ITSM,{" "}
              <span className="hl">sem virar projeto de plataforma</span>.
            </h1>
            <p className="hero__sub">
              O núcleo de ITSM que a sua TI usa todo dia (incidentes, problemas,
              mudanças com aprovação, CMDB, catálogo e SLA) com IA nativa e
              suporte local em português, sem time de desenvolvimento pra
              manter a ferramenta.
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
                  alt={c}
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
              <h2>O que é o ServiceNow e para que serve</h2>
            </div>
            <p>
              O ServiceNow é uma plataforma americana de fluxos de trabalho
              corporativos, fundada em 2004 na Califórnia. Começou como
              ferramenta de ITSM, a gestão de serviços de TI, e virou uma
              plataforma inteira, a Now Platform, onde rodam módulos de TI
              (serviços, operações e ativos), RH, atendimento ao cliente,
              segurança e o que mais a empresa quiser construir em cima dela.
            </p>
            <p style={{ marginTop: 16 }}>
              Por isso ele é referência em grandes corporações: quem tem um time
              interno dedicado à plataforma e quer padronizar muitos processos
              num lugar só encontra ali uma base muito flexível. O outro lado da
              flexibilidade é que quase tudo vira projeto: licença negociada,
              implantação com parceiro, administradores e desenvolvedores
              dedicados e versão nova pra testar duas vezes por ano. Se o
              próprio termo ainda é novo pra você, o guia{" "}
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
              <h2>O que pesa no ServiceNow quando a meta é só o ITSM bem feito</h2>
              <p className="section-head__sub">
                Ninguém discute o tamanho da plataforma. A pergunta é quanto
                dela a sua TI vai usar, e quanto vai pagar em licença, projeto e
                gente pra manter o resto funcionando.
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
                O ServiceNow entrega a plataforma. O SysAid Copilot{" "}
                <span className="hl">já resolve o chamado</span>
              </h2>
              <p className="ia__lead">
                A IA nativa da SysAid entende o chamado, responde o usuário e
                executa a solução de casos comuns sozinha, usando o CMDB e a
                base de conhecimento como contexto. Vem incluída na plataforma,
                sem pacote à parte e sem desenvolvedor pra configurar.
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
              <h2>ServiceNow e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparação de ITSM, não de plataforma inteira: o que a TI usa no
                dia a dia, quanto custa colocar no ar e quem mantém depois.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo ServiceNow e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">ServiceNow</span>
                <span role="columnheader" className="ctable__us">SysAid</span>
              </div>
              {COMPARE.map((row) => (
                <div className="ctable__row" role="row" key={row.crit}>
                  <span className="ctable__crit" role="cell">{row.crit}</span>
                  <span className="ctable__them" role="cell" data-label="ServiceNow">{row.them}</span>
                  <span className="ctable__mine" role="cell">{row.sysaid}</span>
                </div>
              ))}
            </div>
            <p className="ctable__note">
              ServiceNow e Now Assist são marcas de seus respectivos titulares.
              O ServiceNow não divulga preço; comparativo elaborado pela SysAid
              Brasil com base em informações públicas das soluções.
            </p>
          </div>
        </section>

        {/* QUANDO FAZ SENTIDO */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Sem rodeio</p>
              <h2>Quando o ServiceNow faz sentido, e quando não</h2>
            </div>
            <h3>O ServiceNow faz sentido se…</h3>
            <p>
              a empresa tem milhares de colaboradores, um time interno dedicado
              à plataforma e quer construir sobre ela processos que vão muito
              além da TI, com orçamento e prazo de projeto pra isso.
            </p>
            <h3 style={{ marginTop: 28 }}>A SysAid faz mais sentido se…</h3>
            <p>
              o objetivo é ter o ITSM bem feito agora: chamados, problemas,
              mudanças com aprovação, CMDB, catálogo e SLA funcionando, IA
              resolvendo o repetitivo e a própria TI administrando a ferramenta
              sem depender de desenvolvedor. E, se depois o atendimento precisar
              chegar a RH e facilities, o mesmo sistema já faz{" "}
              <a href="/esm">ESM, a gestão de serviços corporativos</a>.
            </p>
            <p style={{ marginTop: 28 }}>
              Pra montar a sua régua de avaliação: os processos do ITIL 4 no
              guia de <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>,
              o papel do <a href="/service-desk">service desk</a> na operação e,
              na mesma faixa de mercado, <a href="/topdesk">SysAid x TOPdesk</a> e{" "}
              <a href="/jira">SysAid x Jira Service Management</a>.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do ServiceNow sem perder o que a sua TI já modelou</h2>
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
              <h2>O que a TI pergunta sobre o ServiceNow</h2>
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
            <h2>Veja o ITSM que a sua TI precisa rodando, sem projeto de plataforma</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a SysAid no cenário da
              sua TI e, se você já usa o ServiceNow, como ficaria a migração.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/servicenow" />
    </>
  );
}
