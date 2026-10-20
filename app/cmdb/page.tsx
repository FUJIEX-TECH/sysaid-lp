import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CMDB: o que é, para que serve e como implantar | SysAid",
  description:
    "O que é CMDB, o que é item de configuração, a relação com ITIL 4, ITSM e gestão de ativos, e um roteiro de implantação que não vira planilha abandonada.",
  alternates: { canonical: "/cmdb" },
  openGraph: {
    title: "CMDB: o que é, para que serve e como implantar",
    description:
      "Itens de configuração, relações, CMDB no ITIL 4 e no ITSM, diferença para gestão de ativos e por que tanta CMDB morre desatualizada.",
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
  "CMDB (Configuration Management Database, ou banco de dados de gerenciamento de configuração) é o repositório onde a TI registra os itens que sustentam os serviços da empresa, chamados itens de configuração (ICs), e as relações entre eles: qual aplicação roda em qual servidor, qual serviço depende de qual banco de dados, qual contrato cobre qual equipamento. É o que permite responder, antes de mexer, o que para se aquele item parar.";

const CLASSES = [
  {
    t: "Serviço de negócio",
    d: "Folha de pagamento, e-commerce, ERP, atendimento ao cliente. É o topo do mapa: o que o usuário enxerga e o que a diretoria pergunta quando cai. Atributos mínimos: nome, dono do negócio, horário crítico, SLA.",
  },
  {
    t: "Aplicação",
    d: "O sistema que entrega o serviço: o ERP, o portal, a API de pagamento. Atributos mínimos: versão, ambiente (produção, homologação), responsável técnico, de que serviço faz parte.",
  },
  {
    t: "Infraestrutura",
    d: "Servidores físicos e virtuais, bancos de dados, storage, instâncias em nuvem. Atributos mínimos: sistema operacional, localização ou região, o que roda nele.",
  },
  {
    t: "Rede",
    d: "Switches, roteadores, firewalls, links de operadora, VPN. Quase nunca aparecem para o usuário, e por isso mesmo são os que mais surpreendem numa queda.",
  },
  {
    t: "Estação e dispositivo",
    d: "Notebook, desktop, celular corporativo, impressora. Entram na CMDB quando importam para o atendimento (quem usa, que software tem); o detalhe de compra e depreciação fica na gestão de ativos.",
  },
  {
    t: "Documento e contrato",
    d: "Contrato de suporte, garantia, licença, acordo com fornecedor. Não é técnico, mas é item de configuração quando responde a pergunta “quem eu aciono se isso quebrar?”.",
  },
];

const CMDB_X_ITAM = [
  { crit: "Pergunta que responde", itam: "O que eu tenho, onde está, quanto custou e quando vence?", cmdb: "Do que cada serviço depende, e o que é afetado se este item mudar ou parar?" },
  { crit: "Foco", itam: "O ativo como bem: compra, contrato, licença, depreciação, descarte", cmdb: "O item como parte de um serviço: configuração, relações, histórico de mudanças" },
  { crit: "Ciclo de vida", itam: "Do pedido de compra ao descarte", cmdb: "Enquanto o item sustenta um serviço em operação" },
  { crit: "Quem mais usa", itam: "Gestão de ativos, Compras, Financeiro, auditoria de licenças", cmdb: "Service desk, gestão de problemas e de mudanças, operação" },
  { crit: "Unidade", itam: "Um registro por ativo", cmdb: "Um registro por item de configuração, ligado a outros por relações" },
];

const PROCESSOS = [
  {
    t: "Incidente",
    d: "O chamado já chega com o item afetado e o que depende dele. O analista vê que o servidor do ERP caiu e que, por isso, três filiais estão sem faturar, em vez de tratar trinta chamados soltos.",
  },
  {
    t: "Problema",
    d: "Quando o mesmo item aparece em incidentes repetidos, a CMDB mostra o padrão. A análise de causa raiz começa pelo histórico do item, não pela memória de quem estava de plantão.",
  },
  {
    t: "Mudança",
    d: "Antes de aprovar a troca de um servidor ou a atualização de um sistema, o comitê vê quais serviços dependem dele. É a análise de impacto que separa mudança planejada de incidente agendado.",
  },
  {
    t: "Requisição e catálogo",
    d: "O pedido de acesso ou de software sabe em que item vai ser executado. A entrega fica registrada no próprio item, e a CMDB se atualiza com o trabalho do dia a dia.",
  },
];

const IMPLANTACAO = [
  {
    n: "01",
    t: "Comece por um serviço, não pelo inventário",
    d: "Escolha um ou dois serviços críticos (o ERP, o e-commerce) e mapeie só o que os sustenta. CMDB que começa tentando cadastrar tudo termina sem cadastrar nada direito.",
  },
  {
    n: "02",
    t: "Defina o modelo antes de importar",
    d: "Quais classes de item existem, quais atributos são obrigatórios em cada uma e quais tipos de relação valem (roda em, depende de, conecta a, coberto por). Pouco atributo bem mantido vale mais que muito atributo vazio.",
  },
  {
    n: "03",
    t: "Deixe a descoberta fazer o trabalho braçal",
    d: "Descoberta automática na rede e agente nas máquinas trazem hardware, software e atributos sem digitação. O que não é descoberto (contrato, serviço de negócio) entra por importação de planilha uma vez e depois é mantido no fluxo.",
  },
  {
    n: "04",
    t: "Reconcilie as fontes",
    d: "O mesmo servidor vem da descoberta, da planilha antiga e do console da nuvem. Defina qual fonte manda em cada atributo e como duplicados se resolvem, ou a CMDB começa com três versões da verdade.",
  },
  {
    n: "05",
    t: "Dê um dono para cada classe",
    d: "Infraestrutura cuida de servidores, o time de aplicações cuida das aplicações, o gestor do serviço cuida do serviço de negócio. Item sem dono é item desatualizado em seis meses.",
  },
  {
    n: "06",
    t: "Ligue a CMDB ao chamado e à mudança, e audite",
    d: "Se toda mudança aprovada atualiza o item e todo incidente aponta para um item, a CMDB vive. Uma auditoria trimestral por amostragem mostra onde ela descolou da realidade.",
  },
];

const POR_QUE_MORRE = [
  {
    t: "Nasceu como projeto, não como processo",
    d: "Um mutirão de cadastro, uma planilha importada e nenhum fluxo que a atualize depois. No dia seguinte à importação, ela já começa a envelhecer.",
  },
  {
    t: "Escopo grande demais",
    d: "Cadastrar cada mouse e cada cabo cria trabalho que ninguém sustenta. O que não ajuda a resolver incidente nem a aprovar mudança não precisa estar lá.",
  },
  {
    t: "Ninguém consulta",
    d: "Se o analista não vê a CMDB ao abrir o chamado e o comitê não vê ao aprovar a mudança, ninguém percebe que ela está errada, e ninguém corrige.",
  },
  {
    t: "Tudo depende de digitação",
    d: "Sem descoberta automática, cada mudança de configuração exige alguém lembrar de atualizar o registro. Na semana de incêndio, ninguém lembra.",
  },
];

const CRITERIOS = [
  {
    t: "Descoberta automática nativa",
    d: "Varredura de rede e agente que atualizam o item sozinhos. Se a descoberta é um produto à parte, com licença à parte, conte esse custo desde o começo.",
  },
  {
    t: "Relações e mapa de dependências",
    d: "Não basta a lista de itens: o valor está no grafo. Veja se dá para navegar do serviço até o servidor e do servidor de volta a todos os serviços que ele sustenta.",
  },
  {
    t: "Vínculo com chamado, problema e mudança",
    d: "A CMDB precisa aparecer dentro do incidente e da aprovação de mudança, na mesma ferramenta. CMDB em sistema separado é consultada só por quem lembra que ela existe.",
  },
  {
    t: "Modelo flexível sem código",
    d: "Criar classe de item, atributo e tipo de relação pela configuração, sem projeto de desenvolvimento para cada ajuste.",
  },
  {
    t: "Importação e API",
    d: "Importar planilha na carga inicial e integrar com nuvem e com outras fontes depois. A CMDB tem de aceitar dado de fora sem virar trabalho manual.",
  },
  {
    t: "Permissão e trilha de auditoria",
    d: "Quem pode ver e quem pode alterar item de configuração, e o histórico de cada alteração. É o que a auditoria e a segurança vão pedir.",
  },
];

const SYSAID = [
  {
    t: "CMDB nativa no ITSM",
    d: "A CMDB é parte da plataforma de ITSM da SysAid, sem módulo de terceiros nem sincronização: chamados, ativos, tarefas e mudanças apontam para os mesmos itens de configuração.",
  },
  {
    t: "Descoberta de rede",
    d: "O módulo de descoberta varre a rede e traz dispositivos, software e atributos para a base, com atualização automática. Itens que não são descobertos entram por importação de CSV.",
  },
  {
    t: "Grafo de relações",
    d: "Cada item mostra com quem se relaciona, inclusive componentes que não são de TI, como contratos e serviços. O mesmo grafo aparece no próprio ativo, numa aba de CMDB.",
  },
  {
    t: "Análise de impacto na mudança",
    d: "Antes de aprovar a troca de um servidor ou a atualização de um software, a equipe vê os itens e serviços que dependem dele. Na falha, as relações encurtam o caminho até a causa raiz.",
  },
];

const FAQ = [
  {
    q: "O que é CMDB?",
    a: "CMDB é a sigla de Configuration Management Database, em português banco de dados de gerenciamento de configuração. É o repositório onde a TI registra os itens de configuração que sustentam os serviços (servidores, aplicações, redes, contratos, serviços de negócio) e as relações entre eles. Com essas relações, a TI sabe o que é afetado quando um item muda ou para.",
  },
  {
    q: "Para que serve a CMDB?",
    a: "Serve para tomar decisão de operação com base no mapa real do ambiente: descobrir rapidamente o que um incidente afeta, encontrar a causa raiz de problemas que se repetem, avaliar o impacto de uma mudança antes de aprová-la e saber quem acionar quando um item falha. Sem CMDB, essas respostas dependem da memória de quem conhece o ambiente.",
  },
  {
    q: "Qual a diferença entre CMDB e inventário de TI?",
    a: "O inventário (ou a gestão de ativos) responde o que a empresa tem, onde está, quanto custou e quando vence. A CMDB responde como esses itens se relacionam e quais serviços dependem de cada um. Os dois se complementam: a descoberta de ativos alimenta a CMDB, e a CMDB dá ao ativo o contexto de serviço que o inventário sozinho não tem.",
  },
  {
    q: "O que é item de configuração (IC)?",
    a: "Item de configuração, ou IC (configuration item, CI), é qualquer componente que precisa ser gerenciado para entregar um serviço de TI: um servidor, uma aplicação, um banco de dados, um link de rede, um contrato de suporte ou o próprio serviço de negócio. Cada IC tem atributos (versão, local, responsável) e relações com outros ICs.",
  },
  {
    q: "A CMDB é obrigatória no ITIL?",
    a: "O ITIL 4 não exige uma ferramenta com esse nome, mas a prática de gestão de configuração de serviço pede que a organização mantenha informação confiável sobre os itens de configuração e as relações entre eles. Na prática, a CMDB é a forma mais comum de cumprir essa prática, e ela é a base para gestão de incidentes, problemas e mudanças funcionar com análise de impacto.",
  },
  {
    q: "Existe CMDB gratuita?",
    a: "Existem ferramentas open source com CMDB, como o GLPI com plugins e o iTop. O custo de licença é zero, mas o custo de operação aparece em infraestrutura, configuração, atualização e no tempo do time para manter a base viva. Na avaliação, compare o custo total e verifique se a descoberta automática e o vínculo com chamados e mudanças vêm prontos ou dependem de integração.",
  },
  {
    q: "Quanto tempo leva para implantar uma CMDB?",
    a: "Depende do escopo, e por isso a recomendação é começar pequeno: um ou dois serviços críticos, com o modelo de dados definido e a descoberta automática ligada, costumam ficar utilizáveis em semanas, não em meses. A CMDB cresce serviço a serviço. Projetos que tentam mapear o ambiente inteiro de uma vez são os que mais demoram e os que mais abandonam a base depois.",
  },
  {
    q: "A CMDB do ServiceNow é diferente da de outras ferramentas?",
    a: "O conceito é o mesmo: itens de configuração, atributos e relações, ligados a incidente, problema e mudança. As diferenças práticas estão em como a descoberta é licenciada (no ServiceNow, ela faz parte do módulo de operações, o ITOM), no esforço para modelar e manter a base e no custo total. Ferramentas de ITSM como a SysAid trazem CMDB e descoberta de rede na mesma plataforma do service desk.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/cmdb"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "CMDB: o que é e como usar na gestão de serviços de TI",
  description:
    "O que é CMDB, o que entra como item de configuração, a CMDB no ITIL 4 e no ITSM, a diferença para gestão de ativos, um roteiro de implantação em seis passos e por que tantas CMDBs ficam desatualizadas.",
  inLanguage: "pt-BR",
  datePublished: "2026-10-06",
  dateModified: "2026-10-06",
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/cmdb",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "CMDB", item: "https://itsm.sysaid.com.br/cmdb" },
  ],
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "CMDB",
  alternateName: [
    "Configuration Management Database",
    "Banco de dados de gerenciamento de configuração",
  ],
  description: DEFINICAO,
  inDefinedTermSet: "https://itsm.sysaid.com.br/cmdb",
};

export default function CmdbPage() {
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
        {/* HERO INFORMACIONAL: a busca por "cmdb" é de entendimento; o form fica no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · CMDB</p>
            <h1>
              CMDB: o que é e como usar na{" "}
              <span className="hl">gestão de serviços de&nbsp;TI</span>
            </h1>
            <p className="hero__sub">
              A CMDB é o mapa do que sustenta cada serviço da TI e de como
              essas peças se ligam. Neste guia: o que é, o que entra como item
              de configuração, onde ela aparece no ITIL 4 e no ITSM, a
              diferença para gestão de ativos, como implantar em seis passos e
              por que tanta CMDB morre desatualizada.
            </p>
            <p className="hero__trust">
              Guia escrito pela SysAid Brasil · Nota 4,5/5 no G2 (750+
              avaliações)
            </p>
          </div>
        </section>

        {/* DEFINICAO */}
        <section className="section" id="o-que-e">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">O conceito</p>
              <h2>O que é CMDB</h2>
            </div>
            <p className="section-head__sub">{DEFINICAO}</p>
            <p className="section-head__sub">
              Um exemplo concreto: o serviço “faturamento” depende do ERP; o ERP
              roda em dois servidores virtuais e usa um banco de dados; os
              servidores estão num cluster coberto por um contrato de suporte.
              Cada um desses é um item de configuração, e cada “depende de”,
              “roda em” e “coberto por” é uma relação. Quando o banco de dados
              precisa de manutenção, a CMDB diz na hora que o faturamento vai
              parar, e quem precisa ser avisado. Ela é uma peça da{" "}
              <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>,
              não um fim em si: só vale o que ela ajuda a decidir.
            </p>
          </div>
        </section>

        {/* ITENS DE CONFIGURACAO */}
        <section className="section section--soft" id="itens-de-configuracao">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O que entra</p>
              <h2>Itens de configuração: o que entra na CMDB e o que fica fora</h2>
              <p className="section-head__sub">
                A regra prática: entra o que ajuda a resolver incidente, achar
                causa de problema ou aprovar mudança. Mouse, cabo e material de
                escritório ficam na gestão de ativos, se ficarem. Estas são as
                classes que quase toda CMDB útil tem.
              </p>
            </div>
            <div className="grid-3">
              {CLASSES.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CMDB NO ITIL E NO ITSM */}
        <section className="section" id="cmdb-itsm-itil">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Onde ela trabalha</p>
              <h2>CMDB no ITIL 4 e no ITSM</h2>
              <p className="section-head__sub">
                No ITIL 4, a CMDB sustenta a prática de gestão de configuração
                de serviço: manter informação confiável sobre os itens e as
                relações entre eles, onde e quando ela for necessária. No dia a
                dia do <a href="/o-que-e-itsm">ITSM</a>, isso aparece em quatro
                processos. É aqui que se vê se a CMDB está viva: se ninguém a
                consulta nesses momentos, ela já está morrendo.
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
            <p className="section-head__sub" style={{ marginTop: 24 }}>
              Quem atende o usuário nessa hora é o{" "}
              <a href="/service-desk">service desk</a>, e o registro passa pelo{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>. A CMDB é
              o que dá contexto aos dois.
            </p>
          </div>
        </section>

        {/* CMDB x ITAM */}
        <section className="section section--soft" id="cmdb-x-ativos">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A confusão mais comum</p>
              <h2>CMDB x gestão de ativos (ITAM): qual é a diferença</h2>
              <p className="section-head__sub">
                As duas olham para os mesmos equipamentos, mas fazem perguntas
                diferentes. A gestão de ativos cuida do bem; a CMDB cuida do
                papel que ele tem num serviço. Uma alimenta a outra.
              </p>
            </div>
            <div className="ctable" role="table" aria-label="Comparativo gestão de ativos e CMDB">
              <div className="ctable__head" role="row">
                <span role="columnheader">Critério</span>
                <span role="columnheader">Gestão de ativos</span>
                <span role="columnheader" className="ctable__us">CMDB</span>
              </div>
              {CMDB_X_ITAM.map((r) => (
                <div className="ctable__row" role="row" key={r.crit}>
                  <span className="ctable__crit" role="cell">{r.crit}</span>
                  <span className="ctable__them" role="cell" data-label="Ativos">{r.itam}</span>
                  <span className="ctable__mine" role="cell">{r.cmdb}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IMPLANTACAO */}
        <section className="section" id="implantacao">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como implantar</p>
              <h2>Implantação de CMDB em seis passos</h2>
              <p className="section-head__sub">
                Um roteiro pensado para a CMDB continuar certa daqui a um ano,
                não só no dia da entrega.
              </p>
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

        {/* POR QUE MORRE */}
        <section className="section section--soft" id="cmdb-desatualizada">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">O que quase ninguém conta</p>
              <h2>Por que tanta CMDB fica desatualizada</h2>
              <p className="section-head__sub">
                A maior parte das CMDBs abandonadas não falhou por falta de
                ferramenta. Falhou por um destes quatro motivos, e cada passo
                do roteiro acima existe para evitar um deles.
              </p>
            </div>
            <div className="grid-3">
              {POR_QUE_MORRE.map((c) => (
                <div className="card" key={c.t}>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CRITERIOS */}
        <section className="section" id="ferramentas">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na hora de escolher</p>
              <h2>Seis critérios para escolher um software de CMDB</h2>
              <p className="section-head__sub">
                Ferramenta open source ou CMDB gratuita resolve o custo de
                licença, não o de manter a base. Se a descoberta, o vínculo com
                chamados e a atualização dependem de integração e de gente, o
                custo aparece depois. É a mesma conta que fazemos no comparativo
                com o <a href="/glpi">GLPI</a>; na ponta oposta, o{" "}
                <a href="/servicenow">ServiceNow</a> cobra a descoberta em
                módulo separado.
              </p>
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

        {/* COMO A SYSAID FAZ */}
        <section className="section section--dark" id="sysaid">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow" style={{ color: "var(--lime)" }}>
                Na plataforma
              </p>
              <h2>
                Como a SysAid faz CMDB:{" "}
                <span className="hl">na mesma base</span> do service desk
              </h2>
              <p className="section-head__sub">
                A CMDB da SysAid é parte da plataforma de ITSM, alimentada pela
                descoberta de rede e ligada aos chamados, aos ativos e às
                mudanças. O analista e o comitê de mudanças consultam a CMDB
                sem sair do fluxo, que é o que a mantém viva.
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
              Implantação e suporte em português pela SysAid Brasil.{" "}
              <a href="#demo" style={{ color: "var(--lime)" }}>
                Agende uma demonstração
              </a>{" "}
              para ver a descoberta e o grafo de relações rodando com um
              serviço da sua TI.
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
            <div className="badges" style={{ marginTop: 48 }}>
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
              <h2>O que perguntam sobre CMDB</h2>
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
            <h2>Veja uma CMDB que se atualiza sozinha</h2>
            <p className="form-final__sub">
              Demonstração sem compromisso. Mostramos a descoberta de rede, o
              grafo de relações e a análise de impacto de uma mudança, ligados
              ao chamado, na mesma plataforma.
            </p>
            <div className="form-final__box" id="form">
              <LeadForm variant="final" submitLabel="Agende uma demonstração" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/cmdb" />
    </>
  );
}
