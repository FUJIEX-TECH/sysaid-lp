import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Alternativa ao Freshdesk | ITSM com IA para a sua TI — SysAid Brasil",
  description:
    "Freshdesk atende clientes. Sua TI precisa de ITSM. Conheça a plataforma com IA que resolve até 90% dos chamados antes de virarem ticket, com gestão de ativos, SLA e suporte em português.",
  alternates: { canonical: "/freshdesk" },
  openGraph: {
    title: "Alternativa ao Freshdesk: ITSM com IA — SysAid Brasil",
    description:
      "Do help desk de atendimento a uma plataforma ITSM completa com IA nativa, gestão de ativos e suporte em português. Nota 9.4 na G2.",
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
    t: "Ferramenta de atendimento na função de ITSM",
    d: "O Freshdesk nasceu para atender clientes. Chamado de TI vira ticket de suporte genérico: sem gestão de mudanças, problemas ou CMDB relacionando o incidente ao ativo.",
  },
  {
    t: "O preço cresce junto com o time",
    d: "Cobrança por agente, por mês. Cada analista novo, cada plantonista e cada estagiário de TI entra na fatura, e os recursos que importam ficam nos planos de cima.",
  },
  {
    t: "IA vendida à parte",
    d: "A IA da suíte funciona por pacotes de créditos e add-ons. O custo de automatizar de verdade aparece depois da assinatura, não na proposta.",
  },
  {
    t: "Ativos exigem outro produto",
    d: "Inventário, ciclo de vida e licenças de TI vivem no Freshservice, um produto separado da mesma suíte. Duas ferramentas, dois contratos, duas curvas de adoção.",
  },
  {
    t: "Suporte global, realidade local",
    d: "Fuso, idioma e fila internacional. Quando a operação para numa segunda de manhã, a distância do suporte vira parte do problema.",
  },
  {
    t: "Relatório de TI limitado",
    d: "Métricas pensadas para CSAT e atendimento ao cliente. SLA de TI, auditoria e visão executiva da operação exigem customização ou exportação manual.",
  },
];

const COMPARE = [
  { crit: "Nota geral (G2)", them: "8.7", sysaid: "9.4" },
  { crit: "Foco do produto", them: "Atendimento ao cliente (CX)", sysaid: "ITSM: gestão de serviços de TI" },
  { crit: "IA que resolve o chamado", them: "Freddy AI, com créditos e add-ons", sysaid: "SysAid Copilot incluído: até 90% resolvidos antes de virar ticket" },
  { crit: "Gestão de ativos", them: "Em outro produto (Freshservice)", sysaid: "ITAM nativo: ciclo de vida, contratos, licenças e CMDB" },
  { crit: "Atende aos requisitos (G2)", them: "85", sysaid: "94" },
  { crit: "Facilidade de uso (G2)", them: "88", sysaid: "94" },
  { crit: "Qualidade do suporte (G2)", them: "89", sysaid: "90, com atendimento em português" },
  { crit: "ROI: retorno em meses (G2)", them: "12 meses", sysaid: "11 meses" },
  { crit: "Workflows de TI", them: "Automação voltada a atendimento", sysaid: "Automação de TI ponta a ponta, com 1.000+ integrações" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico da sua operação",
    d: "Mapeamos volume de chamados, categorias, filas, SLAs e os ativos que a sua TI atende hoje pelo Freshdesk.",
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
    q: "Já uso o Freshdesk para a TI. Por que trocar?",
    a: "Porque help desk de atendimento e ITSM resolvem problemas diferentes. O Freshdesk organiza conversas com clientes; uma plataforma ITSM gerencia o serviço de TI inteiro: incidentes ligados a ativos, mudanças com aprovação, problemas com causa raiz e SLA de operação. Se a sua TI usa uma ferramenta de CX, ela está preenchendo essa lacuna manualmente.",
  },
  {
    q: "E comparado ao Freshservice, que é o ITSM da mesma suíte?",
    a: "O Freshservice cobre ITSM, mas mantém o modelo da suíte: preço por agente, IA por créditos e recursos-chave nos planos superiores. No SysAid, Copilot, gestão de ativos e workflows fazem parte da plataforma, com implementação e suporte local em português inclusos. Nas avaliações da G2, o SysAid tem nota geral 9.4.",
  },
  {
    q: "Dá para migrar o histórico de tickets?",
    a: "Sim. Chamados, categorias, usuários e ativos são importados na migração. O diagnóstico inicial define exatamente o que vem, em que formato e em qual ordem, para o go live não perder rastreabilidade.",
  },
  {
    q: "Qual é a diferença prática da IA do SysAid?",
    a: "O SysAid Copilot não se limita a sugerir texto. Ele entende a solicitação, responde o usuário e executa a resolução de casos comuns sozinho, além de sugerir respostas ao agente no que chega ao time. E está incluído na plataforma, sem pacote de créditos.",
  },
  {
    q: "Quanto tempo leva a implantação?",
    a: "A implantação típica é rápida e acompanhada por suporte local em português. O prazo exato depende do volume de dados a migrar e da maturidade da operação, e é definido no diagnóstico.",
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

export default function FreshdeskPage() {
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
                <strong>Fatura subiu: 4 agentes novos no plano</strong>
                <span>Preço por agente · Contrato</span>
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
                <strong>Inventário de ativos em outra ferramenta</strong>
                <span>Sem CMDB · Governança</span>
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
            <p className="eyebrow">Para quem usa Freshdesk ou Freshservice</p>
            <h1>
              Freshdesk atende clientes. Sua TI precisa de{" "}
              <span className="hl">ITSM que resolve</span>.
            </h1>
            <p className="hero__sub">
              A plataforma ITSM com IA nativa que resolve até 90% dos chamados
              antes de virarem ticket, com gestão de ativos, SLA e suporte local
              em português. Mais de 400 empresas no Brasil.
            </p>
            <div className="hero__form">
              <LeadForm variant="hero" />
            </div>
            <p className="hero__trust">
              Nota 9.4 na G2 · Migração do histórico incluída · Reconhecida por
              G2, Gartner e TrustRadius
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
              <h2>O Freshdesk organizou o atendimento. O que trava na TI</h2>
              <p className="section-head__sub">
                Para conversar com cliente, ele cumpre o papel. A pergunta é se
                a operação de TI da sua empresa deveria rodar numa ferramenta
                desenhada para outro problema.
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
                A inteligência artificial nativa da SysAid entende o chamado,
                responde o usuário e executa a solução sozinha. Incluída na
                plataforma, sem pacote de créditos.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>Respostas sugeridas ao agente, direto no fluxo</li>
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
              <h2>Freshdesk e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparativo com base nas avaliações públicas de usuários na
                G2.com, a maior plataforma de análise de software de negócios.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo Freshdesk e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">Freshdesk</span>
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
              Freshdesk, Freshservice e Freshworks são marcas de seus
              respectivos titulares. Notas conforme avaliações de usuários
              publicadas na G2.com; comparativo elaborado pela SysAid Brasil
              com base em dados públicos das soluções.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do Freshdesk sem perder o histórico da sua TI</h2>
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
                <div className="stat__n">9.4</div>
                <div className="stat__l">nota geral na G2</div>
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
