import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import { datasDaPagina } from "@/lib/seo";
import { altCliente, altSelo } from "@/lib/marcas";

export const metadata: Metadata = {
  title: "Service Desk: o que é, o que faz, estrutura e indicadores | SysAid",
  description:
    "Service desk (central de serviços) é o ponto único de contato entre usuários e TI: o que faz, como funciona o atendimento, modelos, indicadores e como escolher o sistema de service desk.",
  alternates: { canonical: "/service-desk" },
  openGraph: {
    title: "Service Desk: o que é, o que faz, estrutura e indicadores",
    description:
      "A central de serviços de TI explicada: definição, fluxo do atendimento, modelos (interno, terceirizado, híbrido), indicadores com fórmula e critérios para escolher o sistema.",
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
    t: "Receber tudo que a TI precisa atender",
    d: "Incidente, dúvida, pedido de acesso, solicitação de equipamento. O service desk é a porta única: qualquer demanda para a tecnologia entra por ele, por portal, e-mail, Teams ou telefone, e passa a existir como registro.",
  },
  {
    n: "02",
    t: "Classificar e priorizar por critério",
    d: "Cada registro recebe categoria, impacto e urgência, e a matriz de prioridade decide o que é atendido primeiro. Prioridade deixa de ser quem gritou mais alto e passa a ser regra escrita.",
  },
  {
    n: "03",
    t: "Resolver ou encaminhar para quem resolve",
    d: "O que é comum se resolve no primeiro contato, com apoio da base de conhecimento. O que exige especialista é escalado para o time certo, sem o usuário ter que recontar a história.",
  },
  {
    n: "04",
    t: "Cumprir o prazo acordado",
    d: "Cada tipo de chamado tem SLA, contado em horário útil, com escalonamento automático e alerta antes do vencimento. O prazo é acompanhado pela ferramenta, não pela memória do analista.",
  },
  {
    n: "05",
    t: "Comunicar o usuário",
    d: "Quem abriu acompanha o andamento sozinho, pelo portal. Em indisponibilidade que afeta muita gente, o service desk avisa antes de o telefone tocar, e é isso que evita a enxurrada de chamados repetidos.",
  },
  {
    n: "06",
    t: "Gerar o dado que orienta a TI",
    d: "Volume por categoria, tempo médio de atendimento, cumprimento de SLA, reincidência e carga por analista. É o que mostra onde investir, o que automatizar e de quanta gente a operação precisa.",
  },
];

const DIFERENCAS = [
  {
    t: "Help desk: resolver o incidente",
    d: "O help desk é reativo e focado no usuário final. Alguma coisa parou de funcionar e o time restabelece o serviço o mais rápido possível. O escopo é o problema técnico pontual, e o sucesso se mede em chamado fechado e tempo de atendimento.",
  },
  {
    t: "Service desk: operar a TI como serviço",
    d: "O service desk engloba o help desk e vai além. Além de incidentes, trata requisições, mudanças, ativos, problemas recorrentes e a comunicação com o negócio. É o ponto único de contato para tudo que envolve a TI, alinhado às práticas da ITIL.",
  },
  {
    t: "Na prática, a diferença é de escopo",
    d: "Um help desk responde à pergunta 'minha máquina parou, e agora?'. Um service desk responde também a 'preciso de acesso ao sistema', 'vamos contratar dez pessoas mês que vem' e 'esse erro volta toda semana, por quê?'. Por isso a operação costuma começar como help desk e amadurecer para service desk.",
  },
];

const PROCESSOS = [
  {
    t: "Gestão de incidentes",
    d: "Restabelecer o serviço no menor tempo possível quando algo para. É o processo de maior volume e o que mais aparece no dia a dia do service desk.",
  },
  {
    t: "Gestão de requisições",
    d: "Atender pedidos previsíveis: acesso, licença, equipamento, instalação. Como são repetitivos, são os primeiros candidatos a catálogo de serviços e automação.",
  },
  {
    t: "Gestão de problemas",
    d: "Achar e eliminar a causa raiz do incidente que volta. É o processo que faz o volume de chamados cair em vez de só ser atendido mais rápido.",
  },
  {
    t: "Gestão de mudanças",
    d: "Avaliar, aprovar e registrar alterações no ambiente, para que a mudança planejada não vire o incidente de amanhã.",
  },
  {
    t: "Gestão de ativos e configuração",
    d: "Saber o que a empresa tem, onde está, com quem está e como se conecta. Sem inventário confiável, o atendimento começa toda vez com uma investigação.",
  },
  {
    t: "Gestão de nível de serviço",
    d: "Acordar prazos e qualidade com as áreas, medir o cumprimento e reportar. É o que transforma a percepção sobre a TI em número discutível.",
  },
];

const FLUXO = [
  {
    n: "01",
    t: "Entrada pelo canal",
    d: "O usuário abre a demanda pelo portal, e-mail, Teams, telefone ou chat. Seja qual for o canal, ela cai na mesma fila, com quem pediu, quando e o quê.",
  },
  {
    n: "02",
    t: "Registro e categorização",
    d: "O chamado ganha número, categoria (incidente ou requisição, e de qual serviço) e os dados que o analista vai precisar. Categoria bem escolhida é o que permite medir e automatizar depois.",
  },
  {
    n: "03",
    t: "Priorização por impacto e urgência",
    d: "Impacto é quanta gente ou quanto do negócio é afetado; urgência é quanto tempo dá para esperar. O cruzamento dos dois define a prioridade e, com ela, o prazo do SLA.",
  },
  {
    n: "04",
    t: "Resolução no primeiro contato ou escalonamento",
    d: "O analista do primeiro nível resolve o que está no escopo dele, com a base de conhecimento. O que exige especialista sobe para o segundo ou terceiro nível com o histórico completo.",
  },
  {
    n: "05",
    t: "Solução e confirmação com o usuário",
    d: "A solução é registrada e o usuário confirma que o problema acabou. Chamado fechado sem confirmação é o que mais gera reabertura.",
  },
  {
    n: "06",
    t: "Encerramento, pesquisa e conhecimento",
    d: "O chamado é encerrado, o usuário avalia o atendimento e a solução que funcionou vira artigo na base de conhecimento, para o próximo caso igual ser resolvido mais rápido ou pelo próprio usuário.",
  },
];

const MODELOS = [
  {
    t: "Centralizado",
    d: "Um único time atende a empresa inteira, de um lugar só. É o modelo mais comum e o mais fácil de padronizar e medir. Funciona bem enquanto o atendimento remoto resolve quase tudo.",
  },
  {
    t: "Local",
    d: "Cada unidade ou filial tem o próprio time de atendimento. Faz sentido quando há muito suporte presencial, idioma ou fuso diferente, mas custa mais e tende a gerar processos diferentes em cada lugar.",
  },
  {
    t: "Virtual",
    d: "O time está espalhado, mas trabalha na mesma ferramenta e na mesma fila, como se fosse um só. Para o usuário, a porta é única; para a TI, a carga se distribui entre pessoas em lugares diferentes.",
  },
  {
    t: "Follow the sun",
    d: "Times em fusos diferentes passam a fila de um para o outro ao fim do expediente, para o atendimento cobrir as 24 horas sem turno noturno. É modelo de empresa com operação em vários países.",
  },
];

const SOURCING = [
  {
    t: "Interno",
    d: "Time próprio, que conhece os sistemas e as pessoas da empresa. Dá mais controle e contexto, mas a empresa absorve sozinha a variação de volume, as férias e a rotatividade.",
  },
  {
    t: "Terceirizado",
    d: "Um fornecedor opera o atendimento, quase sempre o primeiro nível. Ganha escala e cobertura de horário. O que não se terceiriza: o dono do processo, o catálogo de serviços e a gestão do nível de serviço, que continuam sendo da TI da empresa.",
  },
  {
    t: "Híbrido",
    d: "O fornecedor faz o primeiro nível e o time interno fica com o segundo e o terceiro, ou com os serviços críticos. É o arranjo mais frequente em empresa média e grande, e só funciona com os dois lados na mesma ferramenta.",
  },
];

const INDICADORES = [
  {
    t: "Resolução no primeiro contato (FCR)",
    f: "chamados resolvidos no primeiro contato ÷ total de chamados × 100",
    d: "Mostra quanto o primeiro nível resolve sem escalar. Sobe com base de conhecimento boa e acesso às ferramentas certas.",
  },
  {
    t: "Tempo médio de primeira resposta",
    f: "soma dos tempos até a primeira resposta ÷ número de chamados",
    d: "É o que o usuário sente primeiro. Resposta automática não conta: o relógio para quando uma pessoa ou a IA trata o pedido de fato.",
  },
  {
    t: "Tempo médio de resolução (MTTR)",
    f: "soma dos tempos de abertura até a solução ÷ chamados resolvidos",
    d: "Leia por prioridade e por categoria. A média geral esconde o incidente crítico que demorou um dia inteiro.",
  },
  {
    t: "Cumprimento de SLA",
    f: "chamados resolvidos dentro do prazo ÷ chamados resolvidos × 100",
    d: "É o número que se reporta às áreas. Conte em horário útil, como o SLA foi acordado, e separe por tipo de chamado.",
  },
  {
    t: "Backlog e idade do backlog",
    f: "chamados em aberto no fim do período, e há quantos dias cada um está aberto",
    d: "Fila que cresce semana a semana indica falta de gente ou de automação. Chamado muito antigo indica dono indefinido.",
  },
  {
    t: "Taxa de reabertura",
    f: "chamados reabertos ÷ chamados encerrados × 100",
    d: "Mede se o que foi fechado estava resolvido de verdade. Reabertura alta costuma andar junto com FCR alto demais.",
  },
  {
    t: "Satisfação do usuário (CSAT)",
    f: "respostas positivas ÷ respostas da pesquisa × 100",
    d: "Pesquisa curta, enviada no encerramento. Comentário negativo vale mais do que a nota: é onde aparece o processo quebrado.",
  },
  {
    t: "Custo por chamado",
    f: "custo total da operação no período ÷ chamados atendidos no período",
    d: "Inclui pessoas, ferramenta e infraestrutura. É o número que justifica automação e autoatendimento: cada chamado evitado tem preço.",
  },
];

const PASSOS = [
  {
    n: "01",
    t: "Defina o catálogo mínimo",
    d: "Liste os serviços que a TI entrega e os pedidos mais comuns de cada um. Começar com 15 a 30 itens bem descritos vale mais do que um catálogo enorme que ninguém mantém.",
  },
  {
    n: "02",
    t: "Faça todos os canais caírem numa fila",
    d: "Portal, e-mail, Teams e telefone abrindo chamado no mesmo lugar. Enquanto existir pedido por mensagem direta para o analista, a operação não é medida inteira.",
  },
  {
    n: "03",
    t: "Escreva categorias e matriz de prioridade",
    d: "Poucas categorias, que o analista escolhe sem dúvida, e uma matriz de impacto por urgência que todo mundo entende. É o que torna o relatório confiável.",
  },
  {
    n: "04",
    t: "Acorde SLA e caminhos de escalonamento",
    d: "Prazo por prioridade e por tipo de pedido, combinado com as áreas, e quem recebe o chamado quando o primeiro nível não resolve. Com alerta antes de vencer, não depois.",
  },
  {
    n: "05",
    t: "Monte a base de conhecimento e o autoatendimento",
    d: "Cada solução repetida vira artigo, e os pedidos previsíveis viram formulário no portal com aprovação automática. A partir daí, meça com os indicadores acima e ajuste mês a mês.",
  },
];

const CRITERIOS = [
  {
    t: "Ponto único de contato de verdade",
    d: "Portal, e-mail, Teams e WhatsApp caindo na mesma fila. Se cada canal vira uma caixa separada, a ferramenta não entregou o básico do conceito.",
  },
  {
    t: "Catálogo de serviços e automação",
    d: "Pedido repetitivo tem que ter fluxo próprio e aprovação automática. O que não for automatizado vai consumir analista para sempre.",
  },
  {
    t: "Inteligência artificial que resolve, não só sugere",
    d: "A diferença entre uma IA que escreve rascunho de resposta e uma que executa a solicitação inteira sozinha aparece direto no volume que chega ao time.",
  },
  {
    t: "Gestão de ativos na mesma base",
    d: "Chamado e ativo separados em dois sistemas obrigam o analista a procurar em dois lugares e impedem qualquer análise de reincidência por equipamento.",
  },
  {
    t: "Relatório pronto, não exportação",
    d: "SLA, volume por categoria e carga por analista precisam estar em painel. Operação que depende de planilha montada na mão não acompanha, só justifica depois.",
  },
  {
    t: "Custo total, não preço de licença",
    d: "Servidor, atualização de versão, compatibilidade de plugin e as horas da própria equipe mantendo a ferramenta de pé são custo real. Ferramenta gratuita costuma cobrar em hora de time.",
  },
];

const FAQ = [
  {
    q: "O que é service desk?",
    a: "Service desk é o ponto único de contato entre os usuários e a área de TI. É por ele que entram todos os incidentes, dúvidas, requisições e solicitações de mudança, que passam a ser registrados, classificados, priorizados e acompanhados com prazo acordado. O conceito vem da ITIL e descreve tanto o time quanto o processo e a ferramenta que sustentam esse atendimento. Na prática, é o que transforma o atendimento da TI em operação medida, em vez de uma sequência de pedidos avulsos.",
  },
  {
    q: "O que faz um service desk?",
    a: "Um service desk recebe e registra as demandas dirigidas à TI, classifica cada uma por categoria, impacto e urgência, resolve no primeiro contato o que for possível, escala ao especialista o que exigir, acompanha o cumprimento dos prazos (SLA), comunica o usuário sobre o andamento e sobre indisponibilidades, e gera os indicadores da operação. Além do atendimento, participa dos processos de requisição, problema, mudança e gestão de ativos.",
  },
  {
    q: "Qual a diferença entre help desk e service desk?",
    a: "A diferença é de escopo. O help desk é reativo e focado em restabelecer o serviço quando algo para de funcionar para o usuário final. O service desk engloba o help desk e cobre também requisições, mudanças, problemas recorrentes, gestão de ativos e a comunicação com o negócio, funcionando como ponto único de contato para tudo que envolve a TI. Em geral a operação começa como help desk e amadurece para service desk conforme a empresa cresce.",
  },
  {
    q: "O que faz um analista de service desk?",
    a: "O analista de service desk é quem atende o usuário no primeiro nível: registra o chamado, faz o diagnóstico inicial, resolve o que está no escopo dele com apoio da base de conhecimento e escala ao time especialista o que não está. Também acompanha o prazo dos chamados sob sua responsabilidade, mantém o usuário informado e alimenta a base de conhecimento com as soluções que funcionaram. É uma função que combina conhecimento técnico com comunicação, porque boa parte do trabalho é traduzir o problema do usuário em informação útil para quem vai resolver.",
  },
  {
    q: "Service desk é a mesma coisa que ITSM?",
    a: "Não. ITSM (gestão de serviços de TI) é a disciplina inteira, que define como a TI entrega valor ao negócio na forma de serviços. O service desk é a função dentro dessa disciplina que faz o contato com o usuário e coordena o atendimento. Todo service desk faz parte de uma estratégia de ITSM, mas ITSM envolve muito mais do que o atendimento, incluindo desenho de serviço, capacidade, continuidade e melhoria contínua.",
  },
  {
    q: "Preciso seguir a ITIL para ter um service desk?",
    a: "Não é obrigatório. A ITIL é uma biblioteca de boas práticas, não uma norma de cumprimento obrigatório. Ela é útil porque dá vocabulário comum e um caminho já testado, mas a adoção é gradual e adaptada ao tamanho da operação. A maioria das empresas começa por gestão de incidentes e requisições, que é onde está o volume, e incorpora os outros processos conforme a necessidade aparece.",
  },
  {
    q: "Qual sistema de service desk escolher?",
    a: "Os critérios que mais pesam são: canais de abertura caindo em fila única, catálogo de serviços com automação para os pedidos repetitivos, gestão de ativos na mesma base do chamado, SLA com escalonamento automático, relatórios prontos em painel e inteligência artificial capaz de resolver solicitações sozinha, não apenas sugerir texto. Vale avaliar também o custo total de operação, que inclui infraestrutura, atualização e as horas da própria equipe mantendo a ferramenta, e não só o preço da licença.",
  },
  {
    q: "O que é central de serviços na ITIL?",
    a: "Central de serviços é o nome que a ITIL 4 em português dá à prática de service desk: o ponto único de contato entre o provedor de serviços de TI e os usuários. Ela capta a demanda, registra, resolve o que é possível no primeiro contato, encaminha o resto para os times especialistas e mantém o usuário informado. Na ITIL 4, a central de serviços é uma das práticas de gerenciamento de serviço, ao lado de gestão de incidentes, de requisições, de problemas e de mudanças.",
  },
  {
    q: "Quais indicadores medir no service desk?",
    a: "Os mais usados são: resolução no primeiro contato (FCR), tempo médio de primeira resposta, tempo médio de resolução (MTTR), cumprimento de SLA, tamanho e idade do backlog, taxa de reabertura, satisfação do usuário (CSAT) e custo por chamado. Mais do que o valor absoluto, vale acompanhar a tendência mês a mês e abrir cada número por prioridade e por categoria, porque a média geral esconde os casos que mais incomodam o negócio.",
  },
  {
    q: "Vale a pena terceirizar o service desk?",
    a: "Depende do volume, do horário de cobertura e da maturidade da operação. Terceirizar o primeiro nível costuma fazer sentido quando o volume oscila muito ou quando é preciso atender fora do horário comercial. O que não se terceiriza é a gestão: o dono do processo, o catálogo de serviços e o acompanhamento do nível de serviço continuam sendo responsabilidade da TI da empresa. O modelo híbrido, com o fornecedor no primeiro nível e o time interno no segundo e no terceiro, é o mais comum, e exige que os dois lados trabalhem no mesmo sistema de service desk.",
  },
  {
    q: "Qual a diferença entre service desk e central de atendimento ao cliente?",
    a: "O service desk atende os usuários da própria empresa nas demandas de tecnologia: o colaborador que perdeu acesso, precisa de um equipamento ou encontrou um sistema fora do ar. A central de atendimento ao cliente (SAC) atende quem compra da empresa, sobre produto, pedido ou cobrança. As duas usam ideias parecidas, como fila, prazo e base de conhecimento, mas o público, os processos e as ferramentas são diferentes.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  ...datasDaPagina("/service-desk"),
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Service Desk: o que é, o que faz, estrutura e indicadores",
  description:
    "Definição de service desk (central de serviços), o que a função faz, como funciona o atendimento, modelos de estrutura, indicadores com fórmula, como montar em cinco passos e os critérios para escolher o sistema.",
  inLanguage: "pt-BR",
  // Aponta pro Organization declarado no layout (@id) em vez de repetir a entidade.
  author: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  publisher: { "@type": "Organization", "@id": "https://itsm.sysaid.com.br/#organization", name: "SysAid Brasil" },
  mainEntityOfPage: "https://itsm.sysaid.com.br/service-desk",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SysAid Brasil", item: "https://itsm.sysaid.com.br/" },
    { "@type": "ListItem", position: 2, name: "O que é ITSM", item: "https://itsm.sysaid.com.br/o-que-e-itsm" },
    { "@type": "ListItem", position: 3, name: "Service Desk", item: "https://itsm.sysaid.com.br/service-desk" },
  ],
};

export default function ServiceDeskPage() {
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
        {/* HERO INFORMACIONAL — a busca por "service desk" é de entendimento, form só no fim */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__glow" />
          </div>
          <div className="container container--narrow hero__inner">
            <p className="eyebrow">Guia · Service Desk</p>
            <h1>
              Service desk: o <span className="hl">ponto único de contato</span>{" "}
              entre o usuário e a TI
            </h1>
            <p className="hero__sub">
              Service desk é a função que recebe tudo que a empresa precisa da
              tecnologia (incidente, dúvida, pedido de acesso, solicitação de
              mudança) e transforma cada demanda em registro com categoria,
              responsável, prioridade e prazo. Neste guia: o que é, o que faz na
              prática, como funciona o atendimento, os modelos de estrutura, os
              indicadores que valem a pena medir e como escolher o sistema de
              service desk.
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
              <h2>O que é service desk</h2>
            </div>
            <p className="section-head__sub">
              <strong>Service desk, ou central de serviços, é o ponto único de
              contato entre os usuários e a área de TI.</strong> &ldquo;Central de
              serviços&rdquo; é o nome que a ITIL 4 em português dá à prática. Em vez de o pedido chegar por e-mail para um analista,
              mensagem para outro e conversa de corredor com um terceiro, tudo
              entra por um mesmo canal e vira um registro rastreável. O termo
              vem da ITIL e descreve ao mesmo tempo o time, o processo e a
              ferramenta que sustentam esse atendimento. A consequência prática
              é que a TI passa a saber quantos pedidos existem, quem está
              atendendo o quê, quanto tempo cada coisa leva e o que se repete.
              É esse conjunto de respostas que separa uma operação medida de
              uma operação que só reage. O alicerce técnico dessa função é o{" "}
              <a href="/sistema-de-chamados">sistema de chamados</a>, e a
              disciplina maior que a organiza é a{" "}
              <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>.
              Quando o mesmo modelo de atendimento é levado além da TI, para
              RH, Facilities e Financeiro, ele passa a se chamar{" "}
              <a href="/esm">ESM</a>.
            </p>
          </div>
        </section>

        {/* O QUE FAZ */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Na prática</p>
              <h2>O que faz um service desk</h2>
              <p className="section-head__sub">
                Um service desk recebe e registra tudo que chega para a TI,
                classifica e prioriza cada demanda, resolve ou encaminha para
                quem resolve, controla o prazo (SLA), mantém o usuário
                informado e gera os indicadores da operação. Não se resume a
                atender telefone: são seis responsabilidades encadeadas, e é a
                última delas que costuma faltar nas operações que nunca saem do
                modo apagar incêndio.
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

        {/* FLUXO DO ATENDIMENTO */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Passo a passo</p>
              <h2>Como funciona o atendimento no service desk</h2>
              <p className="section-head__sub">
                Todo chamado percorre o mesmo caminho, da entrada ao
                encerramento. O fluxo abaixo vale tanto para incidente quanto
                para requisição; o que muda é a categoria, a prioridade e quem
                resolve.
              </p>
            </div>
            <div className="grid-3">
              {FLUXO.map((f) => (
                <div className="step" key={f.n}>
                  <span className="step__n">{f.n}</span>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
            <p className="section-head__sub" style={{ marginTop: "2rem" }}>
              O service desk é o primeiro nível de atendimento. O segundo e o
              terceiro níveis ficam com os times especialistas (infraestrutura,
              sistemas, fornecedores), e a divisão entre N1, N2 e N3 está
              detalhada no guia de <a href="/help-desk">help desk</a>.
            </p>
          </div>
        </section>

        {/* HELP DESK x SERVICE DESK */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A confusão mais comum</p>
              <h2>Help desk e service desk não são sinônimos</h2>
              <p className="section-head__sub">
                Os dois termos aparecem trocados o tempo todo, inclusive em
                material de fornecedor. A diferença é de escopo, e ela importa
                na hora de escolher ferramenta: quem compra pensando em help
                desk costuma trocar de sistema dois anos depois. O lado do
                help desk está no guia{" "}
                <a href="/help-desk">o que é help desk</a>.
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

        {/* PROCESSOS ITIL */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Os processos</p>
              <h2>O que sustenta um service desk por trás do atendimento</h2>
              <p className="section-head__sub">
                A ITIL organiza a operação em processos. Ninguém implanta todos
                de uma vez: a maioria das empresas começa por incidentes e
                requisições, que é onde está o volume, e incorpora o resto
                conforme a dor aparece.
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

        {/* ESTRUTURA E MODELOS */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como se organiza</p>
              <h2>Estrutura e modelos de service desk</h2>
              <p className="section-head__sub">
                Não existe um desenho único. A estrutura depende de onde estão
                os usuários, de quanto suporte precisa ser presencial e do
                horário que a operação tem que cobrir. Os quatro modelos
                clássicos:
              </p>
            </div>
            <div className="grid-2">
              {MODELOS.map((m) => (
                <div className="card" key={m.t}>
                  <h3>{m.t}</h3>
                  <p>{m.d}</p>
                </div>
              ))}
            </div>
            <div className="section-head" style={{ marginTop: "3rem" }}>
              <h3>Interno, terceirizado ou híbrido</h3>
              <p className="section-head__sub">
                A outra decisão é quem opera. Contratar um serviço de service
                desk resolve escala e horário, mas não tira da TI a
                responsabilidade pelo resultado.
              </p>
            </div>
            <div className="grid-3">
              {SOURCING.map((m) => (
                <div className="card" key={m.t}>
                  <h3>{m.t}</h3>
                  <p>{m.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDICADORES */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Como se mede</p>
              <h2>Indicadores de service desk: o que medir e como calcular</h2>
              <p className="section-head__sub">
                Não há número certo que sirva para toda empresa: o que importa é
                medir sempre do mesmo jeito, abrir por prioridade e por
                categoria e acompanhar a tendência. Estes são os oito
                indicadores que mais ajudam a decidir.
              </p>
            </div>
            <div className="grid-2">
              {INDICADORES.map((i) => (
                <div className="card" key={i.t}>
                  <h3>{i.t}</h3>
                  <p style={{ marginBottom: "0.75rem" }}>
                    <em>{i.f}</em>
                  </p>
                  <p>{i.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO MONTAR */}
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Do zero ou reestruturando</p>
              <h2>Como montar um service desk em cinco passos</h2>
              <p className="section-head__sub">
                A ordem importa: ferramenta sem catálogo e sem regra de
                prioridade só organiza a bagunça em outro lugar. O alicerce é um{" "}
                <a href="/sistema-de-chamados">sistema de chamados</a> bem
                configurado; o caminho maior é a{" "}
                <a href="/gestao-de-servicos-de-ti">gestão de serviços de TI</a>.
              </p>
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
                Durante trinta anos, melhorar um service desk significou atender
                mais rápido. Com inteligência artificial nativa, passou a
                significar atender menos: o SysAid Copilot entende a
                solicitação, responde o usuário e executa a resolução dos casos
                comuns sozinho, antes de o chamado chegar a uma pessoa.
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
              <h2>Seis critérios para escolher um sistema de service desk</h2>
              <p className="section-head__sub">
                Software de service desk existe de todo tamanho e preço. Os
                critérios abaixo separam o sistema que sustenta a operação do
                que só registra chamado. Quem está comparando com plataformas
                maiores encontra a análise no guia sobre{" "}
                <a href="/servicenow">ServiceNow</a>.
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

        {/* FAQ */}
        <section className="section">
          <div className="container container--narrow">
            <div className="section-head">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2>O que perguntam sobre service desk</h2>
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
            <h2>Veja um service desk com IA rodando na sua operação</h2>
            <p className="form-final__sub">
              Teste grátis, sem compromisso. Mostramos a plataforma com a fila,
              o catálogo de serviços, os SLAs e os relatórios da sua operação.
            </p>
            <div className="form-final__box">
              <LeadForm variant="final" submitLabel="Testar grátis" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter atual="/service-desk" />
    </>
  );
}
