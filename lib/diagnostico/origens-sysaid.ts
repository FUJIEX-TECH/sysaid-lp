// ==========================================================================
// Qualifica v2 · ORIGEM DA CAMPANHA → CONVERSA (24/11/2026, sysaid-growth, pedido
// do Fernando: "identificar de onde veio a campanha e começar já a conversa com o
// assunto referente à campanha").
//
// Duas coisas moram aqui, as duas só dados e funções puras (imports relativos,
// roda nos testes sem navegador):
//   1. as REGRAS de origem (sinais da URL → origem + variáveis): comparativa por
//      concorrente (página /movidesk, página de entrada, ?de=, utm_term, utm_content,
//      utm_campaign, referrer), marca (Brand), paga genérica, intenção de preço, canal;
//   2. o que muda na conversa por origem: abertura, frase do cabeçalho, 1ª pergunta
//      e os CHIPS de dor de cada concorrente (dores reais de quem sai dele, pela
//      pesquisa `_growth/pesquisa-dores-itsm-2026-11-12.md` e pelas comparativas da LP).
//
// Regras do conteúdo (as mesmas da busca genérica):
// - o chip é a voz do lead ("Qualquer ajuste no Movidesk vira projeto"): nunca uma
//   afirmação nossa sobre o concorrente; nada que não esteja em avaliação pública;
// - nada de reunião, agenda, horário, comercial ou especialista antes do fechamento;
// - sem preço; o nome do concorrente aparece na tela e no /admin, e no documento vira
//   "a ferramenta atual" (MASCARA_PDF);
// - a dor de cada chip é uma das DORES de generica-sysaid.ts (capacidades C1–C10 reais).
// ==========================================================================

import type { Condicao, Opcao, OrigemRegra, Texto } from "../conversa-core/tipos";
import type { DorId } from "./generica-sysaid";

export const LINK_SUPORTE = "https://www.sysaid.com/support";

// --------------------------------------------------------------------------
// 1. Concorrentes com página comparativa na LP (slug = rota /<slug> e ?de=<slug>)
// --------------------------------------------------------------------------
// `curto`: como chamar depois da 1ª menção (ex.: "Jira" no lugar de "Jira Service Management")
export type Concorrente = { slug: string; nome: string; termos: string[]; curto?: string };
export const CONCORRENTES: Concorrente[] = [
  { slug: "movidesk", nome: "Movidesk", termos: ["movidesk", "movi desk"] },
  { slug: "topdesk", nome: "TOPdesk", termos: ["topdesk", "top desk"] },
  { slug: "freshdesk", nome: "Freshdesk", termos: ["freshdesk", "fresh desk"] },
  { slug: "freshservice", nome: "Freshservice", termos: ["freshservice", "fresh service"] },
  { slug: "glpi", nome: "GLPI", termos: ["glpi"] },
  { slug: "jira", nome: "Jira Service Management", termos: ["jira"], curto: "Jira" },
  { slug: "zendesk", nome: "Zendesk", termos: ["zendesk"] },
  { slug: "servicenow", nome: "ServiceNow", termos: ["servicenow", "service now"] },
  { slug: "manageengine", nome: "ManageEngine ServiceDesk Plus", termos: ["manageengine", "manage engine", "servicedesk plus"] },
];
export const nomeCurtoConcorrente = (nome: string | null | undefined): string => (nome ? CONCORRENTES.find((c) => c.nome === nome)?.curto ?? nome : "");
export const concorrentePorSlug = (slug: string | null | undefined): Concorrente | undefined => CONCORRENTES.find((c) => c.slug === slug);

export const ORIGENS_REGRAS: OrigemRegra[] = [
  // comparativa: página /movidesk, página de entrada, ?de=movidesk, termo/anúncio/campanha com o nome, ou veio da comparativa
  ...CONCORRENTES.map(
    ({ slug, nome, termos, curto }): OrigemRegra => ({
      id: `comp-${slug}`,
      quando: {
        alguma: [
          { caminho: slug },
          { entrada: slug },
          { parametro: { de: slug } },
          { utm_term: { contem: termos } },
          { utm_content: { contem: termos } },
          { utm_campaign: { contem: termos } },
          { referrer: { contem: `/${slug}` } },
        ],
      },
      origem: "comparativa",
      variaveis: { concorrente: nome, concorrente_curto: curto ?? nome, slug },
    })
  ),
  // marca: campanha Brand ou termo com "sysaid" (quem já conhece; muitas vezes cliente querendo suporte)
  { id: "brand", quando: { alguma: [{ utm_campaign: { contem: "brand" } }, { utm_term: { contem: ["sysaid", "sys aid"] } }, { parametro: { de: "brand" } }] }, origem: "brand", variaveis: { canal: "busca pela SysAid" } },
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

// sem `sinaisExtras` aqui (é função de navegador, config-sysaid.ts liga lib/utm.ts)
export const ORIGENS_SYSAID = {
  padrao: "generica",
  lembrar: "qualifica_sysaid",
  regras: ORIGENS_REGRAS,
  porSlug: Object.fromEntries(CONCORRENTES.map((c) => [c.slug, { origem: "comparativa", variaveis: { concorrente: c.nome, concorrente_curto: c.curto ?? c.nome, slug: c.slug } }])),
};

// --------------------------------------------------------------------------
// 2. Chips da 1ª pergunta por origem. `dor` = DORES de generica-sysaid.ts.
//    Fonte: pesquisa de dores (seção 3: D2 complexidade, D3 relatório, D4 SLA,
//    D5 suporte, D6 custo, D7 ativos) + as seções "o que trava" das comparativas.
// --------------------------------------------------------------------------
export type ChipOrigem = { texto: string; dor: DorId };

const T = (texto: string, dor: DorId): ChipOrigem => ({ texto, dor });

// molde pra concorrente sem pesquisa própria (as 4 dores mais comuns de quem troca, na ordem da pesquisa)
export const chipsMolde = (nome: string): ChipOrigem[] => [
  T(`Qualquer ajuste no ${nome} vira projeto`, "complexidade"),
  T("Os números que a diretoria pede não saem prontos", "relatorio"),
  T("O prazo estoura sem ninguém ver", "sla"),
  T("A conta só sobe, e o que a TI precisa fica à parte", "custo"),
];

export const CHIPS_COMPARATIVA: Record<string, ChipOrigem[]> = {
  // Movidesk: curva de configuração (Capterra/B2B Stack), indicadores confusos, instabilidade e suporte (B2B Stack, G2), custo-benefício
  movidesk: [
    T("Qualquer ajuste no Movidesk vira projeto", "complexidade"),
    T("Os números que a diretoria pede não saem prontos", "relatorio"),
    T("Tem instabilidade, e o suporte demora", "suporte"),
    T("A conta só sobe, e o que a TI precisa fica à parte", "custo"),
  ],
  // TOPdesk: configuração e modelagem que tomam tempo (G2), resolução ainda manual, preço por agente, fornecedor em outro fuso (LP)
  topdesk: [
    T("Configurar o TOPdesk toma tempo demais do time", "complexidade"),
    T("A dúvida repetida ainda cai na fila do analista", "ia"),
    T("Cada técnico novo e cada recurso pesam na conta", "custo"),
    T("Suporte e cotação ficam longe, em outro fuso", "suporte"),
  ],
  // Freshdesk: ferramenta de atendimento ao cliente na função de ITSM (LP): plano de cima e add-on, ativos fora, aprovação costurada, analytics de CX
  freshdesk: [
    T("O que a TI precisa fica no plano de cima ou em add-on", "custo"),
    T("Ativos e licenças ficam fora do chamado", "ativos"),
    T("Montar uma aprovação é costurar regra de automação", "complexidade"),
    T("Os relatórios são de atendimento, não da operação de TI", "relatorio"),
  ],
  // Freshservice: personalização limitada e curva de aprendizado (G2), recurso avançado no plano caro, IA cobrada à parte (LP)
  freshservice: [
    T("Personalizar o Freshservice chega no limite rápido", "complexidade"),
    T("O recurso que a TI precisa está no plano de cima", "custo"),
    T("Entender a carga do suporte é juntar planilha", "relatorio"),
    T("O prazo estoura sem ninguém ver", "sla"),
  ],
  // GLPI: plugin, atualização e PHP dependem de uma pessoa (Capterra/G2), relatório e auditoria fracos, sem suporte oficial
  glpi: [
    T("Plugin e atualização do GLPI dependem de uma pessoa", "complexidade"),
    T("Relatório e auditoria saem na mão", "relatorio"),
    T("Sem suporte oficial: a gente se vira sozinho", "suporte"),
    T("O prazo estoura sem ninguém ver", "sla"),
  ],
  // Jira Service Management: curva de aprendizado e configuração (G2), dado de SLA por filtro e exportação, custo total crescente
  jira: [
    T("Configurar o Jira pede alguém dedicado", "complexidade"),
    T("Tirar o dado de SLA é filtro e exportação", "relatorio"),
    T("O custo total só cresce", "custo"),
    T("O prazo estoura sem ninguém ver", "sla"),
  ],
  // Zendesk: ferramenta de CX na TI (LP): plano de cima, sem inventário, acesso e aprovação à mão, relatórios de atendimento
  zendesk: [
    T("O que a TI precisa fica no plano de cima", "custo"),
    T("Sem inventário ligado ao chamado", "ativos"),
    T("Acesso e aprovação continuam feitos à mão", "automacao"),
    T("Os relatórios são de atendimento, não da operação de TI", "relatorio"),
  ],
  // ServiceNow: licença pesada pro porte, ajuste depende de consultoria (LP /servicenow)
  servicenow: [
    T("A licença pesa demais pro tamanho do time", "custo"),
    T("Qualquer ajuste depende de consultoria", "complexidade"),
    T("Os números que a diretoria pede não saem prontos", "relatorio"),
    T("O prazo estoura sem ninguém ver", "sla"),
  ],
  manageengine: chipsMolde("ServiceDesk Plus"),
};

// marca (Brand): quem busca "sysaid" é cliente querendo suporte, cliente querendo
// módulo novo, ou alguém com outra ferramenta (ou sem) que já ouviu falar
export const CHIP_BRAND_SUPORTE = "Já uso a SysAid e preciso de suporte";
export const CHIP_BRAND_MODULOS = "Já uso a SysAid e quero conhecer módulos novos";
export const CHIPS_BRAND: ChipOrigem[] = [
  T("Temos outra ferramenta, e ela dá mais trabalho do que resolve", "complexidade"),
  T("Pedido chega por WhatsApp, e-mail e pessoalmente, e se perde", "perda"),
];
// "módulos novos": o que o cliente quer evoluir (vira a dor do caso; o resto do fluxo segue)
export const OPCOES_MODULOS: Opcao[] = [
  { valor: "ia", rotulo: "IA que tria e responde o que se repete" },
  { valor: "esm", rotulo: "Outras áreas (RH, Facilities) atendendo do mesmo jeito" },
  { valor: "ativos", rotulo: "Ativos e inventário ligados ao chamado" },
  { valor: "automacao", rotulo: "Pedido repetido andando sozinho" },
];

export function chipsDaOrigem(origem: string, slug: string | null | undefined): ChipOrigem[] {
  if (origem === "comparativa") {
    const c = concorrentePorSlug(slug);
    return CHIPS_COMPARATIVA[slug ?? ""] ?? chipsMolde(c?.nome ?? "a ferramenta de hoje");
  }
  if (origem === "brand") return CHIPS_BRAND;
  return [];
}
// todos os chips de origem, texto → dor (entra no CHIP_DOR de generica-sysaid.ts)
export const CHIP_DOR_ORIGENS: Record<string, DorId> = Object.fromEntries([...Object.values(CHIPS_COMPARATIVA).flat(), ...CHIPS_BRAND].map((c) => [c.texto, c.dor]));
export const chipsOpcoes = (chips: ChipOrigem[]): Opcao[] => chips.map((c) => ({ valor: c.texto, rotulo: c.texto }));

// --------------------------------------------------------------------------
// 3. Abertura, frase do cabeçalho e 1ª pergunta por origem (Texto com casos)
// --------------------------------------------------------------------------
const COMP: Condicao = { variavel: "concorrente", definida: true };
const PRECO: Condicao = { variavel: "intencao", igual: "preco" };
const COMP_PRECO: Condicao = { todas: [COMP, PRECO] };
const BRAND: Condicao = { origem: "brand" };

export const ABERTURA_ORIGENS: Texto[] = [
  {
    padrao: "Oi. Vamos achar o melhor caminho pra sua TI.",
    casos: [
      { quando: COMP_PRECO, texto: "Oi. Veio ver o que muda na conta saindo do {{concorrente}}?" },
      { quando: COMP, texto: "Oi. Pensando em sair do {{concorrente}}?" },
      { quando: BRAND, texto: "Oi, que bom ter você por aqui." },
      { quando: PRECO, texto: "Oi. Procurando o investimento numa ferramenta de chamados?" },
    ],
  },
  {
    padrao: "No fim você leva o mapa do seu caso: quanto tempo isso tira do time e por onde começar.",
    casos: [
      { quando: COMP, texto: "O que está pesando aí tem jeito. No fim você leva o documento do seu caso: o que muda saindo do {{concorrente_curto}} e por onde começar." },
      { quando: BRAND, texto: "Suporte, módulos novos ou troca de ferramenta: me diz o que você precisa e eu te levo pro caminho certo." },
      { quando: PRECO, texto: "O investimento sai do tamanho do time, então primeiro o que pesa aí. No fim você leva o mapa do seu caso." },
    ],
  },
];

export const FRASE_CABECALHO_ORIGENS: Texto = {
  padrao: "Atendimento de TI sem chamado perdido.",
  casos: [
    { quando: COMP_PRECO, texto: "O que muda na conta se você sair do {{concorrente_curto}}." },
    { quando: COMP, texto: "O que muda se você sair do {{concorrente_curto}}." },
    { quando: BRAND, texto: "Suporte, módulos novos ou troca de ferramenta." },
    { quando: PRECO, texto: "Primeiro o que a sua TI precisa, depois o investimento." },
  ],
};

export const PERGUNTA1_ORIGENS: Texto = {
  padrao: "Qual é o maior problema no atendimento de TI aí hoje?",
  casos: [
    { quando: COMP, texto: "O que está pesando no {{concorrente_curto}} hoje?" },
    { quando: BRAND, texto: "Como está o atendimento de TI aí hoje?" },
    { quando: PRECO, texto: "Antes do investimento: qual é o maior problema no atendimento de TI aí hoje?" },
  ],
};

export const PLACEHOLDER1_ORIGENS: Texto = {
  padrao: "Ou escreve do seu jeito",
  casos: [
    { quando: COMP, texto: "Ou escreve do seu jeito. Ex.: o relatório não mostra o que o gestor pede" },
    { quando: BRAND, texto: "Ou escreve do seu jeito. Ex.: chega por e-mail e a gente anota numa planilha" },
  ],
};

// os chips da 1ª pergunta: um caso por concorrente (texto fixo com o nome), um pra marca; o resto, os 4 da busca genérica
export function atalhosPorOrigem(chipsGenerica: Opcao[]): { padrao: Opcao[]; casos: { quando: Condicao; opcoes: Opcao[] }[] } {
  return {
    padrao: chipsGenerica,
    casos: [
      ...CONCORRENTES.map((c) => ({ quando: { variavel: "slug", igual: c.slug }, opcoes: chipsOpcoes(chipsDaOrigem("comparativa", c.slug)) })),
      { quando: BRAND, opcoes: [{ valor: CHIP_BRAND_SUPORTE, rotulo: CHIP_BRAND_SUPORTE }, { valor: CHIP_BRAND_MODULOS, rotulo: CHIP_BRAND_MODULOS }, ...chipsOpcoes(CHIPS_BRAND)] },
    ],
  };
}

// rótulo da origem pra ficha, notas e /admin
export function rotuloOrigem(origem: string | null | undefined, variaveis: Record<string, string | null | undefined> = {}): string {
  if (origem === "comparativa") return `Comparativa · ${variaveis.concorrente ?? "concorrente"}`;
  if (origem === "brand") return "Marca (busca pela SysAid)";
  if (origem === "generica") return variaveis.intencao === "preco" ? "Busca genérica · preço" : "Busca genérica";
  return origem ?? "";
}
