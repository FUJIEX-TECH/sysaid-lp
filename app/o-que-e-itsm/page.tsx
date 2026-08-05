import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "O que é ITSM? Guia de Gestão de Serviços de TI — SysAid Brasil",
  description:
    "ITSM é a gestão de serviços de TI: processos, papéis e ferramentas para entregar TI como serviço. Entenda o conceito, a relação com ITIL, os processos principais e como escolher uma plataforma.",
  alternates: { canonical: "/o-que-e-itsm" },
  openGraph: {
    title: "O que é ITSM? Guia de Gestão de Serviços de TI",
    description:
      "Conceito, relação com ITIL, processos principais e critérios para escolher uma plataforma de ITSM.",
    locale: "pt_BR",
    type: "article",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const CAMADAS = [
  {
    t: "Sistema de chamados",
    d: "A ferramenta que registra o pedido, dá um número, um dono e um prazo. É o alicerce: sem ele, não existe dado para gerir nada.",
  },
  {
    t: "Help desk",
    d: "O time e o processo que atendem o usuário final e resolvem incidentes pontuais. Foco em restabelecer o serviço rápido.",
  },
  {
    t: "Service desk",
    d: "O ponto único de contato entre o negócio e a TI. Além de incidentes, trata requisições, mudanças e comunicação com o usuário.",
  },
  {
    t: "ITSM",
    d: "A disciplina que abrange tudo isso: processos, papéis, métricas e ferramentas para entregar e melhorar os serviços de TI como serviço.",
  },
];

const PROCESSOS = [
  {
    t: "Gestão de incidentes",
    d: "Restabelecer o serviço no menor tempo possível quando algo quebra. É o processo mais visível e onde a maioria das operações começa.",
  },
  {
    t: "Gestão de requisições",
    d: "Atender pedidos padronizados, como acesso, equipamento e licença, por um catálogo com fluxo e aprovação definidos.",
  },
  {
    t: "Gestão de problemas",
    d: "Procurar a causa raiz do incidente que se repete, para que ele pare de acontecer em vez de ser resolvido toda semana.",
  },
  {
    t: "Gestão de mudanças",
    d: "Avaliar risco, aprovar e registrar alterações no ambiente, para que a correção de hoje não vire a indisponibilidade de amanhã.",
  },
  {
    t: "Gestão de ativos e configuração",
    d: "Saber o que a empresa tem, onde está, com quem, sob qual contrato e como cada item se relaciona com os demais.",
  },
  {
    t: "Gestão de nível de serviço",
    d: "Acordar prazos e metas com o negócio, medir o cumprimento e usar o resultado para decidir onde investir.",
  },
];

const CRITERIOS = [
  {
    n: "01",
    t: "Ela resolve ou só registra?",
    d: "Uma ferramenta que apenas organiza a fila transfere o trabalho, não reduz. Automação e IA nativas são o que tiram volume do time em vez de redistribuí-lo.",
  },
  {
    n: "02",
    t: "O custo total, não o da licença",
    d: "Servidor, atualização de versão, compatibilidade de plugin e as horas da equipe mantendo a ferramenta são custo real. Licença gratuita raramente significa operação barata.",
  },
  {
    n: "03",
    t: "Ela acompanha o amadurecimento?",
    d: "Começar por incidentes é normal. O problema é ter que trocar de plataforma quando entrarem ativos, mudanças e catálogo. Verifique se tudo já está na mesma base.",
  },
];

const FAQ = [
  {
    q: "O que é ITSM?",
    a: "ITSM é a sigla de IT Service Management, ou gestão de serviços de TI. É a disciplina que organiza como a área de TI entrega valor para o negócio na forma de serviços, com processos definidos, papéis claros, prazos acordados e métricas de acompanhamento. Na prática, ITSM é o que faz a TI deixar de ser um grupo que apaga incêndio e passar a ser um prestador de serviço com catálogo, prazo e qualidade medida.",
  },
  {
    q: "Qual a diferença entre ITSM e ITIL?",
    a: "ITSM é a prática, ITIL é o guia. ITSM é o que a empresa faz para gerir seus serviços de TI. ITIL é a biblioteca de boas práticas mais adotada no mundo para orientar como fazer isso, com recomendações de processos, papéis e fluxos. Uma empresa pode fazer ITSM sem seguir ITIL à risca, e adotar ITIL sem implementar tudo que está lá. A ITIL é referência, não obrigação.",
  },
  {
    q: "Qual a diferença entre ITSM, service desk e help desk?",
    a: "São camadas diferentes do mesmo assunto. O help desk atende o usuário final e resolve incidentes pontuais. O service desk é o ponto único de contato entre negócio e TI, e trata também requisições e mudanças. O ITSM é a disciplina mais ampla, que engloba os dois e acrescenta gestão de ativos, problemas, níveis de serviço e melhoria contínua.",
  },
  {
    q: "Minha empresa é pequena. Faz sentido adotar ITSM?",
    a: "Faz, em escala proporcional. ITSM não obriga a implementar dezenas de processos de uma vez. A maioria das operações começa por dois, incidentes e requisições, e agrega os demais conforme o volume cresce. O erro comum não é começar pequeno, é escolher uma ferramenta que não acompanhe quando a operação amadurecer.",
  },
  {
    q: "Por onde começar uma implantação de ITSM?",
    a: "Pelo básico que gera dado: um canal único de abertura, categorias que façam sentido para a sua realidade, uma matriz simples de prioridade e SLA por tipo de chamado. Com isso rodando por alguns meses, aparecem os números que dizem onde a operação dói, e aí a escolha dos próximos processos deixa de ser opinião.",
  },
  {
    q: "O que uma plataforma de ITSM precisa ter?",
    a: "No mínimo: canal único de abertura, catálogo de serviços, matriz de prioridade, SLA com escalonamento, base de conhecimento, gestão de ativos e relatórios prontos. O diferencial hoje está na automação e na IA, que resolvem sozinhas parte do que chega, em vez de apenas organizar a fila para uma pessoa resolver.",
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

export default function OQueEItsmPage() {
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
        {/* HERO INFORMACIONAL — sem formulário, a intenção aqui é entender */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · Gestão de serviços de TI</p>
            <h1>
              O que é <span className="hl">ITSM</span> e por que ele mudou o
              papel da TI
            </h1>
            <p className="hero__sub">
              ITSM é a sigla de IT Service Management, ou gestão de serviços de
              TI. É a disciplina que organiza como a área entrega valor ao
              negócio na forma de serviços, com processos definidos, prazos
              acordados e qualidade medida. Abaixo, o conceito, a relação com a
              ITIL, os processos principais e como escolher uma plataforma.
            </p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Mais de 400 empresas no país
              usam a plataforma
            </p>
          </div>
        </section>

        {/* CAMADAS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Antes de tudo</p>
              <h2>Sistema de chamados, help desk, service desk e ITSM</h2>
              <p className="section-head__sub">
                Os quatro termos aparecem juntos e são tratados como sinônimos,
                mas descrevem camadas diferentes. Entender a diferença evita
                comprar a ferramenta errada para o problema que se tem.
              </p>
            </div>
            <div className="grid-3">
              {CAMADAS.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ITIL */}
        <section className="section section--soft">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">A confusão mais comum</p>
              <h2>ITSM é a prática. ITIL é o guia</h2>
            </div>
            <p className="section-head__sub">
              ITSM é o que a empresa faz para gerir seus serviços de TI. ITIL é
              a biblioteca de boas práticas mais adotada no mundo para orientar
              como fazer isso, com recomendações de processos, papéis e fluxos.
              Uma empresa pode praticar ITSM sem seguir a ITIL à risca, e pode
              adotar a ITIL sem implementar tudo que está descrito nela. A ITIL
              é referência, não obrigação, e tratá-la como obrigação é o motivo
              de muitos projetos de ITSM travarem antes de entregar valor.
            </p>
          </div>
        </section>

        {/* PROCESSOS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na prática</p>
              <h2>Os processos que sustentam uma operação de ITSM</h2>
              <p className="section-head__sub">
                Ninguém implanta todos de uma vez. A maioria das operações
                começa pelos dois primeiros e agrega os demais conforme o volume
                e a maturidade crescem.
              </p>
            </div>
            <div className="grid-3">
              {PROCESSOS.map((p) => (
                <div className="card" key={p.t}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IA */}
        <section className="section section--dark">
          <div className="container ia__grid">
            <div>
              <p className="eyebrow" style={{ color: "var(--lime)" }}>
                O que mudou recentemente
              </p>
              <h2>
                A IA tirou o ITSM do papel de{" "}
                <span className="hl">organizar fila</span>
              </h2>
              <p className="ia__lead">
                Durante anos, uma ferramenta de ITSM servia para registrar,
                categorizar e distribuir o trabalho entre pessoas. A automação
                com IA mudou a pergunta: em vez de quem vai atender, passou a
                ser se esse chamado precisa de alguém.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>Categoria, prioridade e roteamento definidos sozinhos</li>
                <li>A equipe sobra para projeto, não para pedido repetido</li>
              </ul>
            </div>
            <div className="ia__stat">
              <div className="stat-big">90%</div>
              <p>dos chamados resolvidos antes de chegar ao time</p>
            </div>
          </div>
        </section>

        {/* CRITERIOS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como escolher</p>
              <h2>Três perguntas antes de contratar uma plataforma de ITSM</h2>
            </div>
            <div className="grid-3">
              {CRITERIOS.map((c) => (
                <div className="step" key={c.n}>
                  <span className="step__n">{c.n}</span>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
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

        {/* FAQ */}
        <section className="section section--soft">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>Perguntas comuns sobre ITSM</h2>
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
              Quer ver isso rodando?
            </p>
            <h2>Do conceito à operação, na sua realidade</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos como
              os processos descritos aqui ficam na prática, com a fila, os
              prazos e os serviços da sua TI.
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
