import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

// Comparativa nova (7c, spec em clientes/sysaid/_growth/spec-7c-freshservice.md, 08/10/2026).
// Alvo: quem avalia o Freshservice ("freshservice pricing", "freshservice itsm", "freshservice demo"),
// não o login de cliente. Preço: tabela oficial da Freshworks lida em 08/10/2026, em dólar, sem conversão.
// Não atacar usabilidade (ponto forte deles): o ângulo é ITSM completo só no Pro, IA à parte e conta em dólar.
export const metadata: Metadata = {
  title: "Freshservice: alternativa ITSM com preço previsível | SysAid",
  description:
    "Compare SysAid e Freshservice: mudança, problema, CMDB e IA sem pular de plano nem pagar adicional por agente. Preço, recursos e implantação.",
  alternates: { canonical: "/freshservice" },
  openGraph: {
    title: "Alternativa ao Freshservice para ITSM — SysAid Brasil",
    description:
      "ITIL 4 completo, CMDB e IA nativa no mesmo pacote, com suporte local em português. Nota 4,5/5 no G2, com mais de 750 avaliações.",
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
    t: "ITSM completo só no plano Pro",
    d: "Na tabela da Freshworks, gestão de problema, de mudança e de release aparecem a partir do Pro, de US$ 99 por agente por mês. Nos planos de entrada a TI tem chamados, catálogo e SLA, mas não o ciclo ITIL inteiro.",
  },
  {
    t: "IA cobrada por agente, à parte",
    d: "O Freddy AI Copilot é um adicional de US$ 29 por agente por mês, contratado em cima do Pro ou do Enterprise. Num time de 10 analistas, a IA sozinha soma US$ 290 por mês.",
  },
  {
    t: "Conta em dólar",
    d: "Os planos são publicados por agente, por mês e em dólar, com cobrança anual. O custo em real muda com o câmbio, o que complica orçamento de TI fechado no ano anterior.",
  },
  {
    t: "Automação com cota",
    d: "A orquestração, que integra o Freshservice a outros sistemas, tem limite de transações por mês em cada plano: 1.000 no Starter, 2.000 no Growth, 5.000 no Pro e 20.000 no Enterprise.",
  },
  {
    t: "Upgrade quando o processo amadurece",
    d: "É comum começar no Starter ou no Growth e, quando a TI precisa controlar mudanças e problemas recorrentes, descobrir que o próximo passo é dobrar o preço por agente.",
  },
  {
    t: "Mesma marca do Freshdesk",
    d: "Freshservice e Freshdesk são produtos diferentes da Freshworks, com contratos separados. Quem busca um pelo outro acaba comparando a ferramenta errada.",
  },
];

const COMPARE = [
  { crit: "Processos ITIL 4", them: "Incidente no Starter; catálogo e SLA no Growth; problema, mudança e release a partir do Pro", sysaid: "Incidente, problema, mudança com aprovação e requisição, prontos pra usar" },
  { crit: "Gestão de mudança", them: "A partir do Pro (US$ 99 por agente/mês)", sysaid: "Inclusa, com fluxo de aprovação" },
  { crit: "CMDB e ativos", them: "Gestão de ativos em todos os planos, com unidades de ativos por plano", sysaid: "CMDB nativo e gestão de ativos inclusos na mesma base" },
  { crit: "IA generativa", them: "Freddy AI Copilot, adicional de US$ 29 por agente/mês no Pro e no Enterprise", sysaid: "SysAid Copilot incluído na plataforma" },
  { crit: "Automação e integrações", them: "Orquestração com cota mensal de transações por plano", sysaid: "Workflows e automações configurados em tela, sem código" },
  { crit: "Preço", them: "Publicado em dólar: Starter US$ 19, Growth US$ 49, Pro US$ 99; Enterprise sob consulta", sysaid: "Proposta personalizada, com gestão de ativos e Copilot inclusos, sem add-on" },
  { crit: "ESM (RH, facilities, financeiro)", them: "Sim", sysaid: "Sim, na mesma plataforma do ITSM" },
  { crit: "Implantação e suporte no Brasil", them: "Autosserviço ou parceiro", sysaid: "Configuração guiada e suporte local da SysAid Brasil, em português" },
];

const PLANOS = [
  { p: "Starter", v: "US$ 19", d: "Chamados e gestão de ativos. Sem catálogo de serviço e sem SLA." },
  { p: "Growth", v: "US$ 49", d: "Entra catálogo de serviço e SLA. Problema e mudança ainda não." },
  { p: "Pro", v: "US$ 99", d: "Gestão de problema, mudança e release. Copilot como adicional de US$ 29." },
  { p: "Enterprise", v: "Sob consulta", d: "Limites maiores de orquestração (20.000 transações por mês) e recursos corporativos." },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico do que existe",
    d: "Levantamos categorias, filas, SLAs, itens do catálogo e os ativos que a sua TI mantém no Freshservice, e o que depende de orquestração com outros sistemas.",
  },
  {
    n: "02",
    t: "Migração da base",
    d: "Chamados, usuários, categorias e ativos saem do Freshservice pela API e entram na SysAid, com o número original guardado como referência.",
  },
  {
    n: "03",
    t: "Go live com o time treinado",
    d: "Portal, automações e Copilot configurados, com treinamento e acompanhamento em português e o histórico da TI preservado.",
  },
];

const FAQ = [
  {
    q: "Freshservice e Freshdesk são a mesma coisa?",
    a: "Não. Os dois são da Freshworks, mas o Freshdesk é atendimento ao cliente externo e o Freshservice é a ferramenta de ITSM, a gestão de serviços de TI para o público interno. São produtos e contratos separados.",
  },
  {
    q: "Quanto custa o Freshservice?",
    a: "Na tabela publicada pela Freshworks em outubro de 2026, com cobrança anual, por agente e por mês: Starter US$ 19, Growth US$ 49 e Pro US$ 99; o Enterprise é sob consulta. O Freddy AI Copilot é adicional de US$ 29 por agente por mês. Como a conta é em dólar, o valor em real varia com o câmbio.",
  },
  {
    q: "O Freshservice tem gestão de mudança?",
    a: "Tem, a partir do plano Pro. Gestão de problema e de release também começam no Pro. Nos planos Starter e Growth a TI fica com chamados, portal, catálogo e SLA.",
  },
  {
    q: "Existe alternativa ao Freshservice com suporte no Brasil?",
    a: "Sim. A SysAid tem operação no Brasil e suporte local em português, com ITSM alinhado ao ITIL 4, CMDB, gestão de ativos, ESM e IA nativa na mesma plataforma, sem adicional de IA por agente.",
  },
  {
    q: "Como migrar do Freshservice para a SysAid?",
    a: "Chamados, usuários, categorias e ativos saem do Freshservice pela API e entram na SysAid com o número original como referência. Integrações feitas pela orquestração viram automações configuradas em tela. O diagnóstico inicial define o recorte do histórico e o prazo antes de começar.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/freshservice"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FreshservicePage() {
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
                <strong>Mudança precisa de aprovação</strong>
                <span>Recurso do plano Pro · Upgrade</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--3">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>Copilot por agente</strong>
                <span>+US$ 29/mês · Cobrança em dólar</span>
              </div>
            </div>
            <div className="hero__resolved">✓ Resolvido pela IA</div>
          </div>

          <div className="container hero__inner">
            <p className="eyebrow">Para quem avalia o Freshservice</p>
            <h1>
              Alternativa ao Freshservice para ITSM,{" "}
              <span className="hl">sem pular de plano</span>.
            </h1>
            <p className="hero__sub">
              Incidentes, problemas, mudanças com aprovação, CMDB, catálogo e
              SLA no mesmo pacote, com IA nativa sem adicional por agente e
              suporte local em português.
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
              <h2>O que é o Freshservice e para que serve</h2>
            </div>
            <p>
              O Freshservice é a ferramenta de ITSM, a gestão de serviços de TI,
              da Freshworks, a mesma empresa do Freshdesk. Atende o público
              interno: chamados de TI, portal de autoatendimento, catálogo de
              serviço, gestão de ativos e, nos planos de cima, os processos de
              problema, mudança e release do ITIL. Não confunda com o{" "}
              <a href="/freshdesk">Freshdesk</a>, que é atendimento ao cliente
              externo.
            </p>
            <p style={{ marginTop: 16 }}>
              O ponto forte é a facilidade de começar: interface limpa, teste
              grátis de 14 dias com tudo liberado e preço publicado no site. O
              outro lado aparece quando a TI amadurece: o ITSM completo mora no
              plano Pro, a IA generativa é cobrada por agente em cima dele e a
              conta inteira é em dólar. Se o termo ITSM ainda é novo pra você, o
              guia <a href="/o-que-e-itsm">o que é ITSM</a> explica o conceito
              antes da comparação.
            </p>
          </div>
        </section>

        {/* TRAVAS */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O ponto de virada</p>
              <h2>O que pesa no Freshservice quando a TI amadurece</h2>
              <p className="section-head__sub">
                Ninguém discute que é fácil de usar. A pergunta é quanto custa
                por agente quando a sua TI precisa de mudança, problema, CMDB e
                IA funcionando juntos.
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
                No Freshservice a IA é um adicional. O SysAid Copilot{" "}
                <span className="hl">já resolve o chamado</span>
              </h2>
              <p className="ia__lead">
                A IA nativa da SysAid entende o chamado, responde o usuário e
                executa a solução de casos comuns sozinha, usando o CMDB e a
                base de conhecimento como contexto. Vem incluída na plataforma,
                sem cobrança extra por agente e sem trocar de plano.
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
              <h2>Freshservice e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                O que a TI usa no dia a dia, em qual plano cada recurso aparece e
                o que entra no preço por agente.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo Freshservice e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">Freshservice</span>
                <span role="columnheader" className="ctable__us">SysAid</span>
              </div>
              {COMPARE.map((row) => (
                <div className="ctable__row" role="row" key={row.crit}>
                  <span className="ctable__crit" role="cell">{row.crit}</span>
                  <span className="ctable__them" role="cell" data-label="Freshservice">{row.them}</span>
                  <span className="ctable__mine" role="cell">{row.sysaid}</span>
                </div>
              ))}
            </div>
            <p className="ctable__note">
              Freshservice, Freshdesk, Freddy e Freshworks são marcas de seus
              respectivos titulares. Preços e recursos do Freshservice conforme a
              página de planos da Freshworks, consultada em outubro de 2026;
              comparativo elaborado pela SysAid Brasil com base em informações
              públicas das soluções.
            </p>
          </div>
        </section>

        {/* PREÇO */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Preço de tabela</p>
              <h2>Quanto custa o Freshservice</h2>
              <p className="section-head__sub">
                Valores por agente, por mês, com cobrança anual, em dólar,
                conforme a página de planos da Freshworks em outubro de 2026.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Planos do Freshservice">
              <div className="ctable__head" role="row">
                <span role="columnheader">Plano</span>
                <span role="columnheader">Por agente/mês</span>
                <span role="columnheader">O que muda</span>
              </div>
              {PLANOS.map((row) => (
                <div className="ctable__row" role="row" key={row.p}>
                  <span className="ctable__crit" role="cell">{row.p}</span>
                  <span className="ctable__them" role="cell" data-label="Por agente/mês">{row.v}</span>
                  <span className="ctable__them" role="cell" data-label="O que muda">{row.d}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 28 }}>
              A conta que importa é a do ITSM completo. Um time de 10 analistas
              no Pro paga US$ 990 por mês; com o Copilot, US$ 1.280 por mês, ou
              US$ 15.360 por ano, antes de câmbio e impostos. Na SysAid, CMDB,
              gestão de ativos e Copilot entram na mesma proposta, sem adicional
              por agente. Peça a proposta com o mesmo número de analistas e
              compare o total de três anos.
            </p>
          </div>
        </section>

        {/* QUANDO FAZ SENTIDO */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Sem rodeio</p>
              <h2>Quando o Freshservice faz sentido, e quando não</h2>
            </div>
            <h3>O Freshservice faz sentido se…</h3>
            <p>
              a TI é pequena, quer sair da planilha ou do e-mail rápido e, por
              enquanto, precisa só de chamados, portal e catálogo, sem gestão de
              mudança nem IA. Nesse cenário o Starter ou o Growth resolvem bem.
            </p>
            <h3 style={{ marginTop: 28 }}>A SysAid faz mais sentido se…</h3>
            <p>
              a TI já precisa do ciclo ITIL inteiro: chamados, problemas,
              mudanças com aprovação, CMDB, catálogo e SLA funcionando, IA
              resolvendo o repetitivo e um custo por analista que não salta
              de plano nem varia com o dólar. E, se depois o atendimento precisar
              chegar a RH e facilities, o mesmo sistema já faz{" "}
              <a href="/esm">ESM, a gestão de serviços corporativos</a>.
            </p>
            <p style={{ marginTop: 28 }}>
              Pra montar a sua régua de avaliação: os processos do ITIL 4 no
              guia de <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>,
              o papel do <a href="/service-desk">service desk</a> na operação, o{" "}
              <a href="/cmdb">CMDB</a> que sustenta mudança e problema e, na
              mesma faixa de mercado, <a href="/jira">SysAid x Jira Service Management</a> e{" "}
              <a href="/topdesk">SysAid x TOPdesk</a>.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do Freshservice sem perder o histórico da TI</h2>
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
              <h2>O que a TI pergunta sobre o Freshservice</h2>
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
            <h2>Veja o ITSM completo rodando, com IA inclusa</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a SysAid no cenário da
              sua TI e, se você já usa o Freshservice, como ficaria a migração.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/freshservice" />
    </>
  );
}
