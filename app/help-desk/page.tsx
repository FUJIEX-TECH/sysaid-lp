import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Help desk: o que é, o que faz e como funciona | SysAid",
  description:
    "Help desk é o suporte que resolve o problema técnico do usuário: o que faz, como funciona o atendimento em níveis e quando ele precisa virar service desk.",
  alternates: { canonical: "/help-desk" },
  openGraph: {
    title: "Help desk: o que é, o que faz e como funciona",
    description:
      "Definição de help desk, o que a função faz no dia a dia, os níveis de atendimento, a diferença para service desk e como escolher o software.",
    locale: "pt_BR",
    type: "article",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const FUNCOES = [
  {
    n: "01",
    t: "Registrar o problema",
    d: "Computador que não liga, sistema fora do ar, senha bloqueada, impressora parada. Todo relato vira um chamado com quem pediu, o que aconteceu e quando, para que nada dependa da memória de quem atendeu o telefone.",
  },
  {
    n: "02",
    t: "Fazer o diagnóstico inicial",
    d: "O atendente entende o que está acontecendo, faz as perguntas certas e separa o que é falha do equipamento, do sistema ou do uso. Um bom diagnóstico no primeiro contato evita o vai e volta entre usuário e técnico.",
  },
  {
    n: "03",
    t: "Resolver no primeiro contato",
    d: "Redefinir senha, liberar acesso, reinstalar um programa, orientar o usuário. O que é conhecido se resolve na hora, com apoio da base de conhecimento e, quando preciso, de acesso remoto à máquina.",
  },
  {
    n: "04",
    t: "Escalar o que exige especialista",
    d: "O que passa do primeiro nível vai para o técnico de campo, o time de redes ou o fornecedor do sistema, com o histórico completo no chamado. O usuário não precisa contar a história de novo.",
  },
  {
    n: "05",
    t: "Acompanhar até fechar",
    d: "O chamado só termina quando o usuário confirma que voltou a funcionar. No meio do caminho, quem abriu sabe em que pé está, e o prazo combinado é acompanhado pela ferramenta.",
  },
];

const NIVEIS = [
  {
    t: "Nível 1 (N1): primeiro atendimento",
    d: "Recebe o chamado, registra, faz o diagnóstico inicial e resolve o que é conhecido: senha, acesso, configuração, dúvida de uso. Em operação bem montada, a maior parte do volume termina aqui.",
  },
  {
    t: "Nível 2 (N2): suporte técnico especializado",
    d: "Trata o que o N1 não resolveu: problema de sistema, de rede, de servidor, troca de peça, visita técnica. Exige conhecimento mais profundo e, em geral, acesso administrativo ao ambiente.",
  },
  {
    t: "Nível 3 (N3): especialista ou fornecedor",
    d: "Desenvolvedor, arquiteto de infraestrutura ou o próprio fabricante do software. Entra quando o problema exige mudança no sistema, correção de código ou investigação de causa raiz.",
  },
];

const DIFERENCAS = [
  {
    t: "Help desk: resolver o problema do usuário",
    d: "O foco é técnico e reativo. Algo parou de funcionar e o time devolve o serviço o mais rápido possível. Mede-se em chamado fechado, tempo de atendimento e resolução no primeiro contato.",
  },
  {
    t: "Service desk: operar a TI como serviço",
    d: "Engloba o help desk e cobre também pedidos de acesso e equipamento, mudanças, problemas recorrentes, gestão de ativos e a comunicação com o negócio, alinhado às práticas da ITIL.",
  },
  {
    t: "Na prática, um vira o outro",
    d: "Quase toda operação começa como help desk. Quando o volume cresce e os mesmos pedidos se repetem, entram catálogo de serviços, SLA por tipo de chamado e gestão de ativos: é o help desk virando service desk.",
  },
];

const SINAIS = [
  {
    t: "Os mesmos chamados voltam toda semana",
    d: "O time resolve rápido, mas o problema reaparece. Falta gestão de problemas, que procura e elimina a causa raiz em vez de só atender de novo.",
  },
  {
    t: "Pedido e incidente caem na mesma fila",
    d: "Solicitação de acesso, de notebook novo e de licença disputam espaço com sistema fora do ar. Pedido previsível merece catálogo de serviços e fluxo automático de aprovação.",
  },
  {
    t: "Ninguém sabe o que a empresa tem",
    d: "Cada atendimento começa com uma investigação: qual máquina, qual versão, com quem está. Sem inventário ligado ao chamado, o diagnóstico demora e a reincidência por equipamento fica invisível.",
  },
  {
    t: "A diretoria pergunta e a TI monta planilha",
    d: "Volume por categoria, cumprimento de prazo e carga por analista deveriam estar em painel. Se dependem de exportação manual, a operação só justifica depois, não acompanha.",
  },
];

const CRITERIOS = [
  {
    t: "Abertura por todos os canais na mesma fila",
    d: "Portal, e-mail, Teams e WhatsApp caindo num lugar só. Se cada canal vira uma caixa separada, o chamado se perde antes de começar.",
  },
  {
    t: "Base de conhecimento ligada ao atendimento",
    d: "A solução que funcionou ontem precisa aparecer para o atendente de hoje, e para o próprio usuário no portal, antes de ele abrir chamado.",
  },
  {
    t: "SLA com escalonamento automático",
    d: "Prazo por tipo de chamado, contado em horário útil, com alerta antes de vencer. Prazo que depende de alguém lembrar não é prazo.",
  },
  {
    t: "Inteligência artificial que resolve",
    d: "A diferença entre uma IA que sugere texto e uma que executa a solicitação inteira sozinha aparece direto no volume que chega ao N1.",
  },
  {
    t: "Espaço para crescer para service desk",
    d: "Catálogo de serviços, gestão de ativos, mudanças e problemas na mesma plataforma. Quem escolhe só pensando em help desk costuma trocar de sistema dois anos depois.",
  },
  {
    t: "Custo total, não preço de licença",
    d: "Servidor, atualização, plugin e as horas do próprio time mantendo a ferramenta no ar entram na conta. Ferramenta gratuita costuma cobrar em hora de equipe.",
  },
];

const FAQ = [
  {
    q: "O que é help desk?",
    a: "Help desk é a área ou o serviço de suporte técnico que atende os usuários quando algo deixa de funcionar: computador, sistema, acesso, impressora, rede. Ele recebe o relato, registra como chamado, faz o diagnóstico, resolve o que é conhecido e encaminha ao especialista o que exige mais conhecimento, até o problema estar resolvido. O termo descreve ao mesmo tempo o time, o processo de atendimento e o software que organiza os chamados.",
  },
  {
    q: "O que faz um help desk?",
    a: "Um help desk registra os problemas técnicos relatados pelos usuários, faz o diagnóstico inicial, resolve no primeiro contato o que for possível (senha, acesso, configuração, orientação de uso), escala ao segundo ou terceiro nível o que exigir especialista e acompanha cada chamado até o usuário confirmar que voltou a funcionar. Também alimenta a base de conhecimento e mede volume, tempo de atendimento e resolução no primeiro contato.",
  },
  {
    q: "Qual a diferença entre help desk e service desk?",
    a: "A diferença é de escopo. O help desk é reativo e focado em resolver o problema técnico do usuário. O service desk engloba o help desk e cobre também requisições, mudanças, problemas recorrentes, gestão de ativos e a comunicação com o negócio, funcionando como ponto único de contato para tudo que envolve a TI. Em geral a operação começa como help desk e amadurece para service desk conforme a empresa cresce.",
  },
  {
    q: "O que faz um analista de help desk?",
    a: "O analista de help desk atende o usuário no primeiro nível: registra o chamado, entende o problema, resolve o que está ao alcance dele (muitas vezes por acesso remoto) e escala ao time técnico o que não está, com o histórico completo. Acompanha o prazo dos chamados sob sua responsabilidade, mantém o usuário informado e registra na base de conhecimento as soluções que funcionaram.",
  },
  {
    q: "Quais são os níveis de atendimento do help desk?",
    a: "O modelo mais usado tem três níveis. O N1 faz o primeiro atendimento e resolve o que é conhecido. O N2 trata o que exige conhecimento técnico mais profundo, como problemas de sistema, rede ou hardware. O N3 envolve especialistas, desenvolvedores ou o fabricante do software, quando o problema exige correção ou investigação de causa raiz. Quanto mais o N1 resolve, mais barata e rápida fica a operação.",
  },
  {
    q: "Help desk e suporte técnico são a mesma coisa?",
    a: "Na prática, quase. Suporte técnico é a atividade de resolver problemas de tecnologia; help desk é a estrutura organizada para prestar esse suporte, com registro de chamados, níveis de atendimento, prazos e indicadores. Todo help desk faz suporte técnico, mas suporte feito por mensagem avulsa, sem registro nem prazo, não chega a ser um help desk.",
  },
  {
    q: "Qual software de help desk escolher?",
    a: "Os critérios que mais pesam são: abertura de chamados por todos os canais numa fila única, base de conhecimento ligada ao atendimento, SLA com escalonamento automático, relatórios prontos em painel, inteligência artificial capaz de resolver solicitações sozinha e espaço para crescer para service desk (catálogo de serviços, gestão de ativos e de mudanças) sem trocar de sistema. Vale avaliar também o custo total de operação, e não só o preço da licença.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/help-desk"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Help desk: o que é, o que faz e como funciona",
  description:
    "Definição de help desk, o que a função faz no dia a dia, os níveis de atendimento N1, N2 e N3, a diferença para service desk e os critérios para escolher o software.",
  inLanguage: "pt-BR",
  ...datasDaPagina("/help-desk"),
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/help-desk",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "Service Desk", item: "https://itsm.sysaid.com.br/service-desk" },
    { "@type": "ListItem", position: 3, name: "Help Desk", item: "https://itsm.sysaid.com.br/help-desk" },
  ],
};

export default function HelpDeskPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
        {/* HERO INFORMACIONAL: a busca por "o que é help desk" é de entendimento, form só no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · Help Desk</p>
            <h1>
              Help desk: o suporte que{" "}
              <span className="hl">resolve o problema</span> do usuário
            </h1>
            <p className="hero__sub">
              Help desk é a estrutura de suporte técnico que atende quem ficou
              sem computador, sem sistema ou sem acesso: registra o relato,
              diagnostica, resolve o que é conhecido e encaminha o resto a quem
              resolve. Neste guia: o que é, o que faz no dia a dia, como
              funcionam os níveis de atendimento, a diferença para o service
              desk e como escolher o software.
            </p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Mais de 400 empresas no país
              usam a plataforma
            </p>
          </div>
        </section>

        {/* DEFINICAO */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O conceito</p>
              <h2>O que é help desk</h2>
            </div>
            <p className="section-head__sub">
              Help desk é a área ou o serviço que presta suporte técnico aos
              usuários de tecnologia de uma empresa. Quando algo deixa de
              funcionar, é para ele que o usuário recorre, e cada relato vira um
              chamado registrado, com responsável e prazo. O nome vem do inglês
              e significa, ao pé da letra, &ldquo;balcão de ajuda&rdquo;. Hoje o
              termo descreve ao mesmo tempo o time, o processo de atendimento e
              o software que organiza os chamados, o{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>. O help
              desk é reativo por natureza: o foco é devolver o serviço ao
              usuário o mais rápido possível. Quando a operação passa a cuidar
              também de pedidos, mudanças, ativos e problemas recorrentes, ela
              ganha outro nome:{" "}
              <a href="/service-desk">service desk</a>.
            </p>
          </div>
        </section>

        {/* O QUE FAZ */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na prática</p>
              <h2>O que faz um help desk</h2>
              <p className="section-head__sub">
                Atender o telefone é a parte visível. Por trás, são cinco
                responsabilidades encadeadas, e o chamado só termina quando o
                usuário confirma que voltou a funcionar.
              </p>
            </div>
            <div className="grid-3">
              {FUNCOES.map((f) => (
                <div className="step" key={f.n}>
                  <span className="step__n">{f.n}</span>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NIVEIS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como funciona</p>
              <h2>Os níveis de atendimento: N1, N2 e N3</h2>
              <p className="section-head__sub">
                O help desk se organiza em camadas para que o especialista não
                gaste o dia redefinindo senha. Quanto mais o primeiro nível
                resolve, mais rápida e barata fica a operação inteira.
              </p>
            </div>
            <div className="grid-3">
              {NIVEIS.map((n) => (
                <div className="card" key={n.t}>
                  <h3>{n.t}</h3>
                  <p>{n.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HELP DESK x SERVICE DESK */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A confusão mais comum</p>
              <h2>Help desk e service desk: qual a diferença</h2>
              <p className="section-head__sub">
                Os dois termos aparecem trocados o tempo todo, inclusive em
                material de fornecedor. A diferença é de escopo, e o guia de{" "}
                <a href="/service-desk">service desk</a> detalha o lado mais
                amplo dessa comparação.
              </p>
            </div>
            <div className="grid-3">
              {DIFERENCAS.map((d) => (
                <div className="card" key={d.t}>
                  <h3>{d.t}</h3>
                  <p>{d.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SINAIS DE AMADURECIMENTO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Hora de amadurecer</p>
              <h2>Quatro sinais de que o help desk ficou pequeno</h2>
              <p className="section-head__sub">
                Nenhum deles se resolve atendendo mais rápido. Todos pedem
                processo, e é aí que entra a{" "}
                <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>.
              </p>
            </div>
            <div className="grid-2">
              {SINAIS.map((s) => (
                <div className="card" key={s.t}>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
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
                O que mudou
              </p>
              <h2>
                O melhor chamado é o que{" "}
                <span className="hl">nunca precisou ser aberto</span>
              </h2>
              <p className="ia__lead">
                Por décadas, melhorar um help desk significou atender mais
                rápido. Com inteligência artificial nativa, passou a significar
                atender menos: o SysAid Copilot entende a solicitação, responde
                o usuário e executa a resolução dos casos comuns sozinho, antes
                de o chamado chegar ao N1.
              </p>
              <ul className="ia__list">
                <li>Até 90% dos chamados resolvidos antes de virarem ticket</li>
                <li>Resolução até 12x mais rápida no que chega ao time</li>
                <li>Respostas sugeridas ao analista, direto no fluxo</li>
                <li>Categoria e prioridade atribuídas automaticamente</li>
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

        {/* CRITERIOS DE ESCOLHA */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na hora de escolher</p>
              <h2>Seis critérios para escolher um software de help desk</h2>
            </div>
            <div className="grid-3">
              {CRITERIOS.map((c) => (
                <div className="card" key={c.t}>
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
              <h2>O que perguntam sobre help desk</h2>
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
            <h2>Veja um help desk com IA rodando na sua operação</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a plataforma com a fila,
              a base de conhecimento, os SLAs e os relatórios da sua operação.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/help-desk" />
    </>
  );
}
