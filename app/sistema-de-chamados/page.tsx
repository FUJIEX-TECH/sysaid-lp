import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { breadcrumbSchema, datasDaPagina, ORG_ID } from "@/lib/seo";
import { altCliente, altSelo } from "@/lib/marcas";

export const metadata: Metadata = {
  title: "Sistema de Chamados de TI: abertura, fila, SLA e portal | SysAid",
  description:
    "Sistema de chamados de TI: abrir chamado pelo portal, e-mail ou Teams, fila única com prazo e relatórios prontos. Para quando a planilha não dá mais conta.",
  alternates: { canonical: "/sistema-de-chamados" },
  openGraph: {
    title: "Sistema de Chamados de TI: abertura, fila, SLA e portal | SysAid Brasil",
    description:
      "Abertura de chamados, fila com prioridade, SLA e portal de autoatendimento numa só plataforma, com implantação e suporte em português.",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const DORES = [
  {
    t: "O chamado chega por todo lado",
    d: "E-mail, WhatsApp, ligação e o analista parado no corredor. Sem um canal único, não existe fila, não existe prioridade e sempre some alguma coisa.",
  },
  {
    t: "Ninguém sabe o que está pendente",
    d: "A planilha de controle depende de alguém lembrar de atualizar. Quando a diretoria pergunta quantos chamados estão abertos, a resposta é um chute.",
  },
  {
    t: "O mesmo problema volta toda semana",
    d: "Reset de senha, liberação de acesso, impressora. O time gasta o dia em pedido repetido e não sobra hora para o que é projeto.",
  },
  {
    t: "Prazo não é acordado, é combinado",
    d: "Sem SLA definido por tipo e prioridade, o que é urgente e o que pode esperar viram negociação caso a caso, todo dia.",
  },
  {
    t: "O usuário não sabe onde o pedido dele está",
    d: "Sem portal de acompanhamento, o próprio usuário vira fonte de novo chamado, cobrando o andamento do primeiro.",
  },
  {
    t: "Não existe histórico para decidir",
    d: "Sem base de dados, não dá para dizer qual categoria mais consome o time, onde investir ou quanta gente a operação precisa.",
  },
];

// Dor D1/D3 (pesquisa de dores 12/11/2026): quem ainda controla em planilha.
// Resposta só com C1, C3 e C5 da lista fechada (13/11/2026); sem "tempo real".
const SINAIS_PLANILHA = [
  "Ninguém atualiza a tempo: o chamado foi resolvido ontem e na planilha ainda está aberto.",
  "A diretoria pergunta quantos chamados estão abertos e a resposta é um chute.",
  "O pedido do corredor e o que chegou no e-mail pessoal do técnico não entram em lugar nenhum.",
  "O número do mês só sai montando à mão, na véspera da reunião.",
  "Quando alguém sai de férias, a fila dele some junto.",
];

// Dor D2: ferramenta que virou projeto. Resposta só com C4 e C10.
// Nunca "fácil", "sem esforço" ou "em minutos".
const SINAIS_PROJETO = [
  "Para mudar um campo ou uma tela, alguém precisa mexer no código.",
  "Um alerta de prazo novo leva semanas para sair, porque entra na fila do fornecedor.",
  "Cada fluxo de aprovação novo vira um pedido ao suporte da própria ferramenta.",
  "Só uma pessoa do time sabe configurar, e tudo espera por ela.",
];

const CUSTO_GRATUITO = [
  "Servidor, banco de dados e backup por conta da própria TI.",
  "Atualização de versão e compatibilidade de plugin a cada versão nova.",
  "Correção de segurança, que depende de a versão em uso continuar recebendo atualização.",
  "As horas do time mantendo a ferramenta de pé, em vez de atender chamado.",
];

const RECURSOS = [
  {
    t: "Abertura por onde o usuário já está",
    d: "Portal, e-mail, Microsoft Teams ou WhatsApp. Tudo cai na mesma fila, com categoria, responsável e prioridade definidos por regra.",
  },
  {
    t: "Portal de autoatendimento",
    d: "O usuário abre, acompanha e resolve sozinho o que dá para resolver sozinho, consultando a base de conhecimento antes de ocupar um analista.",
  },
  {
    t: "Fila, prioridade e atribuição automática",
    d: "Matriz de prioridade por impacto e urgência, com roteamento automático para a pessoa ou o grupo certo, sem triagem manual.",
  },
  {
    t: "SLA com alerta antes de estourar",
    d: "Prazo por tipo de chamado, contagem em horário útil, escalonamento automático e aviso antes do vencimento, não depois.",
  },
  {
    t: "Base de conhecimento viva",
    d: "A solução que funcionou vira artigo e passa a ser sugerida na próxima abertura, para o usuário e para o analista.",
  },
  {
    t: "Relatórios que a diretoria entende",
    d: "Volume por categoria, tempo médio de atendimento, cumprimento de SLA e carga por analista, em dashboard, sem exportar nada na mão.",
  },
];

const PASSOS = [
  {
    n: "01",
    t: "Desenhamos a sua fila",
    d: "Categorias, grupos de atendimento, matriz de prioridade e SLAs saem do jeito que a sua operação já funciona, não de um modelo genérico.",
  },
  {
    n: "02",
    t: "Ligamos os canais de abertura",
    d: "Portal, e-mail e integrações com as ferramentas que a empresa já usa. O usuário não precisa aprender um caminho novo.",
  },
  {
    n: "03",
    t: "A IA assume o repetitivo",
    d: "O Copilot passa a resolver os pedidos comuns sozinho e a sugerir resposta ao analista no que sobra para o time.",
  },
];

const FAQ = [
  {
    q: "Como funciona a abertura de chamados?",
    a: "Os caminhos mais comuns são o portal de autoatendimento, o e-mail e o Microsoft Teams (na versão em nuvem). O pedido cai na mesma fila, ganha categoria, prioridade e um responsável, e o usuário acompanha o andamento pelo portal, sem precisar cobrar o técnico. Ao descrever o problema no portal, ele já vê os artigos da base de conhecimento que respondem aquilo.",
  },
  {
    q: "Como saber se a planilha ainda dá conta?",
    a: "Três perguntas resolvem. Você consegue dizer agora quantos chamados estão abertos e há quanto tempo? Algum pedido já se perdeu porque chegou por fora da planilha? O relatório do mês sai sem alguém montar à mão? Se alguma resposta for não, a planilha já está custando mais do que parece.",
  },
  {
    q: "O que é um sistema de chamados?",
    a: "É a ferramenta que centraliza os pedidos de suporte da empresa em uma fila única, com registro, categoria, responsável, prioridade e prazo. Em vez de o pedido chegar por e-mail, WhatsApp ou conversa de corredor, ele vira um chamado rastreável, com histórico e SLA. É o que permite saber quantos pedidos existem, quem está atendendo o quê e quanto tempo cada coisa leva.",
  },
  {
    q: "Qual a diferença entre sistema de chamados, help desk e service desk?",
    a: "O sistema de chamados é a base: registra e organiza os pedidos. O help desk é o time e o processo que atendem esses chamados, focados em resolver o incidente do usuário. O service desk é mais amplo: além dos chamados, cobre gestão de ativos, mudanças, SLAs e a operação de TI como um todo, alinhada à ITIL. O SysAid entrega os três na mesma plataforma, então a empresa não troca de ferramenta quando a operação amadurece.",
  },
  {
    q: "Dá para migrar o que a gente já controla em planilha?",
    a: "Sim. Chamados em aberto, categorias, usuários e o inventário que existir são importados na implantação. O que estava na planilha vira base histórica, que é justamente o que permite gerar o primeiro relatório de verdade sobre a operação.",
  },
  {
    q: "Serve para chamados que não são de TI?",
    a: "Serve. A mesma estrutura de fila, prioridade e SLA atende RH, financeiro, facilities e qualquer área que receba pedidos internos. É comum a operação começar pela TI e as outras áreas entrarem depois, cada uma com o seu fluxo e a sua base de conhecimento.",
  },
  {
    q: "Quanto tempo leva para colocar no ar?",
    a: "A implantação é rápida e acompanhada por suporte local em português. O prazo exato depende do volume de dados a migrar e de quantos fluxos a operação tem hoje, e é fechado no diagnóstico inicial.",
  },
  {
    q: "Existe sistema de chamados gratuito. Por que pagar?",
    a: "Para começar, a ferramenta gratuita costuma servir. Mas a licença gratuita não é o custo total: servidor, atualização de versão, compatibilidade de plugin, correção de segurança e as horas da própria equipe mantendo a ferramenta entram na conta. A conta que importa é quanto a sua TI gasta para manter a ferramenta de pé, e quanto ela deixa de resolver enquanto faz isso. O bloco \"Sistema de chamados gratuito vale a pena?\", nesta página, detalha essa conta.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/sistema-de-chamados"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// Página de produto/categoria: WebPage (não Article), com as datas reais.
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  ...datasDaPagina("/sistema-de-chamados"),
  name: "Sistema de Chamados de TI: abertura, fila, SLA e portal",
  description: metadata.description,
  inLanguage: "pt-BR",
  publisher: { "@id": ORG_ID },
  about: { "@type": "SoftwareApplication", name: "SysAid", applicationCategory: "BusinessApplication" },
};

const breadcrumb = breadcrumbSchema("/sistema-de-chamados");

export default function SistemaDeChamadosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
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
                <strong>Chamado aberto no WhatsApp do analista</strong>
                <span>Sem registro · Sem prazo</span>
              </div>
            </div>
            <div className="hero__ticket hero__ticket--3">
              <span className="hero__dot hero__dot--amber" />
              <div>
                <strong>&quot;Quantos chamados estão abertos?&quot;</strong>
                <span>Planilha desatualizada · Diretoria</span>
              </div>
            </div>
            <div className="hero__resolved">✓ Resolvido pela IA</div>
          </div>

          <div className="container hero__inner">
            <p className="eyebrow">SysAid Brasil · Sistema de chamados com IA</p>
            <h1>
              O sistema de chamados que não só registra.{" "}
              <span className="hl">Ele resolve</span>
            </h1>
            <p className="hero__sub">
              Centralize a abertura, a priorização e a resolução dos chamados de
              TI em uma só plataforma, com portal de autoatendimento, SLA e
              relatórios. Mais de 400 empresas no Brasil.
            </p>
            <div className="hero__form">
              <LeadForm variant="hero" />
            </div>
            <p className="hero__trust">
              Até 90% dos chamados resolvidos pela IA · Resolução até 12x mais
              rápida · Suporte local em português
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
                  alt={altCliente(c)}
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
              <h2>Sem sistema de chamados, a TI vira balcão</h2>
              <p className="section-head__sub">
                Não é falta de esforço do time. É falta de um lugar único onde o
                pedido entra, ganha prazo e pode ser cobrado.
              </p>
            </div>
            <div className="grid-3">
              {DORES.map((d) => (
                <div className="card" key={d.t}>
                  <h3>{d.t}</h3>
                  <p>{d.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANILHA (dor D1/D3) */}
        <section className="section section--soft" id="planilha-de-chamados">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Planilha de chamados</p>
              <h2>Quando a planilha de chamados deixa de dar conta</h2>
              <p className="section-head__sub">
                A planilha resolve enquanto o time é pequeno e os pedidos são
                poucos. Estes são os sinais de que ela já virou o gargalo.
              </p>
            </div>
            <ul className="sinais">
              {SINAIS_PLANILHA.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="texto-corrido">
              <p>
                Num sistema de chamados, o pedido que chega por e-mail, pelo
                portal ou pelo Microsoft Teams (na versão em nuvem) vira chamado
                na mesma fila, com dono, prioridade e histórico, mesmo quando
                quem escreve não tem cadastro. O usuário acompanha o andamento
                no portal sem cobrar o técnico, e os relatórios de volume,
                cumprimento de prazo e tempo de resolução saem prontos, sem
                exportar para planilha.
              </p>
            </div>
          </div>
        </section>

        {/* RECURSOS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O que a plataforma entrega</p>
              <h2>Do pedido solto ao chamado com dono, prazo e histórico</h2>
            </div>
            <div className="grid-3">
              {RECURSOS.map((r) => (
                <div className="card" key={r.t}>
                  <h3>{r.t}</h3>
                  <p>{r.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VIROU PROJETO (dor D2) */}
        <section className="section section--soft" id="ajuste-vira-projeto">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Para quem já tem ferramenta</p>
              <h2>Já tem um sistema de chamados, mas qualquer ajuste vira projeto</h2>
              <p className="section-head__sub">
                É a queixa mais comum de quem procura trocar de ferramenta: o
                sistema existe, mas não acompanha a operação.
              </p>
            </div>
            <ul className="sinais">
              {SINAIS_PROJETO.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="texto-corrido">
              <p>
                No SysAid, os fluxos de atendimento, com aprovações e tarefas em
                sequência, são montados na tela, arrastando etapas, a partir de
                modelos prontos alinhados à ITIL. Pedido repetido ganha fluxo
                próprio e anda sozinho até alguém precisar agir. A SysAid Brasil
                acompanha a implantação e dá suporte em português, e o desenho
                das filas, dos prazos e dos fluxos é feito com o seu time.
              </p>
              <p>
                Comparando com a ferramenta que você usa hoje? Veja{" "}
                <a href="/movidesk">SysAid x Movidesk</a> e{" "}
                <a href="/topdesk">SysAid x TopDesk</a>.
              </p>
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
                O melhor chamado é o que{" "}
                <span className="hl">nunca precisou ser aberto</span>
              </h2>
              <p className="ia__lead">
                A inteligência artificial nativa da SysAid entende a solicitação,
                responde o usuário e executa a solução sozinha. O que sobra para
                o time é o que realmente exige uma pessoa.
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

        {/* PASSOS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como começa</p>
              <h2>No ar sem parar o atendimento que já existe</h2>
            </div>
            <div className="grid-3">
              {PASSOS.map((p) => (
                <div className="step" key={p.n}>
                  <span className="step__n">{p.n}</span>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
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
                  alt={altSelo(b)}
                  width={78}
                  height={78}
                  className="badge"
                />
              ))}
            </div>
          </div>
        </section>

        {/* GRATUITO */}
        <section className="section" id="sistema-de-chamados-gratuito">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Sistema de chamados gratuito</p>
              <h2>Sistema de chamados gratuito vale a pena?</h2>
            </div>
            <div className="texto-corrido">
              <p>
                Para começar, muitas vezes vale. Uma ferramenta gratuita tira o
                pedido do e-mail e cria o primeiro histórico, e isso já é um
                avanço sobre a planilha. A conta muda quando a operação cresce,
                porque a licença gratuita não é o custo total:
              </p>
            </div>
            <ul className="sinais">
              {CUSTO_GRATUITO.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="texto-corrido">
              <p>
                Um exemplo recente: segundo o site IT-Connect (02/10/2026), a
                versão 10.0.28, de 30/09/2026, foi a última atualização da linha
                10 do GLPI. Com a chegada da versão nova, as falhas que
                aparecerem no código da linha 10 deixam de ser corrigidas, e
                quem roda o GLPI 10 precisa decidir entre migrar de versão ou de
                ferramenta. Comparamos as duas opções em{" "}
                <a href="/glpi">SysAid x GLPI</a>.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section--soft">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>O que perguntam antes de escolher o sistema</h2>
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
            <h2>Veja seus chamados entrando, sendo priorizados e resolvidos</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a
              plataforma rodando com a fila, as prioridades e os SLAs da sua
              operação.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/sistema-de-chamados" />
    </>
  );
}
