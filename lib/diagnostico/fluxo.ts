// ==========================================================================
// Diagnóstico ITSM (variante B do formulário da LP) — definição do fluxo.
// Fonte: clientes/sysaid/formulario-inteligente/diagnostico-itsm-plano.html
// (seções 1 a 5), 17/10/2026. Parte 1 da fatia 1 (28/10/2026): tudo é texto
// fixo e decisão por código. Onde o plano usa Jev (dor ao vivo, palpite) ou
// LLM (pergunta gerada), este arquivo usa a pergunta padrão de fallback.
//
// O motor (components/diagnostico/DiagnosticoChat.tsx) só conhece a lista
// ETAPAS: percorre na ordem, pula a etapa cujo `aplica(ctx)` é falso e para na
// primeira sem resposta. Corrigir uma bolha antiga = apagar a resposta daquela
// etapa e de todas as seguintes; o resto se recalcula sozinho.
// ==========================================================================

export type Origem = "generica" | "comparativa";

export type Situacao = "troca" | "sem" | "cliente" | "pesquisa";
export type Dor =
  | "sla" | "perda" | "relatorio" | "automacao" | "ativos"
  | "ia" | "custo" | "esm" | "vaga";
export type Usuarios = "50" | "200" | "1000" | "mais";
export type Tecnicos = "1-2" | "3-10" | "+10";
export type Papel = "decide" | "influencia" | "levanta" | "estuda";
export type Prazo = "tri" | "6m" | "sem" | "cota";

export type Respostas = {
  email?: string;
  situacao?: Situacao;
  ferramenta?: string; // "movidesk", "glpi", "planilha", "outra"...
  ferramenta_outra?: string; // nome digitado quando ferramenta === "outra"
  cliente_tipo?: "suporte" | "modulos";
  dor_texto?: string; // texto livre (pode ser "" quando a pessoa pulou)
  dor?: Dor;
  aprof?: string; // "a" | "b" | "c" | "outro"
  usuarios?: Usuarios;
  tecnicos?: Tecnicos;
  coerencia?: "sim" | "corrigir";
  papel?: Papel;
  prazo?: Prazo;
  mapa?: "ok";
  nome?: string;
  telefone?: string;
  empresa?: string;
};

export type Contexto = {
  origem: Origem;
  concorrente: string | null; // nome bonito ("Movidesk") quando a página é comparativa
  respostas: Respostas;
};

export type Opcao = { valor: string; rotulo: string };

export type Etapa = {
  id: keyof Respostas;
  // numero da pergunta no plano (1 a 7); etapas auxiliares repetem o da mae
  pergunta: number;
  tipo: "texto" | "escolha" | "info";
  aplica: (ctx: Contexto) => boolean;
  texto: (ctx: Contexto) => string;
  opcoes?: (ctx: Contexto) => Opcao[];
  placeholder?: (ctx: Contexto) => string;
  // texto: valida e devolve erro (string) ou null
  validar?: (valor: string, ctx: Contexto) => string | null;
  // texto: permite pular com um botao
  pular?: { rotulo: string; valor: string };
  // como a resposta aparece na bolha da pessoa
  resumo: (valor: string, ctx: Contexto) => string;
  // campo de entrada de texto
  input?: "email" | "text" | "tel" | "textarea";
};

// --------------------------------------------------------------------------
// Origem pela URL
// --------------------------------------------------------------------------
export const CONCORRENTES: Record<string, string> = {
  movidesk: "Movidesk",
  topdesk: "TopDesk",
  freshdesk: "Freshdesk",
  freshservice: "Freshservice",
  glpi: "GLPI",
  jira: "Jira Service Management",
  zendesk: "Zendesk",
  servicenow: "ServiceNow",
};

export function origemDoCaminho(pathname: string): { origem: Origem; concorrente: string | null; slug: string | null } {
  const slug = pathname.replace(/^\/+|\/+$/g, "").split("/")[0].toLowerCase();
  if (slug && CONCORRENTES[slug]) return { origem: "comparativa", concorrente: CONCORRENTES[slug], slug };
  return { origem: "generica", concorrente: null, slug: null };
}

// --------------------------------------------------------------------------
// Catálogos
// --------------------------------------------------------------------------
export const FERRAMENTAS: Opcao[] = [
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

export const DORES: { valor: Dor; rotulo: string }[] = [
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

// as 4 dores mais comuns por origem (plano, nó 4, "dor vaga"); as demais
// ficam atrás de "Mais opções"
const DORES_COMUNS: Record<Origem, Dor[]> = {
  generica: ["perda", "automacao", "sla", "relatorio"],
  comparativa: ["sla", "relatorio", "automacao", "custo"],
};

export function doresDaOrigem(origem: Origem): { principais: Opcao[]; outras: Opcao[] } {
  const comuns = DORES_COMUNS[origem];
  const principais = comuns.map((d) => DORES.find((x) => x.valor === d)!);
  const outras = DORES.filter((d) => !comuns.includes(d.valor));
  return { principais, outras };
}

// pergunta fixa de aprofundamento por dor (fallback da pergunta gerada, nó 4)
export const APROFUNDAMENTO: Record<Exclude<Dor, "vaga">, { pergunta: string; opcoes: string[] }> = {
  sla: {
    pergunta: "Quando um chamado está pra estourar, o que acontece hoje?",
    opcoes: ["Ninguém é avisado", "O técnico vê, mas não escala", "Existe escalonamento, mas por e-mail"],
  },
  perda: {
    pergunta: "Por onde o pedido chega hoje?",
    opcoes: ["WhatsApp e corredor", "E-mail", "Ferramenta, mas sem fila clara"],
  },
  relatorio: {
    pergunta: "O que o gestor te pede e você não consegue tirar?",
    opcoes: ["Tempo de resposta por equipe", "Volume por tipo de chamado", "Custo por chamado"],
  },
  automacao: {
    pergunta: "Qual rotina mais rouba tempo?",
    opcoes: ["Aprovação de acesso", "Onboarding de funcionário", "Reset de senha"],
  },
  ativos: {
    pergunta: "O que você precisa saber e hoje não sabe?",
    opcoes: ["Quem está com qual máquina", "Licenças vencendo", "Histórico de cada equipamento"],
  },
  ia: {
    pergunta: "Onde a IA ajudaria primeiro?",
    opcoes: ["Responder dúvidas repetidas", "Classificar e rotear", "Resolver sozinha o simples"],
  },
  custo: {
    pergunta: "O que pesa mais?",
    opcoes: ["Preço por agente", "Módulos cobrados à parte", "Dólar"],
  },
  esm: {
    pergunta: "Qual área quer atender além da TI?",
    opcoes: ["RH", "Facilities", "Jurídico ou financeiro"],
  },
};

// mapa genérico do catálogo (fallback do "uau 2", sem Jev nem LLM)
export const MODULOS: Record<string, string> = {
  sd: "Service Desk com SLA e escalonamento",
  portal: "Portal de autoatendimento e catálogo",
  auto: "Automação de workflow",
  ativos: "Ativos e CMDB",
  bi: "Relatórios e BI",
  ia: "Copilot e agentes de IA",
  esm: "ESM: RH, facilities, jurídico",
  integ: "Integrações: Teams, e-mail, Jira, ERP",
};

const MAPA_POR_DOR: Record<Dor, string[]> = {
  sla: ["sd", "auto", "bi"],
  perda: ["sd", "portal", "auto"],
  relatorio: ["bi", "sd", "auto"],
  ativos: ["ativos", "sd", "integ"],
  automacao: ["auto", "portal", "ia"],
  ia: ["ia", "portal", "sd"],
  custo: ["sd", "portal", "bi"],
  esm: ["esm", "portal", "auto"],
  vaga: ["sd", "portal", "bi"],
};

export function mapaDe(r: Respostas): string[] {
  const nos = r.situacao === "cliente" ? ["ia", "esm", "integ"] : [...MAPA_POR_DOR[r.dor ?? "vaga"]];
  if (r.dor !== "ia" && r.situacao !== "cliente" && !nos.includes("ia")) nos.push("ia");
  if (r.dor !== "esm" && r.usuarios === "mais" && !nos.includes("esm")) nos.push("esm");
  return nos.map((k) => MODULOS[k]);
}

export function rotuloFerramenta(valor: string | undefined, outra?: string): string {
  if (!valor) return "";
  if (valor === "outra") return (outra ?? "").trim() || "outra ferramenta";
  return FERRAMENTAS.find((f) => f.valor === valor)?.rotulo ?? valor;
}

function nomeAtual(ctx: Contexto): string {
  const r = ctx.respostas;
  if (r.situacao === "sem" || r.ferramenta === "planilha") return "e-mail e planilha";
  if (ctx.origem === "comparativa" && ctx.concorrente && r.situacao === "troca") return `${ctx.concorrente} hoje`;
  const f = rotuloFerramenta(r.ferramenta, r.ferramenta_outra);
  return f ? `${f} hoje` : "hoje";
}

// --------------------------------------------------------------------------
// Abertura (nó "Entrada")
// --------------------------------------------------------------------------
export function abertura(ctx: Contexto): string[] {
  if (ctx.origem === "comparativa" && ctx.concorrente) {
    return [
      `Em 2 minutos eu te mostro o que mudaria se você saísse do ${ctx.concorrente}.`,
      "São 7 perguntas rápidas, quase tudo por botão. No fim você recebe o mapa do seu problema.",
    ];
  }
  return [
    "Diagnóstico em 2 minutos: veja o que mudaria pra você.",
    "São 7 perguntas rápidas, quase tudo por botão. No fim você recebe o mapa do seu problema.",
  ];
}

// --------------------------------------------------------------------------
// As etapas, na ordem
// --------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sempre = () => true;

const OPCOES_SITUACAO = (ctx: Contexto): Opcao[] =>
  ctx.origem === "comparativa"
    ? [
        { valor: "troca", rotulo: "Uso hoje e penso em trocar" },
        { valor: "sem", rotulo: "Avaliei e não escolhi" },
        { valor: "pesquisa", rotulo: "Só estou comparando" },
      ]
    : [
        { valor: "troca", rotulo: "Temos uma ferramenta e queremos trocar" },
        { valor: "sem", rotulo: "Não temos ferramenta: e-mail, planilha ou WhatsApp" },
        { valor: "cliente", rotulo: "Já usamos SysAid e queremos evoluir" },
        { valor: "pesquisa", rotulo: "Estou pesquisando o assunto" },
      ];

export const ETAPAS: Etapa[] = [
  {
    id: "email",
    pergunta: 1,
    tipo: "texto",
    input: "email",
    aplica: sempre,
    texto: () => "Pra começar: qual o seu e-mail corporativo?",
    placeholder: () => "voce@suaempresa.com.br",
    validar: (v) => (EMAIL_RE.test(v.trim()) ? null : "Informe um e-mail válido."),
    resumo: (v) => v.trim().toLowerCase(),
  },
  {
    id: "situacao",
    pergunta: 2,
    tipo: "escolha",
    aplica: sempre,
    texto: (ctx) =>
      ctx.origem === "comparativa" && ctx.concorrente
        ? `Você usa ${ctx.concorrente} hoje?`
        : "Qual a sua situação hoje?",
    opcoes: OPCOES_SITUACAO,
    resumo: (v, ctx) => OPCOES_SITUACAO(ctx).find((x) => x.valor === v)?.rotulo ?? v,
  },
  {
    // 2b: só quando vai trocar e a ferramenta ainda não veio da URL
    id: "ferramenta",
    pergunta: 2,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.situacao === "troca" && !(ctx.origem === "comparativa" && ctx.concorrente),
    texto: () => "Qual ferramenta vocês usam hoje?",
    opcoes: () => FERRAMENTAS,
    resumo: (v, ctx) => rotuloFerramenta(v, ctx.respostas.ferramenta_outra),
  },
  {
    id: "ferramenta_outra",
    pergunta: 2,
    tipo: "texto",
    input: "text",
    aplica: (ctx) => ctx.respostas.ferramenta === "outra",
    texto: () => "Qual é a ferramenta?",
    placeholder: () => "Nome da ferramenta",
    validar: (v) => (v.trim().length >= 2 ? null : "Informe o nome da ferramenta."),
    resumo: (v) => v.trim(),
  },
  {
    id: "cliente_tipo",
    pergunta: 2,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.situacao === "cliente",
    texto: () => "Que bom ter você por aqui. É suporte ou quer conhecer módulos novos?",
    opcoes: () => [
      { valor: "suporte", rotulo: "Preciso de suporte" },
      { valor: "modulos", rotulo: "Quero conhecer módulos novos" },
    ],
    resumo: (v) => (v === "suporte" ? "Preciso de suporte" : "Quero conhecer módulos novos"),
  },
  {
    id: "dor_texto",
    pergunta: 3,
    tipo: "texto",
    input: "textarea",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "O que mais te incomoda hoje no atendimento de TI? Pode escrever do seu jeito.",
    placeholder: (ctx) =>
      ctx.respostas.situacao === "sem"
        ? "ex.: chamados se perdem no WhatsApp"
        : ctx.origem === "comparativa" && ctx.concorrente
          ? `ex.: o relatório do ${ctx.concorrente} não mostra o que o gestor pede`
          : "ex.: o SLA estoura e ninguém é avisado",
    validar: (v) => (v.trim().length >= 15 ? null : "Conta um pouco mais (pelo menos 15 caracteres) ou escolha de uma lista."),
    pular: { rotulo: "Prefiro escolher de uma lista", valor: "" },
    resumo: (v) => (v.trim() ? v.trim() : "Prefiro escolher de uma lista"),
  },
  {
    // fallback da dor (sem Jev lendo o texto): a pessoa confirma a dor na lista
    id: "dor",
    pergunta: 3,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: (ctx) =>
      ctx.respostas.dor_texto
        ? "Entendi. Qual destas parece mais com o que você descreveu?"
        : "Qual destas parece mais com o seu dia?",
    opcoes: (ctx) => {
      const { principais, outras } = doresDaOrigem(ctx.origem);
      return [...principais, ...outras];
    },
    resumo: (v) => DORES.find((d) => d.valor === v)?.rotulo ?? v,
  },
  {
    id: "aprof",
    pergunta: 4,
    tipo: "escolha",
    aplica: (ctx) => !!ctx.respostas.dor && ctx.respostas.dor !== "vaga" && ctx.respostas.cliente_tipo !== "suporte",
    texto: (ctx) => APROFUNDAMENTO[ctx.respostas.dor as Exclude<Dor, "vaga">].pergunta,
    opcoes: (ctx) => {
      const a = APROFUNDAMENTO[ctx.respostas.dor as Exclude<Dor, "vaga">];
      return [
        ...a.opcoes.map((o, i) => ({ valor: "abc"[i], rotulo: o })),
        { valor: "outro", rotulo: "Outro" },
      ];
    },
    resumo: (v, ctx) => {
      if (v === "outro") return "Outro";
      const a = APROFUNDAMENTO[ctx.respostas.dor as Exclude<Dor, "vaga">];
      return a.opcoes["abc".indexOf(v)] ?? v;
    },
  },
  {
    id: "usuarios",
    pergunta: 5,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "Quantas pessoas a TI atende?",
    opcoes: () => [
      { valor: "50", rotulo: "Até 50" },
      { valor: "200", rotulo: "51 a 200" },
      { valor: "1000", rotulo: "201 a 1.000" },
      { valor: "mais", rotulo: "Mais de 1.000" },
    ],
    resumo: (v) => ({ "50": "Até 50 pessoas", "200": "51 a 200 pessoas", "1000": "201 a 1.000 pessoas", mais: "Mais de 1.000 pessoas" })[v] ?? v,
  },
  {
    id: "tecnicos",
    pergunta: 5,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "E quantos técnicos ou administradores cuidam disso?",
    opcoes: () => [
      { valor: "1-2", rotulo: "1 a 2" },
      { valor: "3-10", rotulo: "3 a 10" },
      { valor: "+10", rotulo: "Mais de 10" },
    ],
    resumo: (v) => ({ "1-2": "1 a 2 técnicos", "3-10": "3 a 10 técnicos", "+10": "Mais de 10 técnicos" })[v] ?? v,
  },
  {
    // checagem de coerência por código (sem Jev): porte grande com time mínimo
    id: "coerencia",
    pergunta: 5,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.usuarios === "mais" && ctx.respostas.tecnicos === "1-2",
    texto: () => "Só confirmando: são mais de 1.000 pessoas atendidas por 1 ou 2 técnicos?",
    opcoes: () => [
      { valor: "sim", rotulo: "Sim, é isso" },
      { valor: "corrigir", rotulo: "Corrigir" },
    ],
    resumo: (v) => (v === "sim" ? "Sim, é isso" : "Corrigir"),
  },
  {
    id: "papel",
    pergunta: 6,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "Qual o seu papel nessa decisão?",
    opcoes: () => [
      { valor: "decide", rotulo: "Decido" },
      { valor: "influencia", rotulo: "Avalio e recomendo" },
      { valor: "levanta", rotulo: "Me pediram pra levantar opções" },
      { valor: "estuda", rotulo: "Estudante / curiosidade" },
    ],
    resumo: (v) => ({ decide: "Decido", influencia: "Avalio e recomendo", levanta: "Me pediram pra levantar opções", estuda: "Estudante / curiosidade" })[v] ?? v,
  },
  {
    id: "prazo",
    pergunta: 6,
    tipo: "escolha",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "E quando pretende mudar?",
    opcoes: () => [
      { valor: "tri", rotulo: "Neste trimestre" },
      { valor: "6m", rotulo: "Próximos 6 meses" },
      { valor: "sem", rotulo: "Sem data" },
      { valor: "cota", rotulo: "Só preciso de um orçamento pra comparar" },
    ],
    resumo: (v) => ({ tri: "Neste trimestre", "6m": "Próximos 6 meses", sem: "Sem data", cota: "Só preciso de um orçamento pra comparar" })[v] ?? v,
  },
  {
    // "uau 2" em versão fixa: mapa do catálogo, sem animação (fica pra fatia 2)
    id: "mapa",
    pergunta: 6,
    tipo: "info",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: (ctx) => {
      const nos = mapaDe(ctx.respostas);
      const hoje = nomeAtual(ctx);
      return `Com o que você me contou, o caminho fica assim:\n${hoje} → ${nos.join(" → ")}.`;
    },
    opcoes: () => [{ valor: "ok", rotulo: "Quero esse mapa" }],
    resumo: () => "Quero esse mapa",
  },
  {
    id: "nome",
    pergunta: 7,
    tipo: "texto",
    input: "text",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "Pra quem eu mando o mapa? Seu nome:",
    placeholder: () => "Nome completo",
    validar: (v) => (v.trim().length >= 2 ? null : "Informe seu nome."),
    resumo: (v) => v.trim(),
  },
  {
    id: "telefone",
    pergunta: 7,
    tipo: "texto",
    input: "tel",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: () => "E o seu WhatsApp?",
    placeholder: () => "(11) 99999-9999",
    validar: (v) => (v.replace(/\D/g, "").length >= 10 ? null : "Informe um telefone com DDD."),
    resumo: (v) => v.trim(),
  },
  {
    id: "empresa",
    pergunta: 7,
    tipo: "texto",
    input: "text",
    aplica: (ctx) => ctx.respostas.cliente_tipo !== "suporte",
    texto: (ctx) => {
      const s = sugerirEmpresa(ctx.respostas.email ?? "");
      return s ? `É essa a sua empresa? ${s}` : "Qual o nome da sua empresa?";
    },
    placeholder: () => "Empresa",
    validar: (v) => (v.trim().length >= 2 ? null : "Informe a empresa."),
    resumo: (v) => v.trim(),
  },
];

// chute editável do nome da empresa pelo domínio (mesma heurística do LeadForm)
export function sugerirEmpresa(email: string): string {
  const dominio = email.split("@")[1]?.toLowerCase().trim();
  if (!dominio) return "";
  const base = dominio.split(".")[0];
  if (!base) return "";
  return base
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// próxima etapa sem resposta (null = conversa completa)
export function proximaEtapa(ctx: Contexto): Etapa | null {
  for (const e of ETAPAS) {
    if (!e.aplica(ctx)) continue;
    if (ctx.respostas[e.id] === undefined) return e;
  }
  return null;
}

// etapas já respondidas, na ordem do fluxo (é o histórico que aparece na tela)
export function etapasRespondidas(ctx: Contexto): Etapa[] {
  return ETAPAS.filter((e) => e.aplica(ctx) && ctx.respostas[e.id] !== undefined);
}

// apaga a resposta de `id` e de tudo que vem depois dela no fluxo
export function refazerDesde(respostas: Respostas, id: keyof Respostas): Respostas {
  const idx = ETAPAS.findIndex((e) => e.id === id);
  const novo: Respostas = { ...respostas };
  ETAPAS.slice(idx).forEach((e) => {
    delete novo[e.id];
  });
  // "corrigir" na coerência manda refazer porte: a resposta da coerência some junto
  return novo;
}

// a pessoa pediu suporte: fim sem lead
export function encerradoPorSuporte(r: Respostas): boolean {
  return r.cliente_tipo === "suporte";
}

export const LINK_SUPORTE = "https://www.sysaid.com/support";
