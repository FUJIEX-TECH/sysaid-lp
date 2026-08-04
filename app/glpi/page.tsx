import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Alternativa ao GLPI | ITSM com IA que resolve o chamado — SysAid Brasil",
  description:
    "Roda GLPI e a TI segue apagando incêndio? Conheça a plataforma ITSM com IA que resolve até 90% dos chamados antes de virarem ticket, com gestão de ativos, SLA e suporte local em português.",
  alternates: { canonical: "/glpi" },
  openGraph: {
    title: "Alternativa ao GLPI: ITSM com IA — SysAid Brasil",
    description:
      "Do GLPI a uma plataforma ITSM com IA nativa, gestão de ativos e suporte em português. +400 empresas no Brasil.",
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
    t: "A TI mantém a ferramenta, não o serviço",
    d: "Servidor, banco, atualização de versão e compatibilidade de plugin viram tarefa da própria equipe. É tempo de TI gasto na ferramenta em vez de no negócio.",
  },
  {
    t: "Registra o chamado, mas não resolve",
    d: "O fluxo continua manual do começo ao fim. Cada reset de senha, cada acesso e cada dúvida repetida ocupa um analista.",
  },
  {
    t: "Personalização depende de plugin",
    d: "Automação, relatório e integração saem via plugins da comunidade e customizações próprias, que precisam ser revalidados a cada upgrade.",
  },
  {
    t: "Suporte é da comunidade",
    d: "Quando algo para às 9h de uma segunda, o caminho é fórum, documentação e conhecimento interno. Sem SLA de quem fornece a ferramenta.",
  },
  {
    t: "Visão de ativos sem o resto do ciclo",
    d: "O inventário resolve o básico do hardware, mas contratos, licenças, garantias e CMDB relacional exigem mais camadas.",
  },
  {
    t: "Escala expõe o limite",
    d: "O que funcionava com 200 chamados por mês começa a doer com 2.000: performance, governança, auditoria e relatório executivo.",
  },
];

const COMPARE = [
  { crit: "Custo de licença", glpi: "Gratuito (GPL)", sysaid: "Licença paga, com implementação e suporte inclusos" },
  { crit: "Custo total de operação", glpi: "Servidor, atualização e horas da própria equipe", sysaid: "SaaS gerenciado, sem infraestrutura sua" },
  { crit: "IA que resolve o chamado", glpi: "Não nativo", sysaid: "SysAid Copilot: até 90% resolvidos antes de virar ticket" },
  { crit: "Automação de fluxos", glpi: "Via regras e plugins da comunidade", sysaid: "Workflows nativos, ponta a ponta" },
  { crit: "Gestão de ativos", glpi: "Inventário nativo via agente", sysaid: "ITAM completo: ciclo de vida, contratos, licenças e CMDB" },
  { crit: "SLA e governança", glpi: "SLA nativo, relatórios dependem de customização", sysaid: "Matriz de prioridade, SLA e dashboards prontos" },
  { crit: "Integrações", glpi: "Plugins conforme a comunidade mantém", sysaid: "1.000+ integrações nativas, do Teams ao Azure" },
  { crit: "Suporte", glpi: "Comunidade, parceiro ou contrato à parte", sysaid: "Suporte local em português, com SLA contratual" },
  { crit: "Atualização de versão", glpi: "Projeto interno a cada ciclo", sysaid: "Contínua, sem parada da sua equipe" },
];

const MIGRACAO = [
  {
    n: "01",
    t: "Diagnóstico da sua operação",
    d: "Mapeamos volume de chamados, categorias, filas, SLAs e o inventário que você já tem no GLPI hoje.",
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
    q: "O GLPI é gratuito. Por que trocar por uma solução paga?",
    a: "A licença é gratuita, a operação não. Somando servidor, atualizações de versão, compatibilidade de plugins e as horas da sua equipe mantendo a ferramenta, existe um custo real que não aparece na fatura. A conta que importa é o custo total: quanto a sua TI gasta para manter a ferramenta de pé, e quanto ela deixa de resolver enquanto faz isso.",
  },
  {
    q: "Dá para migrar o histórico de chamados e o inventário?",
    a: "Sim. Chamados, categorias, usuários e ativos são importados na migração. O diagnóstico inicial define exatamente o que vem, em que formato e em qual ordem, para o go live não perder rastreabilidade.",
  },
  {
    q: "Qual é a diferença prática da IA do SysAid?",
    a: "O SysAid Copilot não se limita a sugerir texto. Ele entende a solicitação, responde o usuário e executa a resolução de casos comuns sozinho, além de sugerir respostas ao agente no que chega ao time. O efeito é o ticket que não precisa existir deixar de existir.",
  },
  {
    q: "Nossa TI já customizou muito o GLPI. Isso se perde?",
    a: "As regras de negócio não se perdem, elas são remodeladas em recursos nativos. Boa parte do que hoje exige plugin ou script customizado já existe pronto na plataforma, o que reduz o que a sua equipe precisa manter depois.",
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

export default function GlpiPage() {
  return (
    <>
      <Analytics />
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
            Agende uma demonstração
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
                <strong>Upgrade de versão parado há 2 meses</strong>
                <span>Plugin incompatível · Infraestrutura</span>
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
                <strong>Relatório de SLA para a diretoria</strong>
                <span>Exportado na mão · Governança</span>
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
            <p className="eyebrow">Para quem já roda GLPI</p>
            <h1>
              Seu GLPI registra o chamado. E se ele{" "}
              <span className="hl">resolvesse sozinho</span>?
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
              Migração do histórico incluída · Resolução até 12x mais rápida ·
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
              <h2>O GLPI resolveu o começo. O que trava daqui pra frente</h2>
              <p className="section-head__sub">
                Ele organizou o caos inicial de chamados, e isso tem mérito. A
                pergunta é se a sua TI ainda deveria estar mantendo a
                ferramenta em vez de evoluir o serviço.
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
              <h2>GLPI e SysAid, critério por critério</h2>
              <p className="section-head__sub">
                Comparativo honesto: onde o GLPI entrega e onde uma plataforma
                de ITSM corporativa muda o patamar da operação.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo GLPI e SysAid">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">GLPI</span>
                <span role="columnheader" className="ctable__us">SysAid</span>
              </div>
              {COMPARE.map((row) => (
                <div className="ctable__row" role="row" key={row.crit}>
                  <span className="ctable__crit" role="cell">{row.crit}</span>
                  <span className="ctable__them" role="cell">{row.glpi}</span>
                  <span className="ctable__mine" role="cell">{row.sysaid}</span>
                </div>
              ))}
            </div>
            <p className="ctable__note">
              GLPI é uma marca de seus respectivos titulares. Comparativo
              elaborado pela SysAid Brasil com base na documentação pública das
              soluções e em implantações reais.
            </p>
          </div>
        </section>

        {/* MIGRAÇÃO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como é a troca</p>
              <h2>Sair do GLPI sem perder o histórico da sua TI</h2>
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
              Agende uma demonstração gratuita e sem compromisso. Mostramos a
              plataforma rodando no cenário da sua TI, inclusive como ficaria a
              migração da sua base atual.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Agende minha demonstração" />
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
