import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Alternativa ao TopDesk | ITSM com IA para a sua TI — SysAid Brasil",
  description:
    "TopDesk é forte em CMDB e Asset Management, mas a resolução ainda depende do analista. Conheça a plataforma ITSM com IA que resolve até 90% dos chamados antes de virarem ticket, com suporte em português.",
  alternates: { canonical: "/topdesk" },
  openGraph: {
    title: "Alternativa ao TopDesk: ITSM com IA — SysAid Brasil",
    description:
      "Do CMDB tradicional a uma plataforma ITSM com IA nativa que resolve o chamado, não só registra. Nota 4,5/5 no G2, com 733 avaliações.",
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
    t: "Setup mais longo pra ganhar tração",
    d: "Usuários do TopDesk relatam implantação e configuração mais complexas antes da operação sentir o ganho — CMDB e Asset Management exigem modelagem cuidadosa desde o início.",
  },
  {
    t: "Preço sobe por agente, por tier",
    d: "Planos de US$ 76 a US$ 155 por agente/mês (Essential, Engaged, Excellent). Cada analista novo e cada recurso adicional pesam na fatura conforme o time cresce.",
  },
  {
    t: "CMDB forte, mas sem IA que resolve sozinha",
    d: "O TopDesk é referência em registrar e relacionar ativos. O que falta é uma camada de IA que entenda o chamado e execute a solução — hoje isso ainda depende do analista.",
  },
  {
    t: "Prova social ainda pequena no Brasil",
    d: "30 avaliações no G2 globalmente, contra centenas de outras plataformas do setor — sinal de uma base de clientes por aqui ainda em formação.",
  },
  {
    t: "Empresa europeia, fuso e cotação a combinar",
    d: "Sede na Holanda, sem ponto de contato local confirmado no Brasil. Cotação, implantação e suporte tendem a rodar em outro fuso e, muitas vezes, em inglês.",
  },
  {
    t: "Customização exige know-how técnico",
    d: "A flexibilidade do CMDB é um ponto forte, mas configurar object types, templates e relações do jeito certo demanda tempo dedicado de TI — não sai pronto da caixa.",
  },
];

const COMPARE = [
  { crit: "Nota geral (G2)", them: "4,1/5 (30 avaliações)", sysaid: "4,5/5 (733 avaliações)" },
  { crit: "Foco do produto", them: "ITSM tradicional, forte em CMDB e Asset Management", sysaid: "ITSM com IA nativa (SysAid Copilot) integrada à plataforma" },
  { crit: "Atende aos requisitos (G2)", them: "85", sysaid: "89" },
  { crit: "Fácil de usar (G2)", them: "80", sysaid: "90" },
  { crit: "Qualidade do suporte (G2)", them: "Sem destaque nas avaliações públicas", sysaid: "90, com atendimento em português" },
  { crit: "Gestão de ativos / CMDB", them: "Módulo próprio (Asset Management), setup mais longo segundo avaliações", sysaid: "CMDB nativo, com Copilot ajudando na triagem" },
  { crit: "IA que resolve o chamado", them: "Automação de workflow, sem IA generativa nativa", sysaid: "SysAid Copilot incluído: até 90% resolvidos antes de virar ticket" },
  { crit: "Modelo de preço", them: "US$ 76 a US$ 155 por agente/mês, por tier", sysaid: "Personalizado, com ITAM e Copilot inclusos, sem add-on" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico da sua operação",
    d: "Mapeamos o CMDB, os ativos cadastrados, categorias, filas e SLAs que a sua TI mantém hoje no TopDesk.",
  },
  {
    n: "02",
    t: "Migração da base e do histórico",
    d: "Ativos, relações do CMDB, chamados, categorias e usuários são importados. O trabalho de modelagem que você já fez não se perde.",
  },
  {
    n: "03",
    t: "Go live com a equipe treinada",
    d: "Configuração do portal, automações e Copilot, com treinamento e acompanhamento em português.",
  },
];

const FAQ = [
  {
    q: "Já uso o TopDesk. Por que trocar?",
    a: "Porque o TopDesk registra e relaciona bem os ativos, mas a resolução do chamado continua manual. O SysAid Copilot entende a solicitação, responde o usuário e executa a resolução de casos comuns sozinho — o CMDB deixa de ser só um cadastro e passa a alimentar automação de verdade.",
  },
  {
    q: "Dá para migrar o CMDB e os ativos já cadastrados?",
    a: "Sim. Ativos, relações de CMDB, chamados, categorias e usuários são importados na migração. O diagnóstico inicial mapeia exatamente a estrutura que você já modelou no TopDesk para reaproveitar esse trabalho, não recomeçar do zero.",
  },
  {
    q: "Qual é a diferença prática da IA do SysAid?",
    a: "O SysAid Copilot não se limita a sugerir texto ou automatizar um workflow fixo. Ele entende a solicitação, responde o usuário e executa a resolução de casos comuns sozinho, além de sugerir respostas ao agente no que chega ao time — e está incluído na plataforma, sem add-on.",
  },
  {
    q: "E o custo, como se compara?",
    a: "O TopDesk cobra por agente, em três tiers que vão de US$ 76 a US$ 155/mês — o valor sobe com o time e com os recursos do plano. No SysAid, Copilot, gestão de ativos e workflows fazem parte da plataforma, com implementação e suporte local inclusos. A conta que importa é o custo total por chamado resolvido, não o valor da mensalidade.",
  },
  {
    q: "Quanto tempo leva a implantação?",
    a: "A implantação típica é acompanhada por suporte local em português, o que tende a encurtar o tempo até o time sentir o ganho — um dos pontos mais citados como desafio por quem já implantou o TopDesk. O prazo exato depende do volume de dados e ativos a migrar, definido no diagnóstico.",
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

export default function TopDeskPage() {
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
                <strong>Ativo cadastrado, chamado manual</strong>
                <span>CMDB · Sem IA</span>
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
                <strong>Setup do módulo de ativos</strong>
                <span>Em andamento · TI dedicada</span>
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
            <p className="eyebrow">Para quem usa TopDesk</p>
            <h1>
              O TopDesk registra o ativo. O SysAid Copilot{" "}
              <span className="hl">resolve o chamado</span>.
            </h1>
            <p className="hero__sub">
              A plataforma ITSM com IA nativa que resolve até 90% dos chamados
              antes de virarem ticket, com CMDB, gestão de ativos e suporte
              local em português. Mais de 400 empresas no Brasil.
            </p>
            <div className="hero__form">
              <LeadForm variant="hero" />
            </div>
            <p className="hero__trust">
              Nota 4,5/5 no G2 (733 avaliações) · Migração do CMDB incluída ·
              Reconhecida por G2, Gartner e TrustRadius
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
              <h2>O TopDesk organizou o CMDB. O que trava na resolução</h2>
              <p className="section-head__sub">
                Registrar e relacionar ativos é só metade do trabalho. A
                pergunta é quem resolve o chamado depois que ele chega — um
                analista sobrecarregado, ou uma IA que já executa a solução.
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
                Enquanto o CMDB registra, o SysAid Copilot{" "}
                <span className="hl">resolve</span>
              </h2>
              <p className="ia__lead">
                A inteligência artificial nativa da SysAid entende o chamado,
                responde o usuário e executa a solução sozinha — usando o
                próprio CMDB como contexto. Incluída na plataforma, sem
                add-on.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>CMDB e ativos usados como contexto pela IA, não só cadastro</li>
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
              <h2>TopDesk e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparativo com base nas avaliações públicas de usuários na
                G2.com, a maior plataforma de análise de software de negócios.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo TopDesk e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">TopDesk</span>
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
              TopDesk é uma marca de seus respectivos titulares. Notas
              conforme avaliações de usuários publicadas na G2.com e preços
              públicos do fornecedor; comparativo elaborado pela SysAid Brasil
              com base em dados públicos das soluções.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do TopDesk sem perder o CMDB que você já modelou</h2>
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
                <div className="stat__n">4,5/5</div>
                <div className="stat__l">nota geral no G2 (733 avaliações)</div>
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
              cenário da sua TI, inclusive como ficaria a migração do seu CMDB
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
