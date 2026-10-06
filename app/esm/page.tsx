import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ESM: o que é Enterprise Service Management | SysAid",
  description:
    "ESM aplica as práticas da TI a RH, Facilities, Financeiro e Jurídico. O que é, diferença para ITSM, exemplos por área e como implantar.",
  alternates: { canonical: "/esm" },
  openGraph: {
    title: "ESM: o que é Enterprise Service Management",
    description:
      "Gestão de serviços para toda a empresa: o que é ESM, diferença para ITSM, exemplos por área, LGPD e como implantar.",
    locale: "pt_BR",
    type: "article",
  },
  robots: { index: true, follow: true },
};

const CLIENTES = [
  "vale", "unimed", "petrobras", "cocacola", "siemens",
  "cisco", "kpmg", "mcdonalds", "lufthansa", "ems",
];

const DEFINICAO =
  "ESM (Enterprise Service Management, ou gestão de serviços corporativos) é a aplicação das práticas que a TI já usa para atender a empresa, como catálogo de serviços, chamados, SLA, aprovação, automação e portal de autoatendimento, às demais áreas: RH, Facilities, Financeiro, Jurídico, Compras e Marketing. O colaborador passa a ter um único lugar para pedir qualquer coisa, e cada área passa a ter fila, prazo e indicador para o que atende.";

const ESM_X_ITSM = [
  { crit: "Escopo", itsm: "Serviços de tecnologia", esm: "Serviços de qualquer área da empresa" },
  { crit: "Quem atende", itsm: "Service desk e times técnicos de TI", esm: "TI, RH, Facilities, Financeiro, Jurídico, Compras, cada um no seu espaço" },
  { crit: "Exemplos de pedido", itsm: "Acesso a sistema, notebook, senha, incidente", esm: "Férias, holerite, reserva de sala, reembolso, contrato, compra" },
  { crit: "Dados", itsm: "Inventário, configuração, histórico de chamados", esm: "Inclui dado pessoal e sensível: salário, saúde, jurídico. Exige segregação" },
  { crit: "Dono", itsm: "Gestor de TI ou de service desk", esm: "Cada área é dona do seu catálogo; a plataforma costuma ser gerida pela TI ou por um centro de serviços compartilhados" },
];

const AREAS = [
  {
    t: "RH",
    d: "Admissão e desligamento, férias, holerite e informe de rendimentos, alteração cadastral, benefícios, declarações. Cada pedido vira registro com prazo, e o colaborador acompanha pelo portal em vez de perguntar no corredor.",
  },
  {
    t: "Facilities",
    d: "Reserva de sala, crachá e estacionamento, manutenção predial, mesa e cadeira, ar-condicionado, limpeza. A área deixa de receber tudo por WhatsApp e passa a ter fila, prioridade e histórico.",
  },
  {
    t: "Financeiro",
    d: "Reembolso de despesa, adiantamento, emissão e segunda via de nota, cadastro de fornecedor, aprovação de pagamento. Pedido padronizado chega completo e com os anexos certos na primeira tentativa.",
  },
  {
    t: "Jurídico",
    d: "Revisão de contrato, parecer, procuração, NDA, consulta sobre LGPD. Fila própria com dado isolado das outras áreas e trilha de quem pediu, quem aprovou e quem respondeu.",
  },
  {
    t: "Compras",
    d: "Solicitação de compra, cotação, renovação de licença e de contrato. Aprovação por alçada no fluxo, sem o e-mail de 'ok, pode comprar' perdido na caixa de entrada.",
  },
  {
    t: "Marketing",
    d: "Peça de comunicação, brinde, material de evento, atualização de página. Prazo acordado e demanda priorizada por critério, não por quem insistiu mais.",
  },
];

const ONBOARDING = [
  {
    n: "01",
    t: "RH abre a admissão",
    d: "Um único pedido no portal, com nome, cargo, área, data de início e gestor. É o gatilho de tudo que vem depois.",
  },
  {
    n: "02",
    t: "TI recebe as tarefas dela",
    d: "Notebook, e-mail, acessos aos sistemas do cargo, licenças. Cada item com SLA próprio, contado a partir da data de início.",
  },
  {
    n: "03",
    t: "Facilities prepara o lugar",
    d: "Mesa, cadeira, crachá, vaga, ramal. Em paralelo com a TI, não depois, porque o fluxo abriu os dois ao mesmo tempo.",
  },
  {
    n: "04",
    t: "Financeiro faz o cadastro",
    d: "Conta para pagamento, centro de custo, cartão corporativo quando houver. Aprovação por alçada dentro do próprio fluxo.",
  },
  {
    n: "05",
    t: "Todo mundo vê o mesmo painel",
    d: "O RH acompanha o que falta sem perguntar a ninguém. No primeiro dia, o colaborador senta, liga o notebook e entra. É isso que o ESM entrega.",
  },
];

const PILARES = [
  {
    t: "Catálogo de serviços por área",
    d: "Cada área publica o que atende, com formulário próprio, campos obrigatórios e anexos. O pedido chega completo e classificado, e a área decide o que oferece.",
  },
  {
    t: "Portal único para o colaborador",
    d: "Uma entrada só para pedir qualquer coisa: TI, RH, Facilities ou Financeiro. O colaborador não precisa saber quem resolve; a plataforma roteia.",
  },
  {
    t: "Fila, prioridade e SLA por área",
    d: "Cada área tem a própria fila, os próprios prazos e os próprios critérios de prioridade. O SLA do RH não é o da TI, e a ferramenta precisa respeitar isso.",
  },
  {
    t: "Aprovação e fluxo entre áreas",
    d: "Um pedido pode acionar várias áreas em sequência ou em paralelo, com aprovação por alçada no caminho. É o que transforma admissão, desligamento e compra em processo, não em troca de e-mails.",
  },
  {
    t: "Automação e inteligência artificial",
    d: "O que é repetitivo se resolve sozinho: a IA responde a dúvida simples, abre o pedido certo e executa o que já tem regra. O time entra só no que exige julgamento.",
  },
  {
    t: "Segregação de dados e permissão por perfil",
    d: "Dado de RH não aparece para a TI, dado jurídico não aparece para o Facilities. Cada espaço tem o próprio controle de acesso e a própria trilha de auditoria.",
  },
  {
    t: "Relatórios consolidados",
    d: "Volume, prazo e satisfação por área, numa visão só para a liderança. É o que permite comparar operação e decidir onde investir em automação.",
  },
];

const SYSAID = [
  {
    t: "Spaces: um espaço por área",
    d: "RH, Facilities, Financeiro e Jurídico operam em espaços próprios, com catálogo, fila, SLA, permissões e dados segregados, dentro da mesma plataforma que a TI já usa.",
  },
  {
    t: "IA por área",
    d: "Agentes de IA que entendem o pedido no vocabulário de cada área, respondem o que é simples e executam a solicitação completa sozinhos, abrindo o chamado para uma pessoa só quando precisa.",
  },
  {
    t: "Modelos prontos",
    d: "Catálogos e fluxos modelo para RH, Financeiro e Facilities, para a área começar pelo que é comum e ajustar, em vez de desenhar tudo do zero.",
  },
  {
    t: "Portal único e relatórios globais",
    d: "Uma porta de entrada para o colaborador e uma visão consolidada para a liderança, com o histórico de ITSM preservado. O ESM nasce do que a TI já tem, não ao lado dele.",
  },
];

const IMPLANTACAO = [
  {
    n: "01",
    t: "Escolha a primeira área",
    d: "A que mais recebe pedido por e-mail ou WhatsApp e mais sofre com retrabalho. Na maioria das empresas é o RH ou o Facilities. Uma área só, para provar valor rápido.",
  },
  {
    n: "02",
    t: "Mapeie os dez pedidos mais comuns",
    d: "Não o catálogo inteiro. Os dez que respondem por boa parte do volume, com o que cada um precisa de informação, anexo e aprovação.",
  },
  {
    n: "03",
    t: "Defina prazo e aprovação",
    d: "SLA realista por tipo de pedido e alçada de aprovação onde houver dinheiro ou dado sensível envolvido. É o que a área vai medir depois.",
  },
  {
    n: "04",
    t: "Publique no portal, meça e expanda",
    d: "Lance para a empresa, acompanhe volume e prazo nas primeiras semanas, ajuste o que travou e só então chame a próxima área. ESM é expansão progressiva, não big bang.",
  },
];

const CRITERIOS = [
  {
    t: "Segregação de dados de verdade",
    d: "Espaço por área com permissão, visibilidade e auditoria próprias. Se a TI consegue abrir o chamado de salário do RH, a plataforma não serve para ESM.",
  },
  {
    t: "Portal único com roteamento",
    d: "O colaborador pede num lugar só e a plataforma leva ao time certo. Um portal por área é o problema de hoje com cara nova.",
  },
  {
    t: "Fluxo entre áreas sem código",
    d: "Admissão, desligamento e compra cruzam áreas. O gestor de cada área precisa conseguir ajustar o próprio fluxo sem abrir chamado para a TI.",
  },
  {
    t: "IA que executa, não só sugere",
    d: "Responder dúvida e abrir o pedido certo sozinha reduz volume. Sugerir texto ao atendente reduz pouco. A diferença aparece na fila.",
  },
  {
    t: "Relatórios por área e consolidados",
    d: "Cada área vê a própria operação; a liderança vê todas. Exportar para planilha não é relatório.",
  },
  {
    t: "Licenciamento que não pune a expansão",
    d: "Se cada área nova custa um módulo caro, o ESM para na segunda área. Entenda o modelo de licença antes do piloto, não depois.",
  },
  {
    t: "Nuvem ou on-premise, conforme a política",
    d: "Dado de RH e jurídico costuma ter regra de residência e de segurança própria. A plataforma precisa atender a política da empresa, não o contrário.",
  },
];

const FAQ = [
  {
    q: "O que é ESM?",
    a: "ESM é a sigla de Enterprise Service Management, em português gestão de serviços corporativos. É a prática de aplicar o que a TI já faz para atender a empresa, como catálogo de serviços, chamados, SLA, aprovação, automação e portal de autoatendimento, às outras áreas: RH, Facilities, Financeiro, Jurídico, Compras e Marketing. O resultado é um único lugar para o colaborador pedir qualquer coisa e uma operação medida em cada área.",
  },
  {
    q: "O que significa ESM em TI?",
    a: "Em TI, ESM significa Enterprise Service Management e é uma extensão do ITSM (IT Service Management). A sigla também aparece com outros significados fora da gestão de serviços, como módulos de JavaScript ou produtos de segurança, mas no contexto de atendimento, chamados e processos corporativos ela sempre se refere à gestão de serviços para toda a empresa.",
  },
  {
    q: "Qual a diferença entre ESM e ITSM?",
    a: "A diferença é o escopo. ITSM organiza os serviços de tecnologia, atendidos pela TI. ESM leva o mesmo modelo de catálogo, fila, SLA e automação para as demais áreas da empresa, cada uma com o próprio espaço e os próprios dados. O ESM não substitui o ITSM: ele parte do ITSM e o expande para RH, Facilities, Financeiro e Jurídico.",
  },
  {
    q: "O ESM substitui o ITSM?",
    a: "Não. O ITSM continua sendo a disciplina que organiza os serviços de TI, e o ESM é a extensão desse modelo para as outras áreas. Na prática, as empresas que adotam ESM já tinham ITSM funcionando e usam a mesma plataforma, com espaços segregados por área, para evitar manter uma ferramenta diferente em cada departamento.",
  },
  {
    q: "Quais áreas podem usar ESM?",
    a: "Qualquer área que receba pedidos de outras pessoas da empresa. As mais comuns são RH (admissão, férias, holerite, benefícios), Facilities (reserva de sala, crachá, manutenção), Financeiro (reembolso, nota fiscal, cadastro de fornecedor), Jurídico (contrato, parecer, NDA), Compras (solicitação e cotação) e Marketing (peças e materiais). A regra é começar por uma área e expandir.",
  },
  {
    q: "Quais são os benefícios do ESM?",
    a: "Pedido padronizado que chega completo na primeira vez, prazo acordado e medido em cada área, fim do pedido perdido em e-mail ou WhatsApp, processos que cruzam áreas (como admissão) executados em fluxo, automação do que é repetitivo, dado sensível isolado por área com trilha de auditoria e uma visão consolidada da operação para a liderança. Para o colaborador, um único lugar para pedir qualquer coisa.",
  },
  {
    q: "Como implantar ESM na empresa?",
    a: "Em quatro passos: escolher a primeira área (a que mais recebe pedido por canal informal), mapear os dez pedidos mais comuns dela com o que cada um exige de informação e aprovação, definir SLA e alçada de aprovação, e publicar no portal, medir nas primeiras semanas e só então expandir para a próxima área. ESM funciona como expansão progressiva a partir do ITSM, não como projeto único para a empresa inteira.",
  },
  {
    q: "O que é uma plataforma de ESM?",
    a: "É o software que sustenta a gestão de serviços de toda a empresa: catálogo de serviços por área, portal único para o colaborador, fila com prioridade e SLA por área, aprovação e fluxo entre áreas, automação e IA, segregação de dados com permissão por perfil e relatórios por área e consolidados. Em geral é a mesma plataforma de ITSM da empresa, expandida com espaços segregados para as outras áreas.",
  },
  {
    q: "Os dados de RH ficam visíveis para a TI?",
    a: "Não devem ficar, e esse é o critério número um ao escolher a plataforma. Numa plataforma de ESM adequada, cada área opera num espaço segregado, com permissões, visibilidade e trilha de auditoria próprias. A TI pode administrar a plataforma sem enxergar o conteúdo dos chamados do RH ou do Jurídico. A plataforma dá o controle; a política de quem acessa o quê é definida pela empresa.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/esm"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "ESM (Enterprise Service Management): gestão de serviços para toda a empresa",
  description:
    "O que é ESM, a diferença para ITSM, exemplos por área, o fluxo de admissão como caso prático, os pilares de uma plataforma de ESM, LGPD e como implantar.",
  inLanguage: "pt-BR",
  datePublished: "2026-10-01",
  dateModified: "2026-10-01",
  // Aponta pro Organization declarado no layout (@id) em vez de repetir a entidade.
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/esm",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "ESM", item: "https://itsm.sysaid.com.br/esm" },
  ],
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "ESM",
  alternateName: ["Enterprise Service Management", "Gestão de serviços corporativos"],
  description: DEFINICAO,
  inDefinedTermSet: "https://itsm.sysaid.com.br/esm",
};

export default function EsmPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
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
          <a className="btn btn--lime btn--sm" href="#demo">
            Agende uma demonstração
          </a>
        </div>
      </header>

      <main>
        {/* HERO INFORMACIONAL — a busca por "esm" é de entendimento; o form fica no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · ESM</p>
            <h1>
              ESM (Enterprise Service Management):{" "}
              <span className="hl">gestão de serviços</span> para toda a
              empresa
            </h1>
            <p className="hero__sub">
              O ESM aplica o que a TI já usa, como catálogo, chamados, SLA,
              aprovação e autoatendimento, a RH, Facilities, Financeiro,
              Jurídico e Compras. Um portal para o colaborador, um espaço para
              cada área. Neste guia: o que é, a diferença para ITSM, exemplos
              por área, como fica a LGPD e como implantar.
            </p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Mais de 400 empresas no país
              usam a plataforma
            </p>
          </div>
        </section>

        {/* DEFINICAO */}
        <section className="section" id="o-que-e">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O conceito</p>
              <h2>O que é ESM</h2>
            </div>
            <p className="section-head__sub">{DEFINICAO}</p>
            <p className="section-head__sub">
              A sigla vem de Enterprise Service Management; em português,
              gestão de serviços corporativos. O modelo é o mesmo da{" "}
              <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>:
              a diferença é que ele deixa de valer só para a tecnologia e passa
              a valer para qualquer área que atenda pedidos de outras pessoas
              da empresa. O alicerce técnico continua sendo o{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>, e a
              função que faz o contato com quem pede continua sendo o{" "}
              <a href="/service-desk">service desk</a>, agora de cada área.
            </p>
          </div>
        </section>

        {/* ESM x ITSM */}
        <section className="section section--soft" id="esm-x-itsm">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A comparação que todo mundo faz</p>
              <h2>ESM x ITSM: qual é a diferença</h2>
              <p className="section-head__sub">
                O ESM não substitui o ITSM: parte dele. Quem já tem a{" "}
                <a href="/o-que-e-itsm">gestão de serviços de TI</a> rodando
                tem o modelo pronto; o que muda é o escopo, quem atende e o
                cuidado com os dados.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo ESM e ITSM">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">ITSM</span>
                <span role="columnheader" className="ctable__us">ESM</span>
              </div>
              {ESM_X_ITSM.map((r) => (
                <div className="ctable__row" role="row" key={r.crit}>
                  <span className="ctable__crit" role="cell">{r.crit}</span>
                  <span className="ctable__them" role="cell" data-label="ITSM">{r.itsm}</span>
                  <span className="ctable__mine" role="cell">{r.esm}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXEMPLOS POR AREA */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Onde o ESM entra</p>
              <h2>Exemplos por área</h2>
              <p className="section-head__sub">
                Toda área que recebe pedido de outra pessoa da empresa tem um
                serviço para organizar. Estes são os pedidos típicos que viram
                item de catálogo nas primeiras semanas.
              </p>
            </div>
            <div className="grid-3">
              {AREAS.map((a) => (
                <div className="card" key={a.t}>
                  <h3>{a.t}</h3>
                  <p>{a.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ONBOARDING */}
        <section className="section section--soft" id="onboarding">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O fluxo que explica o ESM</p>
              <h2>A admissão de um colaborador, de ponta a ponta</h2>
              <p className="section-head__sub">
                Nenhum pedido mostra melhor por que o ESM existe. Uma admissão
                aciona quatro áreas, e sem fluxo entre elas o novo colaborador
                chega no primeiro dia sem notebook, sem crachá ou sem acesso.
              </p>
            </div>
            <div className="grid-3">
              {ONBOARDING.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step__n">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PILARES */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O que a plataforma precisa ter</p>
              <h2>Os pilares de uma plataforma de ESM</h2>
            </div>
            <div className="grid-3">
              {PILARES.map((p) => (
                <div className="card" key={p.t}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LGPD */}
        <section className="section section--soft" id="lgpd">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">A objeção número um</p>
              <h2>Dados de RH no mesmo sistema da TI: como fica a LGPD</h2>
            </div>
            <p className="section-head__sub">
              É a primeira pergunta de todo RH e de todo Jurídico, e ela é
              legítima: salário, atestado, processo e contrato são dados
              pessoais, muitos deles sensíveis. Colocar isso na mesma plataforma
              que a TI administra só funciona se a plataforma segregar de
              verdade. Três coisas precisam existir: espaços separados por
              área, com o conteúdo de um invisível para o outro; permissão por
              perfil, para que quem administra a ferramenta não enxergue o
              conteúdo dos chamados; e trilha de auditoria, para saber quem
              acessou o quê e quando. A plataforma dá o controle e o registro;
              a política de acesso, a base legal e o prazo de retenção são
              definidos pela empresa, com o seu encarregado de dados. Avalie a
              segregação no piloto, com um caso real do RH, antes de assinar.
            </p>
          </div>
        </section>

        {/* COMO A SYSAID FAZ */}
        <section className="section section--dark" id="sysaid">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow" style={{ color: "var(--lime)" }}>
                Na plataforma
              </p>
              <h2>
                Como a SysAid faz ESM:{" "}
                <span className="hl">um espaço por área</span>, a mesma
                plataforma da TI
              </h2>
              <p className="section-head__sub">
                O SysAid ESM, disponível no Brasil pela SysAid Brasil, leva
                para RH, Facilities, Financeiro e Jurídico a plataforma de ITSM
                com IA que a TI já usa, com dados segregados por área e agentes
                de IA que resolvem o pedido sozinhos.
              </p>
            </div>
            <div className="grid-3">
              {SYSAID.map((s) => (
                <div className="card" key={s.t}>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
            <p className="section-head__sub" style={{ marginTop: 24 }}>
              O SysAid ESM é comercializado no Brasil pela SysAid Brasil, com
              implantação e suporte em português.{" "}
              <a href="#demo" style={{ color: "var(--lime)" }}>
                Agende uma demonstração
              </a>{" "}
              para ver um espaço de RH ou Facilities rodando na mesma
              plataforma da TI.
            </p>
          </div>
        </section>

        {/* IMPLANTACAO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como começar</p>
              <h2>Como implantar ESM em quatro passos</h2>
            </div>
            <div className="grid-3">
              {IMPLANTACAO.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step__n">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CRITERIOS DE ESCOLHA */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na hora de escolher</p>
              <h2>Sete critérios para avaliar uma plataforma de ESM</h2>
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
        <section className="section">
          <div className="container">
            <div className="stats">
              <div className="stat">
                <div className="stat__n">400+</div>
                <div className="stat__l">empresas no Brasil</div>
              </div>
              <div className="stat">
                <div className="stat__n">10 mi</div>
                <div className="stat__l">usuários no mundo</div>
              </div>
              <div className="stat">
                <div className="stat__n">90%</div>
                <div className="stat__l">dos chamados de TI resolvidos com IA</div>
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
                  alt="Reconhecimento SysAid em ITSM"
                  width={78}
                  height={78}
                  className="badge"
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
              <h2>O que perguntam sobre ESM</h2>
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
        <section className="section section--dark" id="demo">
          <div className="container container--narrow text-center">
            <p className="eyebrow" style={{ color: "var(--lime)" }}>
              Fale com um especialista
            </p>
            <h2>Veja o ESM funcionando na sua operação</h2>
            <p className="form-final__sub">
              Demonstração sem compromisso. Mostramos um espaço de RH ou de
              Facilities com catálogo, fila, SLA e o fluxo de admissão cruzando
              áreas, na mesma plataforma da TI.
            </p>
            <div className="form-final__box" id="form">
              <LeadForm variant="final" submitLabel="Agende uma demonstração" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/esm" />
    </>
  );
}
