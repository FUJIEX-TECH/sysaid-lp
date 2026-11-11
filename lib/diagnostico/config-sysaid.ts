// ==========================================================================
// Diagnóstico ITSM — CONFIGURAÇÃO DA SYSAID pro motor genérico (lib/conversa-core).
// Dono: sysaid-growth (conteúdo, perguntas, pesos, textos, catálogo, tema).
// Fonte: clientes/sysaid/formulario-inteligente/diagnostico-itsm-plano.html
// (seções 1 a 5), 17/10/2026. Refatorado em 30/10/2026 (Severino): o que era
// código em fluxo.ts/pontuacao.ts virou dados aqui; o motor não sabe nada de
// SysAid. Onde o plano usa Jev (dor ao vivo, palpite) ou LLM (pergunta gerada),
// esta configuração usa a pergunta padrão de fallback.
//
// Três camadas:
//   genérico      = lib/conversa-core (motor, condicionais, pontuação, Jev, UI)
//   configurável  = este arquivo (tudo que muda de cliente pra cliente)
//   sob medida    = CenaPlaceholder (cena da central de TI), persistencia.ts
//                   (gravação na /api/lead da LP) e o validador de e-mail
//                   corporativo (lib/email-domains da LP)
// ==========================================================================

import type { ConfigConversa, Contexto, Opcao, OrigemRegra } from "@/lib/conversa-core";
import { sugerirEmpresa, sugerirNome, primeiroNome } from "@/lib/conversa-core";
import { isCorporateEmail } from "@/lib/email-domains";
import CenaPlaceholder from "@/components/diagnostico/CenaPlaceholder";

// Valores possíveis (documentação; o motor trata tudo como string)
// situacao:  troca | sem | cliente | pesquisa
// dor:       sla | perda | relatorio | automacao | ativos | ia | custo | esm | vaga
// usuarios:  50 | 200 | 1000 | mais
// tecnicos:  1-2 | 3-10 | +10
// papel:     decide | influencia | levanta | estuda
// prazo:     tri | 6m | sem | cota

export const LINK_SUPORTE = "https://www.sysaid.com/support";

// --------------------------------------------------------------------------
// Catálogos
// --------------------------------------------------------------------------
const FERRAMENTAS: Opcao[] = [
  { valor: "glpi", rotulo: "GLPI" },
  { valor: "movidesk", rotulo: "Movidesk" },
  { valor: "topdesk", rotulo: "TopDesk" },
  { valor: "freshdesk", rotulo: "Freshdesk" },
  { valor: "freshservice", rotulo: "Freshservice" },
  { valor: "zendesk", rotulo: "Zendesk" },
  { valor: "jira", rotulo: "Jira Service Management" },
  { valor: "servicenow", rotulo: "ServiceNow" },
  { valor: "qualitor", rotulo: "Qualitor" },
  { valor: "citsmart", rotulo: "CITSmart" },
  { valor: "planilha", rotulo: "Planilha ou e-mail" },
  { valor: "outra", rotulo: "Outra" },
];

const DORES: Opcao[] = [
  { valor: "sla", rotulo: "SLA estoura sem ninguém ver" },
  { valor: "perda", rotulo: "Chamados se perdem" },
  { valor: "relatorio", rotulo: "Sem relatório pra gestão" },
  { valor: "automacao", rotulo: "Tudo manual, sem automação" },
  { valor: "ativos", rotulo: "Ativos sem controle" },
  { valor: "ia", rotulo: "Quero IA no atendimento" },
  { valor: "custo", rotulo: "Custo ou licença" },
  { valor: "esm", rotulo: "Outros departamentos (RH, facilities)" },
  { valor: "vaga", rotulo: "Nenhuma dessas / não sei dizer" },
];

// as 4 dores mais comuns por origem vêm primeiro (plano, nó 4); o resto atrás de "Mais opções"
function doresOrdenadas(primeiras: string[]): Opcao[] {
  const p = primeiras.map((v) => DORES.find((d) => d.valor === v)!);
  return [...p, ...DORES.filter((d) => !primeiras.includes(d.valor))];
}

// pergunta fixa de aprofundamento por dor (fallback da pergunta gerada, nó 4)
const APROFUNDAMENTO: Record<string, { texto: string; opcoes: string[] }> = {
  sla: { texto: "Quando um chamado está pra estourar, o que acontece hoje?", opcoes: ["Ninguém é avisado", "O técnico vê, mas não escala", "Existe escalonamento, mas por e-mail"] },
  perda: { texto: "Por onde o pedido chega hoje?", opcoes: ["WhatsApp e corredor", "E-mail", "Ferramenta, mas sem fila clara"] },
  relatorio: { texto: "O que o gestor te pede e você não consegue tirar?", opcoes: ["Tempo de resposta por equipe", "Volume por tipo de chamado", "Custo por chamado"] },
  automacao: { texto: "Qual rotina mais rouba tempo?", opcoes: ["Aprovação de acesso", "Onboarding de funcionário", "Reset de senha"] },
  ativos: { texto: "O que você precisa saber e hoje não sabe?", opcoes: ["Quem está com qual máquina", "Licenças vencendo", "Histórico de cada equipamento"] },
  ia: { texto: "Onde a IA ajudaria primeiro?", opcoes: ["Responder dúvidas repetidas", "Classificar e rotear", "Resolver sozinha o simples"] },
  custo: { texto: "O que mais pesa no custo hoje?", opcoes: ["Cobrança por técnico", "Módulos cobrados à parte", "Cobrança em dólar"] },
  esm: { texto: "Qual área quer atender além da TI?", opcoes: ["RH", "Facilities", "Jurídico ou financeiro"] },
};

const aprofundamentoVariantes = Object.fromEntries(
  Object.entries(APROFUNDAMENTO).map(([dor, a]) => [
    dor,
    {
      texto: a.texto,
      opcoes: [...a.opcoes.map((o, i) => ({ valor: "abc"[i], rotulo: o })), { valor: "outro", rotulo: "Outro" }],
    },
  ])
);

// --------------------------------------------------------------------------
// Variáveis derivadas (usadas nos templates como {{nome}})
// --------------------------------------------------------------------------
function rotuloFerramenta(ctx: Contexto): string {
  const r = ctx.respostas;
  if (!r.ferramenta) return "";
  if (r.ferramenta === "outra") return (r.ferramenta_outra ?? "").trim() || "outra ferramenta";
  return FERRAMENTAS.find((f) => f.valor === r.ferramenta)?.rotulo ?? r.ferramenta;
}

function nomeAtual(ctx: Contexto): string {
  const r = ctx.respostas;
  if (r.situacao === "sem" || r.ferramenta === "planilha") return "e-mail e planilha";
  if (ctx.variaveis.concorrente && (r.situacao === "troca" || !r.situacao)) return `${ctx.variaveis.concorrente} hoje`;
  const f = rotuloFerramenta(ctx);
  return f ? `${f} hoje` : "hoje";
}

// v2: o nó "onde você está" do mapa (precisa fazer sentido sozinho)
function atualNoMapa(ctx: Contexto): string {
  const r = ctx.respostas;
  if (r.situacao === "cliente") return "SysAid hoje";
  if (r.situacao === "sem" || r.ferramenta === "planilha") return "E-mail, planilha e WhatsApp";
  if (r.situacao === "pesquisa") return "Pesquisando ITSM";
  if (ctx.variaveis.concorrente && (r.situacao === "troca" || !r.situacao)) return `${ctx.variaveis.concorrente} hoje`;
  const f = rotuloFerramenta(ctx);
  return f ? `${f} hoje` : "Sua central de TI";
}

// v2: de onde a pessoa veio → origem + variáveis (concorrente, intenção, canal).
// Mecanismo genérico (lib/conversa-core/origem.ts); o mapa campanha → contexto é daqui.
const CONCORRENTES: [string, string][] = [
  ["movidesk", "Movidesk"],
  ["topdesk", "TopDesk"],
  ["freshdesk", "Freshdesk"],
  ["freshservice", "Freshservice"],
  ["glpi", "GLPI"],
  ["jira", "Jira Service Management"],
  ["zendesk", "Zendesk"],
  ["servicenow", "ServiceNow"],
];

const ORIGENS_REGRAS: OrigemRegra[] = [
  // comparativa: página /movidesk, página de entrada, ?de=movidesk, termo/anúncio/campanha com o nome, ou veio da comparativa
  ...CONCORRENTES.map(
    ([slug, nome]): OrigemRegra => ({
      id: `comp-${slug}`,
      quando: {
        alguma: [
          { caminho: slug },
          { entrada: slug },
          { parametro: { de: slug } },
          { utm_term: { contem: slug } },
          { utm_content: { contem: slug } },
          { utm_campaign: { contem: slug } },
          { referrer: { contem: `/${slug}` } },
        ],
      },
      origem: "comparativa",
      variaveis: { concorrente: nome, slug },
    })
  ),
  // marca: campanha Brand ou termo com "sysaid" (quem já conhece; muitas vezes cliente querendo suporte)
  { id: "brand", quando: { alguma: [{ utm_campaign: { contem: "brand" } }, { utm_term: { contem: ["sysaid", "sys aid"] } }] }, origem: "brand", variaveis: { canal: "busca pela SysAid" } },
  // qualquer outro clique pago (Conquista genérica, ITSM, ESM): origem genérica
  { id: "paga", quando: { alguma: [{ gclid: true }, { utm_medium: { contem: ["cpc", "paid", "ppc"] } }] }, origem: "generica" },
  // intenção lida no termo comprado
  { id: "preco", modo: "acrescentar", quando: { utm_term: { contem: ["preço", "preco", "valor", "custo", "quanto custa", "licença", "licenca", "plano"] } }, variaveis: { intencao: "preco" } },
  { id: "troca", modo: "acrescentar", quando: { utm_term: { contem: ["migrar", "migração", "migracao", "alternativa", "substituir", "trocar", "sair do"] } }, variaveis: { intencao: "troca" } },
  // canal, pro resumo e pra ficha
  { id: "canal-google", modo: "acrescentar", quando: { alguma: [{ gclid: true }, { utm_source: { contem: "google" } }] }, variaveis: { canal: "anúncio no Google" } },
  { id: "canal-linkedin", modo: "acrescentar", quando: { utm_source: { contem: "linkedin" } }, variaveis: { canal: "LinkedIn" } },
  { id: "canal-meta", modo: "acrescentar", quando: { utm_source: { contem: ["facebook", "instagram", "meta"] } }, variaveis: { canal: "Instagram ou Facebook" } },
  { id: "canal-chatgpt", modo: "acrescentar", quando: { alguma: [{ utm_source: { contem: ["chatgpt", "openai"] } }, { referrer: { contem: "chatgpt.com" } }] }, variaveis: { canal: "ChatGPT" } },
  { id: "canal-organico", modo: "acrescentar", quando: { semCampanha: true, referrer: { contem: ["google.", "bing.", "duckduckgo."] } }, variaveis: { canal: "busca orgânica" } },
  { id: "canal-direto", modo: "acrescentar", quando: { semCampanha: true, referrer: "" }, variaveis: { canal: "acesso direto" } },
];

// --------------------------------------------------------------------------
// A configuração
// --------------------------------------------------------------------------
const NAO_SUPORTE = { campo: "cliente_tipo", diferente: "suporte" } as const;

// chips da situação (SPIN-S, 11/11/2026): o valor é a frase que vai pro Jev/LLM e
// pro registro; a `situacao` (troca | sem | cliente | pesquisa) sai do chip pelo
// aoResponder da etapa situacao_texto. Texto livre não define `situacao`: o passo
// "situacao" pergunta por chips só nesse caso.
// 11/11/2026 (sysaid-growth): todo chip que não é "cliente" nem "só pesquisando"
// diz o que incomoda (SLA, chamado perdido, relatório, custo), pra o Jev ter dor
// e a implicação sempre aparecer. O texto do chip é o mesmo que a pessoa vê no
// balão dela: nada de dor inventada no valor.
const SITUACAO_CHIP = {
  sem: "Chega por e-mail e WhatsApp, e às vezes se perde",
  sem_comp: "Ainda avaliando. Hoje é e-mail e planilha",
  troca: "Temos ferramenta, mas o SLA estoura sem ninguém ver",
  troca_comp_sla: "Usamos, mas o SLA estoura sem ninguém ver",
  troca_comp_rel: "Usamos, mas o gestor não tem os números que pede",
  troca_comp_custo: "Usamos, e a conta sobe a cada técnico novo",
  troca_brand: "Temos outra ferramenta, mas ela não dá conta do SLA",
  cliente: "Já usamos a SysAid",
  pesquisa: "Só estou pesquisando o assunto",
  pesquisa_comp: "Só estou comparando",
};
const chip = (k: keyof typeof SITUACAO_CHIP) => ({ valor: SITUACAO_CHIP[k], rotulo: SITUACAO_CHIP[k] });

// --------------------------------------------------------------------------
// Aparência (configurável): modo + tema + logo. O núcleo só conhece --cv-* e
// o data-modo; tudo que é SysAid (cores da LP, logo, fontes) mora aqui.
// --------------------------------------------------------------------------
// Qual modo vai pro ar. "escuro" desde 11/11/2026 (pedido do Fernando); o claro
// continua pronto: trocar esta constante basta (tela, widget ?v=chat, esqueleto
// e theme-color da página seguem).
export const MODO_SYSAID: "claro" | "escuro" = "escuro";

// Tema claro: tokens da LP (globals.css): verde #175d4a, menta #6bd9b9, lima, tinta
const TEMA_CLARO: Record<string, string> = {
  "--cv-bg": "var(--bg-soft)",
  "--cv-ink": "var(--ink)",
  "--cv-ink-700": "var(--ink-700)",
  "--cv-ink-400": "var(--ink-400)",
  "--cv-primary": "var(--green-700)",
  "--cv-primary-hover": "#12503f",
  "--cv-accent": "var(--green-400)",
  "--cv-focus": "var(--lime)",
  "--cv-line": "var(--line)",
  "--cv-borda": "rgba(107, 217, 185, 0.35)",
  "--cv-input-borda": "#d4ddd8",
  "--cv-mais-borda": "#b9c6c0",
  "--cv-sombra": "var(--shadow-lg)",
  "--cv-sombra-botao": "var(--shadow)",
  "--cv-font": "var(--font-sans)",
  // v2 (tela cheia e gráficos)
  "--cv-font-titulo": "var(--font-serif)",
  "--cv-primary-tinta": "var(--green-100)",
  "--cv-line-forte": "#c3d0c9",
  // estilo chat (11/11/2026): as mesmas formas do escuro, com o balão do bot branco
  "--cv-radius-balao": "18px",
  "--cv-radius-campo": "999px",
  "--cv-radius-chip": "999px",
  "--cv-radius-cartao": "14px",
  "--cv-bot-bg": "#fff",
  "--cv-bot-filete": "transparent",
  "--cv-bot-pad": "11px 15px",
  "--cv-bot-max": "88%",
};

// Tema escuro (11/11/2026, direção do Fernando): console de infraestrutura, não
// "cara de IA". Fundo quase preto com tinta de verde e grade fina de 1 px,
// rótulos e números em mono (IBM Plex Mono, --font-mono da LP), abertura em
// Besley itálica como na LP, menta da marca só onde orienta (barra de
// progresso, botão principal, resposta da pessoa, nó "o que resolve", equipe no
// porte), lima só no foco do teclado. Contraste conferido (WCAG AA): tinta
// #e8ede9 16:1 e #b9c2bc 10,6:1 sobre o fundo, #939d97 6,5:1 sobre a
// superfície (rótulos pequenos), menta 11:1 sobre o fundo e o fundo 11:1 sobre
// a menta (botão), borda dos campos #5f6663 3:1.
const TEMA_ESCURO: Record<string, string> = {
  "--cv-bg": "#0b0f0d",
  "--cv-superficie": "#111714",
  "--cv-superficie-2": "#0e1311",
  "--cv-ink": "#e8ede9",
  "--cv-ink-700": "#b9c2bc",
  "--cv-ink-400": "#939d97",
  "--cv-primary": "var(--green-400)",
  "--cv-primary-hover": "#8ae4ca",
  "--cv-primary-contrast": "#0b0f0d",
  "--cv-primary-tinta": "rgba(107, 217, 185, 0.1)",
  "--cv-accent": "var(--green-400)",
  "--cv-focus": "var(--lime)",
  "--cv-line": "rgba(255, 255, 255, 0.09)",
  "--cv-line-forte": "rgba(255, 255, 255, 0.2)",
  "--cv-input-borda": "#5f6663",
  "--cv-mais-borda": "rgba(255, 255, 255, 0.28)",
  "--cv-erro": "#ff8a80",
  // a resposta da pessoa: balão na cor de acento (verde da marca), à direita
  "--cv-eu-bg": "#175d4a",
  "--cv-eu-ink": "#f1f8f4",
  "--cv-eu-borda": "transparent",
  "--cv-eu-hover": "#1c6f59",
  // opções: neutras; a menta só entra no hover/foco
  "--cv-opcao-bg": "#111714",
  "--cv-opcao-ink": "#e8ede9",
  "--cv-opcao-borda": "rgba(255, 255, 255, 0.2)",
  "--cv-opcao-hover-bg": "rgba(107, 217, 185, 0.12)",
  "--cv-opcao-hover-ink": "#dff7ee",
  "--cv-opcao-hover-borda": "var(--green-400)",
  // gráficos
  "--cv-glifo": "#4f5c56",
  "--cv-glifo-equipe": "var(--green-400)",
  "--cv-logo-caixa": "#fff",
  // estilo chat (11/11/2026): balões, campo em pílula, chips, cartões arredondados
  "--cv-radius-balao": "18px",
  "--cv-radius-campo": "999px",
  "--cv-radius-chip": "999px",
  "--cv-radius-cartao": "14px",
  "--cv-bot-bg": "#1a211e",
  "--cv-bot-filete": "transparent",
  "--cv-bot-pad": "11px 15px",
  "--cv-bot-max": "88%",
  // fontes
  "--cv-font": "var(--font-sans)",
  "--cv-font-titulo": "var(--font-serif)",
  "--cv-font-mono": "var(--font-mono)",
  "--cv-font-numero": "var(--font-mono)",
  // fundo: leve tinta de menta no canto superior esquerdo + grade fina de 56 px,
  // quase imperceptível (é textura, não desenho)
  "--cv-grade": "rgba(255, 255, 255, 0.022)",
  "--cv-textura":
    "radial-gradient(900px 420px at 0% 0%, rgba(107, 217, 185, 0.07), transparent 65%), linear-gradient(var(--cv-grade) 1px, transparent 1px), linear-gradient(90deg, var(--cv-grade) 1px, transparent 1px)",
  "--cv-textura-tamanho": "auto, 56px 56px, 56px 56px",
  // widget (?v=chat) dentro do hero
  "--cv-borda": "rgba(255, 255, 255, 0.14)",
  "--cv-sombra": "0 24px 60px rgba(0, 0, 0, 0.5)",
  "--cv-sombra-botao": "0 8px 20px rgba(0, 0, 0, 0.4)",
};

const TEMA = { claro: TEMA_CLARO, escuro: TEMA_ESCURO };

// Logo da SysAid no cabeçalho (tela e widget): branco no escuro, preto no claro.
// Arquivos em public/logos/ (os mesmos do rodapé da LP). Link pra home da LP.
const LOGO = {
  claro: { src: "/logos/logo-black.svg", alt: "SysAid", href: "/", hrefRotulo: "SysAid Brasil, página inicial", altura: 24 },
  escuro: { src: "/logos/logo-white.svg", alt: "SysAid", href: "/", hrefRotulo: "SysAid Brasil, página inicial", altura: 24 },
};

// cor da barra do navegador (theme-color) na página do chat, por modo
export const COR_NAVEGADOR_SYSAID = { claro: "#175d4a", escuro: "#0b0f0d" }[MODO_SYSAID];

export const configSysaid: ConfigConversa = {
  id: "sysaid-diagnostico-itsm",
  // Cara de conversa, não de formulário (Fernando, 11/11/2026): sem título
  // "Diagnóstico ITSM", sem subtítulo, sem contagem "n de 7". O cabeçalho é logo +
  // presença ("online"/"digitando") + uma frase por origem, e só a barra fina de
  // progresso. Copy a revisar pelo sysaid-growth (anotado no backlog dele).
  marca: { titulo: "SysAid", rotuloRegiao: "Conversa com a SysAid", logo: LOGO[MODO_SYSAID] },
  cabecalho: {
    titulo: false,
    estado: { online: "online", digitando: "digitando", enviando: "enviando" },
    frase: {
      padrao: "Atendimento de TI sem chamado perdido.",
      casos: [
        {
          quando: { todas: [{ variavel: "concorrente", definida: true }, { variavel: "intencao", igual: "preco" }] },
          texto: "O que muda na conta se você sair do {{concorrente}}.",
        },
        { quando: { variavel: "concorrente", definida: true }, texto: "O que muda se você sair do {{concorrente}}." },
        { quando: { origem: "brand" }, texto: "Suporte, módulos novos ou troca de ferramenta." },
        { quando: { variavel: "intencao", igual: "preco" }, texto: "Primeiro o que a sua TI precisa, depois o preço." },
      ],
    },
    progresso: "barra",
  },
  modo: MODO_SYSAID,
  // visual de chat (Fernando, 11/11/2026): balões, abertura em balões curtos em sequência, chips, botão dentro do campo
  estilo: "chat",
  aberturaMs: 700,
  tema: TEMA[MODO_SYSAID],
  totalPassos: 7,
  digitandoMs: 300,

  origens: {
    padrao: "generica",
    lembrar: "qualifica_sysaid",
    regras: ORIGENS_REGRAS,
    porSlug: {
      movidesk: { origem: "comparativa", variaveis: { concorrente: "Movidesk", slug: "movidesk" } },
      topdesk: { origem: "comparativa", variaveis: { concorrente: "TopDesk", slug: "topdesk" } },
      freshdesk: { origem: "comparativa", variaveis: { concorrente: "Freshdesk", slug: "freshdesk" } },
      freshservice: { origem: "comparativa", variaveis: { concorrente: "Freshservice", slug: "freshservice" } },
      glpi: { origem: "comparativa", variaveis: { concorrente: "GLPI", slug: "glpi" } },
      jira: { origem: "comparativa", variaveis: { concorrente: "Jira Service Management", slug: "jira" } },
      zendesk: { origem: "comparativa", variaveis: { concorrente: "Zendesk", slug: "zendesk" } },
      servicenow: { origem: "comparativa", variaveis: { concorrente: "ServiceNow", slug: "servicenow" } },
    },
  },

  catalogos: {
    ferramentas: FERRAMENTAS,
    dores_generica: doresOrdenadas(["perda", "automacao", "sla", "relatorio"]),
    dores_comparativa: doresOrdenadas(["sla", "relatorio", "automacao", "custo"]),
    dores_preco: doresOrdenadas(["custo", "sla", "relatorio", "automacao"]),
  },

  variaveis: {
    ferramenta_rotulo: rotuloFerramenta,
    atual: nomeAtual,
    atual_mapa: atualNoMapa,
    empresa_sugerida: (ctx) => sugerirEmpresa(ctx.respostas.email ?? ""),
    // v2: nome pela parte local do e-mail e empresa lida pelo domínio (ou o chute)
    nome_sugerido: (ctx) => sugerirNome(ctx.respostas.email ?? ""),
    nome_sugerido_curto: (ctx) => primeiroNome(sugerirNome(ctx.respostas.email ?? "")),
    empresa_nome: (ctx) => (ctx.empresa && ctx.empresa.origem !== "fallback" ? ctx.empresa.nome : sugerirEmpresa(ctx.respostas.email ?? "")),
    // prefill da empresa: a lida pelo domínio (ou o chute), vazio se a pessoa disse "não é isso"
    empresa_prefill: (ctx) => (ctx.respostas.confirma === "nao" ? "" : ctx.empresa && ctx.empresa.origem !== "fallback" ? ctx.empresa.nome : sugerirEmpresa(ctx.respostas.email ?? "")),
    saudacao: (ctx) => {
      const n = primeiroNome(ctx.respostas.nome);
      return n ? `, ${n}` : "";
    },
  },

  validadores: {
    // trava de 09/09/2026: só e-mail corporativo avança (o servidor confere de novo)
    // 11/11: recusa em tom de chat (o núcleo mostra o erro como fala do bot no estilo chat)
    email_corporativo: (v) => (isCorporateEmail(v) ? null : "Esse parece um e-mail pessoal. Me passa o da empresa que eu sigo daqui."),
  },

  // v2: a abertura muda com a origem (campanha, termo, página). Sem "diagnóstico",
  // "perguntas" nem "2 minutos" (11/11/2026). Copy a revisar pelo sysaid-growth.
  // 11/11/2026: dois balões curtos que entram em sequência (estilo chat); a 1ª pergunta
  // (situação) vem logo depois. Sem "diagnóstico", "perguntas" nem "2 minutos".
  // Revisada pelo sysaid-growth em 11/11/2026: balão 1 cutuca a dor da origem,
  // balão 2 diz que tem jeito ("Vamos achar o melhor caminho pra você").
  abertura: [
    {
      padrao: "Oi. Chamado que se perde no WhatsApp, SLA que estoura sem ninguém ver?",
      casos: [
        {
          quando: { todas: [{ variavel: "concorrente", definida: true }, { variavel: "intencao", igual: "preco" }] },
          texto: "Oi. Veio ver quanto custa o {{concorrente}}?",
        },
        { quando: { variavel: "concorrente", definida: true }, texto: "Oi. Pensando em sair do {{concorrente}}?" },
        { quando: { origem: "brand" }, texto: "Oi, que bom ter você por aqui." },
        { quando: { variavel: "intencao", igual: "preco" }, texto: "Oi. Procurando preço de ferramenta de chamados?" },
      ],
    },
    {
      padrao: "Isso tem jeito. Vamos achar o melhor caminho pra você.",
      casos: [
        {
          quando: { todas: [{ variavel: "concorrente", definida: true }, { variavel: "intencao", igual: "preco" }] },
          texto: "Se a conta cresce a cada técnico novo, tem saída. Vamos achar o melhor caminho pra você.",
        },
        { quando: { variavel: "concorrente", definida: true }, texto: "O que está pesando aí tem jeito. Vamos achar o melhor caminho pra você." },
        { quando: { origem: "brand" }, texto: "Vamos achar o melhor caminho pra você." },
        { quando: { variavel: "intencao", igual: "preco" }, texto: "O preço certo depende do que pesa aí. Vamos achar o melhor caminho pra você." },
      ],
    },
  ],

  // Fluxo SPIN (11/11/2026, pedido do Fernando; copy a revisar pelo sysaid-growth).
  // 1 situação (chips + texto livre) → [situação por chips, só se o texto livre não
  // disse] → [cliente: suporte ou módulos] → 2 implicação (Jev decide a dor, Haiku
  // escreve a consequência: "É isso" / "Tem mais") → [dor na lista, se a geração
  // não veio] → aprofundamento → 3 e-mail corporativo → "É a Empresa, Nome?" (ou
  // pede nome e/ou empresa) → ferramenta → porte → papel → prazo → mapa → WhatsApp.
  // Ninguém pergunta de novo o que a situação já disse: o chip grava `situacao`.
  etapas: [
    {
      id: "situacao_texto",
      passo: 1,
      tipo: "texto",
      input: "textarea",
      texto: {
        padrao: "Pra começar: como os chamados chegam e são tratados aí hoje?",
        casos: [
          { quando: { variavel: "concorrente", definida: true }, texto: "Como está aí hoje com o {{concorrente}}?" },
          { quando: { origem: "brand" }, texto: "Como está o atendimento de TI aí hoje?" },
        ],
      },
      placeholder: {
        padrao: "Escreve do seu jeito. Ex.: chega por e-mail e a gente anota numa planilha",
        casos: [
          { quando: { variavel: "intencao", igual: "preco" }, texto: "Escreve do seu jeito. Ex.: pagamos por técnico e o custo só sobe" },
          { quando: { variavel: "concorrente", definida: true }, texto: "Escreve do seu jeito. Ex.: o relatório não mostra o que o gestor pede" },
        ],
      },
      atalhos: {
        padrao: [chip("sem"), chip("troca"), chip("cliente"), chip("pesquisa")],
        casos: [
          {
            // veio de "movidesk preço/valores": o custo primeiro
            quando: { todas: [{ variavel: "concorrente", definida: true }, { variavel: "intencao", igual: "preco" }] },
            opcoes: [chip("troca_comp_custo"), chip("troca_comp_sla"), chip("sem_comp"), chip("pesquisa_comp")],
          },
          {
            quando: { variavel: "concorrente", definida: true },
            opcoes: [chip("troca_comp_sla"), chip("troca_comp_rel"), chip("sem_comp"), chip("pesquisa_comp")],
          },
          {
            quando: { origem: "brand" },
            opcoes: [chip("cliente"), chip("troca_brand"), chip("sem"), chip("pesquisa")],
          },
        ],
      },
      // o chip já diz a situação (troca | sem | cliente | pesquisa); texto livre deixa pro passo "situacao"
      aoResponder: [
        { valor: SITUACAO_CHIP.sem, definir: { campo: "situacao", valor: "sem" } },
        { valor: SITUACAO_CHIP.sem_comp, definir: { campo: "situacao", valor: "sem" } },
        { valor: SITUACAO_CHIP.troca, definir: { campo: "situacao", valor: "troca" } },
        { valor: SITUACAO_CHIP.troca_comp_sla, definir: { campo: "situacao", valor: "troca" } },
        { valor: SITUACAO_CHIP.troca_comp_rel, definir: { campo: "situacao", valor: "troca" } },
        { valor: SITUACAO_CHIP.troca_comp_custo, definir: { campo: "situacao", valor: "troca" } },
        { valor: SITUACAO_CHIP.troca_brand, definir: { campo: "situacao", valor: "troca" } },
        { valor: SITUACAO_CHIP.cliente, definir: { campo: "situacao", valor: "cliente" } },
        { valor: SITUACAO_CHIP.pesquisa, definir: { campo: "situacao", valor: "pesquisa" } },
        { valor: SITUACAO_CHIP.pesquisa_comp, definir: { campo: "situacao", valor: "pesquisa" } },
      ],
      validar: [{ regra: "minCaracteres", valor: 10, mensagem: "Conta um pouco mais, ou toca numa das opções." }],
      recuperarAoCorrigir: true,
    },
    {
      // texto livre não diz a situação: um chip rápido antes de seguir
      id: "situacao",
      passo: 1,
      tipo: "escolha",
      // comparativa (Movidesk, TopDesk...): a pergunta de situação já foi sobre a
      // ferramenta dele, então não pergunta de novo; quem escreveu texto livre conta
      // como quem usa (pontuação `situacao_origem` e mapa "Movidesk hoje")
      quando: { todas: [{ nao: { campo: "situacao_texto", em: Object.values(SITUACAO_CHIP) } }, { nao: { variavel: "concorrente", definida: true } }] },
      texto: "E hoje vocês usam alguma ferramenta pra isso?",
      opcoes: {
        padrao: [
          { valor: "troca", rotulo: "Temos uma ferramenta e queremos trocar" },
          { valor: "sem", rotulo: "Não temos ferramenta: e-mail, planilha ou WhatsApp" },
          { valor: "cliente", rotulo: "Já usamos SysAid e queremos evoluir" },
          { valor: "pesquisa", rotulo: "Estou pesquisando o assunto" },
        ],
        casos: [
          {
            quando: { origem: "comparativa" },
            opcoes: [
              { valor: "troca", rotulo: "Usamos e pensamos em trocar" },
              { valor: "sem", rotulo: "Avaliamos e não escolhemos" },
              { valor: "pesquisa", rotulo: "Só estou comparando" },
            ],
          },
          {
            quando: { origem: "brand" },
            opcoes: [
              { valor: "cliente", rotulo: "Já usamos SysAid" },
              { valor: "troca", rotulo: "Temos outra ferramenta e queremos trocar" },
              { valor: "sem", rotulo: "Não temos ferramenta: e-mail, planilha ou WhatsApp" },
              { valor: "pesquisa", rotulo: "Estou pesquisando o assunto" },
            ],
          },
        ],
      },
    },
    {
      id: "cliente_tipo",
      passo: 1,
      tipo: "escolha",
      quando: { campo: "situacao", igual: "cliente" },
      texto: "Boa. Você precisa de suporte ou quer conhecer módulos novos?",
      opcoes: [
        { valor: "suporte", rotulo: "Preciso de suporte" },
        { valor: "modulos", rotulo: "Quero conhecer módulos novos" },
      ],
    },
    {
      // SPIN-I: a implicação escrita pela LLM a partir da situação (o Jev decide a dor).
      // Só aparece se a geração chegou a tempo. "É isso" e "Tem mais" gravam em `dor`
      // o valor do Jev; "Tem mais" abre um texto. Pra corrigir, a pessoa toca na situação.
      id: "palpite",
      passo: 2,
      tipo: "escolha",
      quando: { todas: [NAO_SUPORTE, { campo: "situacao_texto", vazio: false }, { gerado: "palpite", disponivel: true }] },
      texto: "Deixa eu ver se entendi.",
      gerado: { id: "palpite", texto: "palpite" },
      opcoes: [
        { valor: "sim", rotulo: "É isso" },
        { valor: "mais", rotulo: "Tem mais coisa" },
      ],
      aoResponder: [
        { valor: "sim", definir: { campo: "dor", deGerado: { id: "palpite", dado: "dor" } } },
        { valor: "mais", definir: { campo: "dor", deGerado: { id: "palpite", dado: "dor" } } },
      ],
    },
    {
      id: "implicacao_mais",
      passo: 2,
      tipo: "texto",
      input: "textarea",
      quando: { campo: "palpite", igual: "mais" },
      texto: "O que mais está pesando aí?",
      placeholder: "Ex.: o diretor cobra um relatório que eu não tenho",
      validar: [{ regra: "minCaracteres", valor: 5, mensagem: "Me conta um pouco mais." }],
      recuperarAoCorrigir: true,
    },
    {
      // sem geração (Jev/LLM fora, ou texto vago): a pessoa escolhe a dor na lista
      id: "dor",
      passo: 2,
      tipo: "escolha",
      quando: { todas: [NAO_SUPORTE, { nao: { campo: "palpite", em: ["sim", "mais"] } }] },
      texto: "E o que mais pesa no dia a dia aí?",
      opcoes: {
        padrao: { catalogo: "dores_generica" },
        casos: [
          { quando: { variavel: "intencao", igual: "preco" }, opcoes: { catalogo: "dores_preco" } },
          { quando: { origem: "comparativa" }, opcoes: { catalogo: "dores_comparativa" } },
        ],
      },
      mostrarPrimeiro: { quantidade: 4, rotulo: "Mais opções" },
    },
    {
      id: "aprof",
      passo: 2,
      tipo: "escolha",
      quando: { todas: [{ campo: "dor", definido: true }, { campo: "dor", diferente: "vaga" }, NAO_SUPORTE] },
      texto: "",
      variantes: { porCampo: "dor", casos: aprofundamentoVariantes },
      // parte 2: pergunta e 3 opções escritas pela LLM junto com a implicação; só
      // valem se `dor` ainda é a que o Jev leu (senão, a pergunta fixa acima)
      gerado: { id: "palpite", texto: "pergunta", opcoes: "opcoes", seIgual: { campo: "dor", dado: "dor" } },
    },
    {
      // só agora o e-mail (passo 3). E-mail pessoal é recusado com fala de chat
      // (validador `email_corporativo`); o nome vem da parte local e a empresa do
      // domínio (site + CNPJ), e o chat espera a empresa até `empresa.esperaMs`
      id: "email",
      passo: 3,
      tipo: "texto",
      input: "email",
      quando: NAO_SUPORTE,
      texto: "Já tenho uma ideia do caminho. Qual o seu e-mail da empresa?",
      placeholder: "voce@suaempresa.com.br",
      validar: [{ regra: "email", mensagem: "Acho que faltou alguma coisa nesse e-mail. Confere pra mim?" }, { regra: "custom", nome: "email_corporativo" }],
      normalizar: "minusculas",
    },
    {
      // nome (parte local do e-mail) e empresa (lida pelo domínio) confirmados de uma vez.
      // Regra do produto (30/10): o chat não diz de onde tirou; só confirma.
      id: "confirma",
      passo: 3,
      tipo: "escolha",
      quando: {
        todas: [
          NAO_SUPORTE,
          { variavel: "nome_sugerido", definida: true },
          { empresaEncontrada: true },
          // não aparece tarde (empresa chegou depois de a pessoa já ter dito o nome), mas fica no histórico
          { alguma: [{ campo: "confirma", definido: true }, { nao: { campo: "nome", definido: true } }] },
        ],
      },
      texto: "É a {{empresa.nome}}, {{nome_sugerido_curto}}?",
      opcoes: [
        { valor: "sim", rotulo: "Isso mesmo" },
        { valor: "nao", rotulo: "Não é bem isso" },
      ],
      aoResponder: [
        { valor: "sim", definir: { campo: "nome", deVariavel: "nome_sugerido" } },
        { valor: "sim", definir: { campo: "empresa", deVariavel: "empresa_nome" } },
      ],
    },
    {
      // sem sugestão, sem empresa lida, ou a pessoa disse "não é isso": pede
      id: "nome",
      passo: 3,
      tipo: "texto",
      input: "text",
      autoComplete: "name",
      quando: { todas: [NAO_SUPORTE, { nao: { campo: "confirma", igual: "sim" } }] },
      texto: {
        padrao: "E como eu te chamo?",
        casos: [
          { quando: { campo: "confirma", igual: "nao" }, texto: "Sem problema. Como eu te chamo?" },
          { quando: { variavel: "nome_sugerido", definida: true }, texto: "Posso te chamar de {{nome_sugerido}}?" },
        ],
      },
      placeholder: "Seu nome",
      prefill: "nome_sugerido",
      confirmarRotulo: "Pode, sim",
      recuperarAoCorrigir: true,
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Me diz como te chamar." }],
    },
    {
      id: "empresa",
      passo: 3,
      tipo: "texto",
      input: "text",
      autoComplete: "organization",
      quando: { todas: [NAO_SUPORTE, { nao: { campo: "confirma", igual: "sim" } }] },
      texto: {
        padrao: "E a empresa{{saudacao}}?",
        casos: [
          { quando: { campo: "confirma", igual: "nao" }, texto: "E a empresa{{saudacao}}?" },
          { quando: { empresaEncontrada: true }, texto: "A empresa é essa{{saudacao}}?" },
        ],
      },
      placeholder: "Empresa",
      prefill: "empresa_prefill",
      confirmarRotulo: "Sim, é essa",
      recuperarAoCorrigir: true,
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Me diz o nome da empresa." }],
    },
    {
      // só quando vai trocar e a ferramenta ainda não veio da URL
      id: "ferramenta",
      passo: 4,
      tipo: "escolha",
      quando: { todas: [{ campo: "situacao", igual: "troca" }, { nao: { variavel: "concorrente", definida: true } }] },
      texto: "Qual ferramenta vocês usam hoje?",
      opcoes: { catalogo: "ferramentas" },
      resumo: { template: "{{ferramenta_rotulo}}" },
    },
    {
      id: "ferramenta_outra",
      passo: 4,
      tipo: "texto",
      input: "text",
      quando: { campo: "ferramenta", igual: "outra" },
      texto: "Qual é a ferramenta?",
      placeholder: "Nome da ferramenta",
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Informe o nome da ferramenta." }],
    },
    {
      id: "usuarios",
      passo: 4,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "Quantas pessoas a TI atende aí?",
      opcoes: [
        { valor: "50", rotulo: "Até 50" },
        { valor: "200", rotulo: "51 a 200" },
        { valor: "1000", rotulo: "201 a 1.000" },
        { valor: "mais", rotulo: "Mais de 1.000" },
      ],
      resumo: { porValor: { "50": "Até 50 pessoas", "200": "51 a 200 pessoas", "1000": "201 a 1.000 pessoas", mais: "Mais de 1.000 pessoas" } },
    },
    {
      id: "tecnicos",
      passo: 4,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "E quantos técnicos cuidam disso?",
      opcoes: [
        { valor: "1-2", rotulo: "1 a 2" },
        { valor: "3-10", rotulo: "3 a 10" },
        { valor: "+10", rotulo: "Mais de 10" },
      ],
      resumo: { porValor: { "1-2": "1 a 2 técnicos", "3-10": "3 a 10 técnicos", "+10": "Mais de 10 técnicos" } },
    },
    {
      // checagem de coerência por código (sem Jev): porte grande com time mínimo.
      // "Corrigir" apaga porte e técnicos e pergunta de novo.
      id: "coerencia",
      passo: 4,
      tipo: "escolha",
      quando: { todas: [{ campo: "usuarios", igual: "mais" }, { campo: "tecnicos", igual: "1-2" }] },
      texto: "Só confirmando: são mais de 1.000 pessoas atendidas por 1 ou 2 técnicos?",
      opcoes: [
        { valor: "sim", rotulo: "Sim, é isso" },
        { valor: "corrigir", rotulo: "Corrigir" },
      ],
      aoResponder: [{ valor: "corrigir", refazerDesde: "usuarios" }],
    },
    {
      id: "papel",
      passo: 5,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "E qual o seu papel nessa escolha?",
      opcoes: [
        { valor: "decide", rotulo: "Decido" },
        { valor: "influencia", rotulo: "Avalio e recomendo" },
        { valor: "levanta", rotulo: "Me pediram pra levantar opções" },
        { valor: "estuda", rotulo: "Sou estudante ou só curioso" },
      ],
    },
    {
      id: "prazo",
      passo: 5,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "Pra quando vocês querem isso resolvido?",
      opcoes: [
        { valor: "tri", rotulo: "Neste trimestre" },
        { valor: "6m", rotulo: "Próximos 6 meses" },
        { valor: "sem", rotulo: "Ainda sem data" },
        { valor: "cota", rotulo: "Só preciso de um orçamento pra comparar" },
      ],
    },
    {
      // "uau 2" em versão fixa: mapa do catálogo, sem animação (fica pra fatia 2)
      id: "mapa",
      passo: 6,
      tipo: "info",
      quando: NAO_SUPORTE,
      texto: "Com o que você me contou{{saudacao}}, o caminho fica assim:",
      resumo: { porValor: { ok: "Quero esse mapa" } },
      opcoes: [{ valor: "ok", rotulo: "Quero esse mapa" }],
    },
    {
      id: "telefone",
      passo: 7,
      tipo: "texto",
      input: "tel",
      mascara: "telefone_br",
      quando: NAO_SUPORTE,
      texto: "Qual o seu WhatsApp{{saudacao}}? Pra eu te mandar esse mapa.",
      placeholder: "(11) 99999-9999",
      validar: [{ regra: "minDigitos", valor: 10, mensagem: "Informe um telefone com DDD." }],
    },
  ],

  // v2: empresa pelo domínio do e-mail (rota sob medida /api/diagnostico/empresa,
  // leitor genérico em lib/conversa-core/servidor/empresa.ts)
  empresa: {
    habilitado: process.env.NEXT_PUBLIC_DIAG_EMPRESA !== "0",
    endpoint: "/api/diagnostico/empresa",
    campoEmail: "email",
    timeoutMs: 7000,
    // segura a pergunta seguinte (mostrando "digitando") até a empresa chegar, pra confirmar nome e empresa de uma vez
    esperaMs: 3500,
  },

  // v2: painéis gerados por código. Empresa com a pergunta de confirmação; porte
  // logo depois do nº de pessoas (e cresce com os técnicos); mapa fixo na lateral
  // no desktop (cresce a cada resposta) e, no celular, no passo "mapa".
  paineis: [
    // cartão da empresa: com a confirmação conjunta ("É a Empresa, Nome?") ou, sem sugestão de nome, na pergunta da empresa
    { id: "empresa_confirma", tipo: "empresa", apos: "confirma", quando: { empresaEncontrada: true } },
    { id: "empresa", tipo: "empresa", apos: "empresa", quando: { todas: [{ empresaEncontrada: true }, { nao: { campo: "confirma", definido: true } }] } },
    { id: "porte", tipo: "porte", apos: "usuarios" },
    { id: "mapa", tipo: "mapa", lugar: "lateral", apos: "mapa", quando: { campo: "dor", definido: true }, titulo: "O mapa do seu caso" },
  ],

  porte: {
    pessoas: { campo: "usuarios", valores: { "50": 50, "200": 200, "1000": 1000, mais: 2500 }, rotulo: "{{resumo.usuarios}}" },
    equipe: { campo: "tecnicos", valores: { "1-2": 2, "3-10": 6, "+10": 14 }, rotulo: "{{resumo.tecnicos}} · 1 pra cada ~{{razao}} pessoas" },
    titulo: "A sua central de TI, em escala",
    legenda: {
      padrao: "cada bonequinho é uma pessoa atendida",
      casos: [{ quando: { campo: "usuarios", em: ["1000", "mais"] }, texto: "cada bonequinho são ~{{porGlifo}} pessoas atendidas" }],
    },
  },

  mapa: {
    atual: {
      texto: "{{atual_mapa}}",
      nota: { padrao: "onde você está", casos: [{ quando: { campo: "usuarios", definido: true }, texto: "onde você está · {{resumo.usuarios}}" }] },
    },
    problema: { quando: { campo: "dor", definido: true }, texto: "{{resumo.dor}}", nota: "o problema" },
    causa: { quando: { campo: "aprof", definido: true }, texto: "{{resumo.aprof}}", nota: "como acontece hoje" },
    destino: { quando: { campo: "dor", definido: true }, nota: "o que resolve", maximo: 3 },
    passo: {
      quando: { campo: "prazo", definido: true },
      texto: {
        padrao: "Demonstração guiada no seu cenário",
        casos: [
          { quando: { campo: "situacao", igual: "cliente" }, texto: "Conversa com o seu gerente de conta sobre os módulos acima" },
          { quando: { campo: "prazo", igual: "cota" }, texto: "Orçamento com esse escopo" },
          { quando: { campo: "prazo", igual: "sem" }, texto: "Esse mapa por e-mail, pra quando fizer sentido" },
        ],
      },
      nota: "primeiro passo",
    },
    arestas: { problema: "hoje", causa: "no dia a dia", destino: "com a SysAid", passo: "e depois" },
  },

  resumo: {
    titulo: "O seu caso",
    subtitulo: "Se escreve sozinho enquanto você responde.",
    linhas: [
      { rotulo: "Empresa", texto: "{{resumo.empresa}}" },
      { rotulo: "Situação", texto: "{{resumo.situacao}}" },
      { rotulo: "Hoje", texto: "{{resumo.situacao_texto}}" },
      { rotulo: "Ferramenta hoje", texto: "{{ferramenta_rotulo}}" },
      { rotulo: "O problema", texto: "{{resumo.dor}}" },
      { rotulo: "No dia a dia", texto: "{{resumo.aprof}}" },
      { rotulo: "O que mais pesa", texto: "{{resumo.implicacao_mais}}" },
      { rotulo: "Pessoas atendidas", texto: "{{resumo.usuarios}}" },
      { rotulo: "Equipe", texto: "{{resumo.tecnicos}}" },
      { rotulo: "Papel", texto: "{{resumo.papel}}" },
      { rotulo: "Prazo", texto: "{{resumo.prazo}}" },
      { rotulo: "Como chegou", texto: "{{canal}}" },
    ],
  },

  encerramentos: [
    {
      id: "suporte",
      quando: { campo: "cliente_tipo", igual: "suporte" },
      texto: "Pra suporte, o caminho mais rápido é o portal:",
      link: { href: LINK_SUPORTE, rotulo: "abrir o suporte SysAid" },
      complemento: ". Se quiser conhecer módulos novos, toque na sua resposta acima pra mudar.",
    },
  ],

  // mapa genérico do catálogo (fallback do "uau 2", sem Jev nem LLM)
  recomendacao: {
    nos: {
      sd: "Service Desk com SLA e escalonamento",
      portal: "Portal de autoatendimento e catálogo",
      auto: "Automação de workflow",
      ativos: "Ativos e CMDB",
      bi: "Relatórios e BI",
      ia: "Copilot e agentes de IA",
      esm: "ESM: RH, facilities, jurídico",
      integ: "Integrações: Teams, e-mail, Jira, ERP",
    },
    padrao: ["sd", "portal", "bi"], // dor vaga ou não informada
    regras: [
      { quando: { campo: "situacao", igual: "cliente" }, nos: ["ia", "esm", "integ"] },
      { quando: { campo: "dor", igual: "sla" }, nos: ["sd", "auto", "bi"] },
      { quando: { campo: "dor", igual: "perda" }, nos: ["sd", "portal", "auto"] },
      { quando: { campo: "dor", igual: "relatorio" }, nos: ["bi", "sd", "auto"] },
      { quando: { campo: "dor", igual: "ativos" }, nos: ["ativos", "sd", "integ"] },
      { quando: { campo: "dor", igual: "automacao" }, nos: ["auto", "portal", "ia"] },
      { quando: { campo: "dor", igual: "ia" }, nos: ["ia", "portal", "sd"] },
      { quando: { campo: "dor", igual: "custo" }, nos: ["sd", "portal", "bi"] },
      { quando: { campo: "dor", igual: "esm" }, nos: ["esm", "portal", "auto"] },
      { modo: "acrescentar", quando: { campo: "situacao", diferente: "cliente" }, nos: ["ia"] },
      { modo: "acrescentar", quando: { campo: "usuarios", igual: "mais" }, nos: ["esm"] },
    ],
  },

  // plano, seção 4: Forte 11+ · Médio 7 a 10 · Fraco até 6 · máximo 15
  pontuacao: {
    maximo: 15,
    criterios: [
      { id: "situacao", campo: "situacao", pontos: { troca: 3, sem: 2 } },
      { id: "dor", campo: "dor", pontos: { "*": 2, vaga: 0 } },
      { id: "usuarios", campo: "usuarios", pontos: { "50": 0, "200": 2, "1000": 3, mais: 3 } },
      { id: "tecnicos", campo: "tecnicos", pontos: { "1-2": 0, "3-10": 1, "+10": 2 } },
      { id: "papel", campo: "papel", pontos: { decide: 3, influencia: 2, levanta: 1, estuda: 0 } },
      { id: "prazo", campo: "prazo", pontos: { tri: 3, "6m": 2, sem: 0, cota: 0 } },
    ],
    extras: [
      // comparativa com texto livre: o passo "situacao" não roda (a pergunta já foi
      // sobre a ferramenta dele), então conta como quem usa e pensa em trocar (= troca)
      {
        id: "situacao_origem",
        quando: { todas: [{ variavel: "concorrente", definida: true }, { nao: { campo: "situacao", definido: true } }, { campo: "situacao_texto", vazio: false }] },
        pontos: 3,
      },
      // capricho: texto da dor com 60+ caracteres e tempo total entre 90 s e 12 min
      { id: "capricho", quando: { todas: [{ campo: "situacao_texto", minCaracteres: 60 }, { tempoTotalEntre: [90, 12 * 60] }] }, pontos: 1 },
    ],
    classes: [
      { id: "forte", minimo: 11 },
      { id: "medio", minimo: 7 },
      { id: "fraco", minimo: 0 },
    ],
    // rótulos que o código já sabe sem ler texto; os demais ("só cotando" pelo
    // texto, "fora do perfil", coerência) são do Jev na parte 2
    rotulos: [
      { rotulo: "fora", quando: { campo: "papel", igual: "estuda" } },
      { rotulo: "cliente", quando: { campo: "situacao", igual: "cliente" } },
      { rotulo: "cotando", quando: { alguma: [{ campo: "prazo", igual: "cota" }, { todas: [{ campo: "dor", igual: "custo" }, { campo: "prazo", igual: "sem" }] }] } },
    ],
    // cliente atual pedindo módulos = médio pro gerente de conta;
    // "incoerente" (Jev, parte 2: respostas contraditórias ou texto sem sentido) cai em fraco
    rotaPorRotulo: { fora: "fora", cotando: "cotando", cliente: "medio", incoerente: "fraco" },
    // v2: entre o rótulo do Jev e o do código vence o que vier antes aqui (um "fora"
    // que o código já sabia não some por causa de um "incoerente" do Jev)
    precedenciaRotulos: ["fora", "cliente", "cotando", "incoerente"],
  },

  // Parte 2 (30/10/2026): /api/diagnostico/rotular fala com o Jev no servidor
  // (chave JEV_API_KEY, interna; produção precisa de chave própria, decisão 7).
  // Sem a flag, fallback na hora, sem rede.
  jev: {
    habilitado: process.env.NEXT_PUBLIC_DIAG_JEV === "1",
    endpoint: "/api/diagnostico/rotular",
    timeoutMs: 1500, // o servidor espera o Jev até 1200 ms (servidor-sysaid.ts); a pessoa está vendo "enviando"
  },

  // Parte 2: enquanto a pessoa digita a dor, /api/diagnostico/gerar pede ao Jev
  // a dor e à LLM o palpite + pergunta de aprofundamento (prompts em
  // servidor-sysaid.ts). No Enter o chat espera no máximo `esperaMs`; passou,
  // segue com a lista e a pergunta fixa.
  geracoes:
    process.env.NEXT_PUBLIC_DIAG_LLM === "1"
      ? [
          {
            id: "palpite",
            endpoint: "/api/diagnostico/gerar",
            gatilho: { campo: "situacao_texto", minCaracteres: 12, debounceMs: 600, passoCaracteres: 20 },
            // 11/11: com chip a geração só começa no clique (Jev ~0,8 s + Haiku ~1,5 s); o chat mostra "digitando" até aqui
            esperaMs: 3000,
            timeoutMs: 8000,
          },
        ]
      : [],

  textos: {
    enviando: "Fechado{{saudacao}}. Estou mandando o seu mapa.",
    erro: "Não consegui enviar agora. Confira o e-mail e tente de novo em instantes.",
    tentarDeNovo: "Tentar de novo",
    legal: "Ao continuar, você concorda em ser contatado pela SysAid. Sem spam.",
    corrigirDica: "Tocar pra corrigir esta resposta.",
    // só pro leitor de tela (rótulo da barra fina de progresso)
    passoAria: "Parte {{passo}} de {{total}} da conversa",
    enviar: "Enviar",
    corrigir: "corrigir",
  },

  Cena: CenaPlaceholder,
};
