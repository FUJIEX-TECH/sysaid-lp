import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Alternativa ao Movidesk | ITSM com IA para a sua TI — SysAid Brasil",
  description:
    "Sua operação cresceu além do Movidesk? Conheça a plataforma ITSM com IA que resolve até 90% dos chamados antes de virarem ticket, com gestão de ativos, SLA e suporte em português.",
  alternates: { canonical: "/movidesk" },
  openGraph: {
    title: "Alternativa ao Movidesk: ITSM com IA — SysAid Brasil",
    description:
      "Do help desk de atendimento a uma plataforma ITSM completa com IA nativa. Nota 9.4 vs 6.7 na G2.",
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
    t: "Help desk de atendimento, não ITSM",
    d: "O Movidesk nasceu para organizar o atendimento ao cliente de PMEs. Gestão de mudanças, problemas, CMDB e governança de TI não são o centro do produto.",
  },
  {
    t: "A operação cresceu, a ferramenta não",
    d: "O que funcionava com uma fila e poucos agentes começa a doer com múltiplas equipes, SLAs distintos e auditoria. Escala expõe o limite.",
  },
  {
    t: "Automação rasa para TI",
    d: "Gatilhos e macros resolvem o atendimento, mas o fluxo de TI segue manual: aprovação de mudança, provisionamento de acesso e tarefas repetidas ocupam analista.",
  },
  {
    t: "Sem IA que resolve",
    d: "O chamado continua esperando um humano. Reset de senha, dúvida repetida e solicitação padrão entram na fila como tudo o mais.",
  },
  {
    t: "Visão de ativos limitada",
    d: "Inventário, ciclo de vida, contratos, licenças e o vínculo do incidente com o ativo exigem mais do que o produto entrega.",
  },
  {
    t: "Relatório executivo na mão",
    d: "SLA de TI, visão de custo e relatório pra diretoria acabam saindo em planilha, montados manualmente todo mês.",
  },
];

const COMPARE = [
  { crit: "Nota geral (G2)", them: "6.7", sysaid: "9.4" },
  { crit: "Foco do produto", them: "Atendimento ao cliente (PME)", sysaid: "ITSM: gestão de serviços de TI" },
  { crit: "Fácil de usar (G2)", them: "61", sysaid: "94" },
  { crit: "Atende aos requisitos (G2)", them: "62", sysaid: "94" },
  { crit: "O produto está na direção certa? (G2)", them: "63", sysaid: "92" },
  { crit: "Qualidade do suporte (G2)", them: "69", sysaid: "90" },
  { crit: "Gestão de mudanças (G2)", them: "63", sysaid: "90" },
  { crit: "Gestão de ativos (G2)", them: "70", sysaid: "92, ITAM nativo com CMDB" },
  { crit: "Fluxo de trabalho do processo (G2)", them: "64", sysaid: "95" },
  { crit: "IA que resolve o chamado", them: "Não é o centro do produto", sysaid: "SysAid Copilot: até 90% resolvidos antes de virar ticket" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico da sua operação",
    d: "Mapeamos volume de chamados, categorias, filas, SLAs e os ativos que a sua TI atende hoje pelo Movidesk.",
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
    q: "O Movidesk atende bem o nosso suporte. Por que trocar?",
    a: "Se a operação é de atendimento ao cliente e o volume é estável, talvez não precise. A troca faz sentido quando a TI vira o usuário principal: aí entram gestão de mudanças, CMDB, vínculo de incidente com ativo, SLA de operação e auditoria, que são o território de uma plataforma ITSM. Nas avaliações públicas da G2, essa diferença aparece: 9.4 contra 6.7 na nota geral.",
  },
  {
    q: "Dá para migrar o histórico de tickets?",
    a: "Sim. Chamados, categorias, usuários e ativos são importados na migração. O diagnóstico inicial define exatamente o que vem, em que formato e em qual ordem, para o go live não perder rastreabilidade.",
  },
  {
    q: "Qual é a diferença prática da IA do SysAid?",
    a: "O SysAid Copilot não se limita a sugerir texto. Ele entende a solicitação, responde o usuário e executa a resolução de casos comuns sozinho, além de sugerir respostas ao agente no que chega ao time. O efeito é o ticket que não precisa existir deixar de existir.",
  },
  {
    q: "O suporte também é no Brasil?",
    a: "Sim. Implementação e suporte local em português, com SLA contratual, além da operação global da SysAid. A distância do suporte não vira parte do problema.",
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

export default function MovideskPage() {
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
                <strong>Relatório de SLA montado em planilha</strong>
                <span>Manual · Governança</span>
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
                <strong>Mudança aprovada por e-mail</strong>
                <span>Sem workflow · Auditoria</span>
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
            <p className="eyebrow">Para quem usa Movidesk</p>
            <h1>
              Sua operação cresceu. Chegou a hora do{" "}
              <span className="hl">ITSM de verdade</span>.
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
              <h2>O Movidesk resolveu o começo. O que trava daqui pra frente</h2>
              <p className="section-head__sub">
                Ele organizou o atendimento quando o time era menor, e isso tem
                mérito. A pergunta é se a operação de hoje ainda cabe nele.
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
                responde o usuário e executa a solução sozinha. O ticket que não
                precisa existir, não existe.
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
              <h2>Movidesk e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparativo com base nas avaliações públicas de usuários na
                G2.com, a maior plataforma de análise de software de negócios.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo Movidesk e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">Movidesk</span>
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
              Movidesk é uma marca de seus respectivos titulares. Notas conforme
              avaliações de usuários publicadas na G2.com; comparativo
              elaborado pela SysAid Brasil com base em dados públicos das
              soluções.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do Movidesk sem perder o histórico da sua TI</h2>
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
