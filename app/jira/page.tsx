import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Alternativa ao Jira Service Management | ITSM com IA — SysAid Brasil",
  description:
    "IA de nível empresarial numa plataforma tudo em um: o SysAid entrega ITSM completo sem a complexidade e os add-ons do Jira. Gestão de ativos inclusa e suporte em português.",
  alternates: { canonical: "/jira" },
  openGraph: {
    title: "Alternativa ao Jira Service Management: ITSM com IA — SysAid Brasil",
    description:
      "ITSM completo sem marketplace de add-ons: IA nativa, gestão de ativos inclusa e suporte em português. Nota 9.4 na G2.",
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
    t: "Complexidade que vira projeto",
    d: "Configurar filas, esquemas de permissão e workflows no Jira costuma exigir consultoria ou um administrador dedicado. A ferramenta vira um projeto dentro da TI.",
  },
  {
    t: "Recursos essenciais via marketplace",
    d: "Gestão de ativos, relatórios avançados e integrações importantes dependem de add-ons pagos do Atlassian Marketplace, cada um com licença e manutenção próprias.",
  },
  {
    t: "O custo real aparece depois",
    d: "A assinatura é só o começo: some os add-ons, os apps de terceiros e as horas de administração, e o custo total fica bem acima da proposta inicial.",
  },
  {
    t: "Feito para devs, usado pela TI",
    d: "A lógica de projetos e issues nasceu no desenvolvimento de software. O service desk corporativo, com usuário final e SLA de operação, exige adaptação constante.",
  },
  {
    t: "IA distribuída em créditos e planos",
    d: "Os recursos de IA da suíte variam por plano e consomem créditos. Automatizar de verdade tem custo e limite que não aparecem de cara.",
  },
  {
    t: "Suporte global, realidade local",
    d: "Fuso, idioma e fila internacional. Quando a operação para numa segunda de manhã, a distância do suporte vira parte do problema.",
  },
];

const COMPARE = [
  { crit: "Nota geral (G2)", them: "Referência dev-first", sysaid: "9.4, plataforma ITSM tudo em um" },
  { crit: "Implantação", them: "Configuração complexa, plugins e consultoria", sysaid: "Rápida, low-code/no-code, pronta desde o dia 1" },
  { crit: "Gestão de ativos", them: "Add-on pago no Marketplace", sysaid: "ITAM incluso: ciclo de vida, contratos, licenças e CMDB" },
  { crit: "IA", them: "Varia por plano, com créditos", sysaid: "SysAid Copilot incluído + 100 agentes de IA prontos e AI Builder no-code" },
  { crit: "Custo total", them: "Assinatura + add-ons + administração", sysaid: "Preço transparente, sem taxas surpresa" },
  { crit: "Automação de fluxos de TI", them: "Poderosa, mas exige configuração avançada", sysaid: "Workflows nativos, ponta a ponta" },
  { crit: "Integrações", them: "Via Marketplace", sysaid: "1.000+ integrações nativas, do Teams ao Azure" },
  { crit: "Suporte", them: "Global, por plano", sysaid: "Local em português, com SLA contratual" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico da sua operação",
    d: "Mapeamos volume de chamados, projetos, filas, SLAs e os ativos que a sua TI atende hoje pelo Jira.",
  },
  {
    n: "02",
    t: "Migração da base e do histórico",
    d: "Chamados, categorias, usuários e ativos são importados. O histórico da sua TI não fica para trás.",
  },
  {
    n: "03",
    t: "Go live com a equipe treinada",
    d: "Configuração do portal, automações e Copilot, com treinamento e acompanhamento em português.",
  },
];

const FAQ = [
  {
    q: "O que torna o SysAid diferente do Jira Service Management?",
    a: "O SysAid é uma plataforma ITSM completa e fácil de usar, com IA nativa feita para equipes de TI. Ao contrário do Jira, que costuma exigir add-ons e configurações manuais, o SysAid oferece implantação rápida, preços transparentes e recursos avançados de IA prontos para uso desde o primeiro dia.",
  },
  {
    q: "O SysAid é realmente mais rápido de implementar do que o Jira?",
    a: "Sim. O SysAid permite implantação rápida, low-code/no-code, e entrega resultados imediatos. Ao contrário do Jira, que geralmente exige configurações complexas, plugins ou consultoria, o SysAid já vem pronto para uso.",
  },
  {
    q: "O SysAid cobra extra por recursos essenciais de ITSM?",
    a: "Não. O SysAid inclui funcionalidades críticas como gestão de ativos de TI, automação com IA e integrações, sem taxas surpresa ou add-ons caros. No Jira, muitos recursos importantes exigem a compra de apps adicionais no Atlassian Marketplace, aumentando o custo total.",
  },
  {
    q: "Quão avançada é a IA do SysAid em comparação com a do Jira?",
    a: "O SysAid oferece mais de 100 agentes de IA prontos para tarefas de ITSM e um AI Builder no-code para personalização. O Copilot entende o chamado, responde o usuário e executa a resolução sozinho, incluído na plataforma, sem pacote de créditos.",
  },
  {
    q: "E se o time de desenvolvimento continuar no Jira Software?",
    a: "Sem problema. O SysAid se integra ao ecossistema que a empresa já usa, incluindo mais de 1.000 integrações nativas. O service desk da TI ganha uma plataforma própria sem obrigar o time de dev a mudar de ferramenta.",
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

export default function JiraPage() {
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
                <strong>Orçamento: 3 add-ons pra renovar</strong>
                <span>Marketplace · Custo extra</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--2">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>31 usuários: reset de senha</strong>
                <span>Repetitivo · Acessos</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--3">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>Workflow novo: chamar consultoria</strong>
                <span>Complexidade · Administração</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--4">
              <span className="hero__dot hero__dot--green" />
              <div>
                <strong>Onboarding: acesso + VPN</strong>
                <span>Novo colaborador · RH</span>
              </div>
            </div>
            <div className="hero__resolved">✓ Resolvido pela IA</div>
          </div>

          <div className="container hero__inner">
            <p className="eyebrow">Para quem usa Jira Service Management</p>
            <h1>
              ITSM completo, <span className="hl">sem a complexidade</span> e os
              add-ons do Jira.
            </h1>
            <p className="hero__sub">
              Com IA de nível empresarial e uma plataforma tudo em um, o SysAid
              ajuda sua equipe a entregar mais: até 90% dos chamados resolvidos
              antes de virarem ticket, gestão de ativos inclusa e suporte local
              em português.
            </p>
            <div className="hero__form">
              <LeadForm variant="hero" />
            </div>
            <p className="hero__trust">
              Nota 9.4 na G2 · Migração do histórico incluída · Líder Emergente
              no Gartner® Innovation Guide de IA Generativa 2025
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

        {/* TRAVAS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O ponto de virada</p>
              <h2>O Jira é poderoso. O que trava no dia a dia da TI</h2>
              <p className="section-head__sub">
                Para times de desenvolvimento, ele é referência. A pergunta é
                quanto da sua TI está sendo gasta administrando a ferramenta em
                vez de entregar o serviço.
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
                Enquanto as ferramentas registram, o SysAid Copilot{" "}
                <span className="hl">resolve</span>
              </h2>
              <p className="ia__lead">
                Mais de 100 agentes de IA prontos para tarefas de ITSM e um AI
                Builder no-code para personalizar. Tudo incluído na plataforma,
                sem pacote de créditos.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>100+ agentes de IA prontos + AI Builder no-code</li>
                <li>Automação de tarefas repetitivas de TI ponta a ponta</li>
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
              <h2>Jira Service Management e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparativo honesto: onde o Jira entrega e onde uma plataforma
                tudo em um muda o custo e a velocidade da operação.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo Jira e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">Jira SM</span>
                <span role="columnheader" className="ctable__us">SysAid</span>
              </div>
              {COMPARE.map((row) => (
                <div className="ctable__row" role="row" key={row.crit}>
                  <span className="ctable__crit" role="cell">{row.crit}</span>
                  <span className="ctable__them" role="cell">{row.them}</span>
                  <span className="ctable__mine" role="cell">{row.sysaid}</span>
                </div>
              ))}
            </div>
            <p className="ctable__note">
              Jira, Jira Service Management e Atlassian são marcas de seus
              respectivos titulares. Comparativo elaborado pela SysAid Brasil
              com base na documentação pública das soluções e em avaliações de
              usuários na G2.com.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do Jira sem perder o histórico da sua TI</h2>
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
                <div className="stat__n">100+</div>
                <div className="stat__l">agentes de IA prontos pra usar</div>
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
              <h2>O que a TI pergunta antes de trocar</h2>
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
            <h2>Veja o SysAid resolver os chamados que hoje sobram pro time</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a plataforma rodando no
              cenário da sua TI, inclusive como ficaria a migração da sua base
              atual.
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
