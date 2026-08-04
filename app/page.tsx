import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import Analytics from "@/components/Analytics";

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const MODULOS = [
  {
    t: "Service Desk e chamados",
    d: "Central única para abrir, priorizar e resolver chamados de TI, com portal de autoatendimento e base de conhecimento.",
  },
  {
    t: "IA e automação (Copilot)",
    d: "O SysAid Copilot resolve até 90% dos chamados antes de virarem ticket e automatiza fluxos repetitivos de TI.",
  },
  {
    t: "Gestão de ativos (ITAM)",
    d: "Inventário completo de hardware e software, com ciclo de vida, CMDB e controle de contratos e licenças.",
  },
  {
    t: "SLA e workflows",
    d: "Matriz de prioridade, gestão de SLA e automações de fluxo alinhadas às boas práticas de ITIL.",
  },
  {
    t: "Relatórios e dashboards",
    d: "Visão em tempo real de produtividade, volume de chamados e cumprimento de SLA para decisão baseada em dados.",
  },
  {
    t: "1.000+ integrações",
    d: "Conecta com as ferramentas que sua TI já usa, do Microsoft Teams ao Azure, sem reescrever processos.",
  },
];

const FAQ = [
  {
    q: "Qual a diferença entre help desk e service desk?",
    a: "O help desk foca em resolver incidentes pontuais do usuário. O service desk é mais amplo: além de chamados, cobre gestão de ativos, mudanças, SLAs e a operação de TI como um todo, alinhada à ITIL. O SysAid entrega os dois na mesma plataforma.",
  },
  {
    q: "Como a IA reduz o custo e o volume de chamados?",
    a: "O SysAid Copilot responde e resolve solicitações comuns automaticamente, antes de gerarem um ticket, e sugere respostas aos agentes. Na prática, isso reduz o volume que chega à equipe e acelera a resolução do que sobra.",
  },
  {
    q: "Quanto tempo leva a implementação?",
    a: "A implementação típica é rápida e acompanhada por suporte local em português. O escopo é definido na demonstração, de acordo com o tamanho e a maturidade da sua operação de TI.",
  },
  {
    q: "O SysAid atende requisitos de segurança e conformidade?",
    a: "Sim. A plataforma segue boas práticas de segurança corporativa e é reconhecida por certificações do setor, atendendo empresas de grande porte no Brasil e no mundo.",
  },
  {
    q: "Serve para a minha empresa?",
    a: "O SysAid é feito para equipes de TI corporativas, de médias a grandes empresas. Se a sua TI abre chamados, controla ativos e precisa cumprir SLAs, faz sentido. A demonstração mostra o encaixe no seu caso.",
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

export default function Home() {
  return (
    <>
      <Analytics />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* HEADER */}
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
                <strong>Lentidão na rede WLAN</strong>
                <span>Filial SP · Infraestrutura</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--2">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>31 usuários: reset de senha</strong>
                <span>Salesforce · Acessos</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--3">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>Garantia expirando: 25 notebooks</strong>
                <span>Ativos · Dell</span>
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
            <p className="eyebrow">SysAid Brasil · ITSM com IA</p>
            <h1>
              A plataforma de ITSM com IA que resolve até{" "}
              <span className="hl">90% dos chamados</span> antes de virarem ticket
            </h1>
            <p className="hero__sub">
              Service desk, gestão de ativos e automação de TI em uma só
              plataforma. Mais de 400 empresas no Brasil confiam na SysAid.
            </p>
            <div className="hero__form">
              <LeadForm variant="hero" />
            </div>
            <p className="hero__trust">
              Resolução até 12x mais rápida · Suporte local em português ·
              Reconhecida por G2, Gartner e TrustRadius
            </p>
          </div>
        </section>

        {/* PROVA — LOGOS */}
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

        {/* DORES */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O problema</p>
              <h2>Sua TI apaga incêndio em vez de evoluir?</h2>
            </div>
            <div className="grid-3">
              <div className="pain">
                <h3>Chamados sem controle</h3>
                <p>
                  Solicitações por e-mail, WhatsApp e corredor, sem fila, sem
                  prioridade e sem histórico. O que é urgente se perde.
                </p>
              </div>
              <div className="pain">
                <h3>Time sobrecarregado</h3>
                <p>
                  A equipe gasta o dia em tarefas repetitivas e perde SLA, em
                  vez de trabalhar em projetos que movem o negócio.
                </p>
              </div>
              <div className="pain">
                <h3>Sem visão de ativos</h3>
                <p>
                  Ninguém sabe ao certo quais equipamentos, licenças e contratos
                  a empresa tem, nem quando vencem.
                </p>
              </div>
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
                Enquanto os outros automatizam, o SysAid Copilot{" "}
                <span className="hl">resolve</span>
              </h2>
              <p className="ia__lead">
                A IA nativa da SysAid entende o chamado, responde o usuário e
                executa a solução sozinha. O ticket que não precisa existir,
                não existe.
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

        {/* MODULOS */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A plataforma</p>
              <h2>Tudo o que a TI precisa, em uma só solução</h2>
              <p className="section-head__sub">
                Software ITSM completo: chamados, ativos, SLA, automação e IA,
                sem juntar várias ferramentas soltas.
              </p>
            </div>
            <div className="grid-3">
              {MODULOS.map((m) => (
                <div className="card" key={m.t}>
                  <h3>{m.t}</h3>
                  <p>{m.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NUMEROS + BADGES */}
        <section className="section">
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

        {/* COMPARATIVO */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Por que SysAid</p>
              <h2>Ferramenta de help desk não é plataforma de ITSM</h2>
            </div>
            <div className="compare">
              <div className="compare__col compare__col--them">
                <h3>Ferramentas genéricas</h3>
                <ul>
                  <li>Foco em chamado, param aí</li>
                  <li>Automação limitada, sem IA que resolve</li>
                  <li>Sem gestão de ativos de verdade</li>
                  <li>Pensadas para SMB e atendimento ao cliente</li>
                </ul>
              </div>
              <div className="compare__col compare__col--us">
                <h3>SysAid</h3>
                <ul>
                  <li>Plataforma ITSM completa e alinhada à ITIL</li>
                  <li>IA que resolve até 90% dos chamados sozinha</li>
                  <li>Gestão de ativos e CMDB nativas</li>
                  <li>Feita para TI corporativa, com suporte local</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>Perguntas que a TI costuma fazer</h2>
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
            <h2>Veja o SysAid resolver os chamados da sua TI</h2>
            <p className="form-final__sub">
              Agende uma demonstração gratuita e sem compromisso. Mostramos a
              plataforma funcionando no cenário da sua empresa.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Agende minha demonstração" />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <Image src="/logos/logo-white.svg" alt="SysAid" width={116} height={30} />
          <p>SysAid Brasil · Software ITSM com Inteligência Artificial</p>
        </div>
      </footer>
    </>
  );
}
