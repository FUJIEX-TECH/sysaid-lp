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
import { isCorporateEmail, CORPORATE_EMAIL_ERROR } from "@/lib/email-domains";
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
  if (ctx.variaveis.concorrente && r.situacao === "troca") return `${ctx.variaveis.concorrente} hoje`;
  const f = rotuloFerramenta(ctx);
  return f ? `${f} hoje` : "hoje";
}

// v2: o nó "onde você está" do mapa (precisa fazer sentido sozinho)
function atualNoMapa(ctx: Contexto): string {
  const r = ctx.respostas;
  if (r.situacao === "cliente") return "SysAid hoje";
  if (r.situacao === "sem" || r.ferramenta === "planilha") return "E-mail, planilha e WhatsApp";
  if (r.situacao === "pesquisa") return "Pesquisando ITSM";
  if (ctx.variaveis.concorrente && r.situacao === "troca") return `${ctx.variaveis.concorrente} hoje`;
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

export const configSysaid: ConfigConversa = {
  id: "sysaid-diagnostico-itsm",
  marca: { titulo: "SysAid · Diagnóstico ITSM", rotuloRegiao: "Diagnóstico ITSM em 2 minutos", subtitulo: "Em 2 minutos, o mapa do seu problema" },
  // tokens da LP (globals.css): verde #175d4a, menta #6bd9b9, lima, tinta
  tema: {
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
  },
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
    empresa_nome: (ctx) => (ctx.empresa && ctx.empresa.origem !== "fallback" ? ctx.empresa.nome : sugerirEmpresa(ctx.respostas.email ?? "")),
    saudacao: (ctx) => {
      const n = primeiroNome(ctx.respostas.nome);
      return n ? `, ${n}` : "";
    },
  },

  validadores: {
    // trava de 09/09/2026: só e-mail corporativo avança (o servidor confere de novo)
    email_corporativo: (v) => (isCorporateEmail(v) ? null : CORPORATE_EMAIL_ERROR),
  },

  // v2: a abertura muda com a origem (campanha, termo, página). Copy a revisar pelo sysaid-growth.
  abertura: [
    {
      padrao: "Diagnóstico em 2 minutos: veja o que mudaria pra você.",
      casos: [
        {
          quando: { todas: [{ variavel: "concorrente", definida: true }, { variavel: "intencao", igual: "preco" }] },
          texto: "Veio ver o custo do {{concorrente}}? Em 2 minutos eu te mostro o que mudaria na conta e na operação se você trocasse.",
        },
        { quando: { variavel: "concorrente", definida: true }, texto: "Em 2 minutos eu te mostro o que mudaria se você saísse do {{concorrente}}." },
        { quando: { origem: "brand" }, texto: "Você já conhece a SysAid. Me diz onde você está hoje e eu te levo pro caminho certo." },
        { quando: { variavel: "intencao", igual: "preco" }, texto: "Procurando preço de ITSM? Antes do número, 2 minutos pra ver o que você precisa de verdade." },
      ],
    },
    "São 7 perguntas rápidas, quase tudo por botão. No fim você recebe o mapa do seu problema.",
  ],

  etapas: [
    {
      id: "email",
      passo: 1,
      tipo: "texto",
      input: "email",
      texto: "Pra começar: qual o seu e-mail corporativo?",
      placeholder: "voce@suaempresa.com.br",
      validar: [{ regra: "email", mensagem: "Informe um e-mail válido." }, { regra: "custom", nome: "email_corporativo" }],
      normalizar: "minusculas",
    },
    {
      // v2: nome sugerido pela parte local do e-mail (mariana.costa@ → Mariana Costa), editável;
      // daqui em diante a conversa chama a pessoa pelo nome
      id: "nome",
      passo: 1,
      tipo: "texto",
      input: "text",
      autoComplete: "name",
      texto: {
        padrao: "Como você prefere ser chamado(a)?",
        casos: [{ quando: { variavel: "nome_sugerido", definida: true }, texto: "Posso te chamar de {{nome_sugerido}}? Se preferir outro nome, é só corrigir." }],
      },
      placeholder: "Seu nome",
      prefill: "nome_sugerido",
      confirmarRotulo: "Pode, sim",
      recuperarAoCorrigir: true,
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Informe seu nome." }],
    },
    {
      // v2: a empresa lida pelo domínio do e-mail (site, logo, redes, CNPJ) aparece num
      // cartão (painel "empresa") pra pessoa confirmar; sem leitura, fica o chute pelo domínio
      id: "empresa",
      passo: 1,
      tipo: "texto",
      input: "text",
      autoComplete: "organization",
      texto: {
        padrao: "Qual o nome da sua empresa?",
        casos: [
          // regra do produto (Fernando, 30/10): o chat não anuncia de onde tirou o dado; só confirma
          { quando: { empresaEncontrada: true }, texto: "É essa a sua empresa{{saudacao}}?" },
          { quando: { variavel: "empresa_sugerida", definida: true }, texto: "É essa a sua empresa? {{empresa_sugerida}}" },
        ],
      },
      placeholder: "Empresa",
      prefill: "empresa_nome",
      confirmarRotulo: "Sim, é essa",
      recuperarAoCorrigir: true,
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Informe a empresa." }],
    },
    {
      id: "situacao",
      passo: 2,
      tipo: "escolha",
      texto: {
        padrao: "Qual a sua situação hoje?",
        casos: [{ quando: { variavel: "concorrente", definida: true }, texto: "Você usa {{concorrente}} hoje?" }],
      },
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
              { valor: "troca", rotulo: "Uso hoje e penso em trocar" },
              { valor: "sem", rotulo: "Avaliei e não escolhi" },
              { valor: "pesquisa", rotulo: "Só estou comparando" },
            ],
          },
          {
            // v2: quem buscou pela marca costuma já ser cliente
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
      // 2b: só quando vai trocar e a ferramenta ainda não veio da URL
      id: "ferramenta",
      passo: 2,
      tipo: "escolha",
      quando: { todas: [{ campo: "situacao", igual: "troca" }, { nao: { variavel: "concorrente", definida: true } }] },
      texto: "Qual ferramenta vocês usam hoje?",
      opcoes: { catalogo: "ferramentas" },
      resumo: { template: "{{ferramenta_rotulo}}" },
    },
    {
      id: "ferramenta_outra",
      passo: 2,
      tipo: "texto",
      input: "text",
      quando: { campo: "ferramenta", igual: "outra" },
      texto: "Qual é a ferramenta?",
      placeholder: "Nome da ferramenta",
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Informe o nome da ferramenta." }],
    },
    {
      id: "cliente_tipo",
      passo: 2,
      tipo: "escolha",
      quando: { campo: "situacao", igual: "cliente" },
      texto: "Que bom ter você por aqui. É suporte ou quer conhecer módulos novos?",
      opcoes: [
        { valor: "suporte", rotulo: "Preciso de suporte" },
        { valor: "modulos", rotulo: "Quero conhecer módulos novos" },
      ],
    },
    {
      id: "dor_texto",
      passo: 3,
      tipo: "texto",
      input: "textarea",
      quando: NAO_SUPORTE,
      texto: "O que mais te incomoda hoje no atendimento de TI? Pode escrever do seu jeito.",
      placeholder: {
        padrao: "ex.: o SLA estoura e ninguém é avisado",
        casos: [
          { quando: { campo: "situacao", igual: "sem" }, texto: "ex.: chamados se perdem no WhatsApp" },
          { quando: { variavel: "intencao", igual: "preco" }, texto: "ex.: pagamos por técnico e por módulo, e o custo subiu com o dólar" },
          { quando: { variavel: "concorrente", definida: true }, texto: "ex.: o relatório do {{concorrente}} não mostra o que o gestor pede" },
        ],
      },
      validar: [{ regra: "minCaracteres", valor: 15, mensagem: "Conta um pouco mais (pelo menos 15 caracteres) ou escolha de uma lista." }],
      pular: { rotulo: "Prefiro escolher de uma lista", valor: "" },
      recuperarAoCorrigir: true,
    },
    {
      // parte 2: o palpite escrito pela LLM a partir da dor que o Jev leu no texto.
      // Só aparece se a geração chegou a tempo e o texto não mudou; "É isso" grava
      // em `dor` o valor decidido pelo Jev (a LLM nunca classifica) e pula a lista.
      id: "palpite",
      passo: 3,
      tipo: "escolha",
      quando: { todas: [NAO_SUPORTE, { campo: "dor_texto", vazio: false }, { gerado: "palpite", disponivel: true }] },
      texto: "Deixa eu ver se entendi.",
      gerado: { id: "palpite", texto: "palpite" },
      opcoes: [
        { valor: "sim", rotulo: "É isso" },
        { valor: "nao", rotulo: "Não é bem isso" },
      ],
      aoResponder: [{ valor: "sim", definir: { campo: "dor", deGerado: { id: "palpite", dado: "dor" } } }],
    },
    {
      // fallback da dor (sem Jev lendo o texto, ou palpite errado): a pessoa confirma a dor na lista.
      // Palpite confirmado já gravou `dor`: a lista nem entra no histórico.
      id: "dor",
      passo: 3,
      tipo: "escolha",
      quando: { todas: [NAO_SUPORTE, { nao: { campo: "palpite", igual: "sim" } }] },
      texto: {
        padrao: "Qual destas parece mais com o seu dia?",
        casos: [{ quando: { campo: "dor_texto", vazio: false }, texto: "Entendi. Qual destas parece mais com o que você descreveu?" }],
      },
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
      passo: 4,
      tipo: "escolha",
      quando: { todas: [{ campo: "dor", definido: true }, { campo: "dor", diferente: "vaga" }, NAO_SUPORTE] },
      texto: "",
      variantes: { porCampo: "dor", casos: aprofundamentoVariantes },
      // parte 2: pergunta e 3 opções escritas pela LLM junto com o palpite; só
      // valem se `dor` ainda é a que o Jev leu (senão, a pergunta fixa acima)
      gerado: { id: "palpite", texto: "pergunta", opcoes: "opcoes", seIgual: { campo: "dor", dado: "dor" } },
    },
    {
      id: "usuarios",
      passo: 5,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "Quantas pessoas a TI atende?",
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
      passo: 5,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "E quantos técnicos ou administradores cuidam disso?",
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
      passo: 5,
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
      passo: 6,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "Qual o seu papel nessa decisão?",
      opcoes: [
        { valor: "decide", rotulo: "Decido" },
        { valor: "influencia", rotulo: "Avalio e recomendo" },
        { valor: "levanta", rotulo: "Me pediram pra levantar opções" },
        { valor: "estuda", rotulo: "Estudante / curiosidade" },
      ],
    },
    {
      id: "prazo",
      passo: 6,
      tipo: "escolha",
      quando: NAO_SUPORTE,
      texto: "E quando pretende mudar?",
      opcoes: [
        { valor: "tri", rotulo: "Neste trimestre" },
        { valor: "6m", rotulo: "Próximos 6 meses" },
        { valor: "sem", rotulo: "Sem data" },
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
      texto: "Pra te mandar o mapa{{saudacao}}: qual o seu WhatsApp?",
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
  },

  // v2: painéis gerados por código. Empresa com a pergunta de confirmação; porte
  // logo depois do nº de pessoas (e cresce com os técnicos); mapa fixo na lateral
  // no desktop (cresce a cada resposta) e, no celular, no passo "mapa".
  paineis: [
    { id: "empresa", tipo: "empresa", apos: "empresa", quando: { empresaEncontrada: true } },
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
      { rotulo: "Ferramenta hoje", texto: "{{ferramenta_rotulo}}" },
      { rotulo: "O problema", texto: "{{resumo.dor}}" },
      { rotulo: "No dia a dia", texto: "{{resumo.aprof}}" },
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
      // capricho: texto da dor com 60+ caracteres e tempo total entre 90 s e 12 min
      { id: "capricho", quando: { todas: [{ campo: "dor_texto", minCaracteres: 60 }, { tempoTotalEntre: [90, 12 * 60] }] }, pontos: 1 },
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
            gatilho: { campo: "dor_texto", minCaracteres: 25, debounceMs: 600, passoCaracteres: 20 },
            esperaMs: 900,
            timeoutMs: 8000,
          },
        ]
      : [],

  textos: {
    enviando: "Perfeito{{saudacao}}. Estou mandando o seu mapa e já te levo pra confirmação.",
    erro: "Não consegui enviar agora. Confira o e-mail e tente de novo em instantes.",
    tentarDeNovo: "Tentar de novo",
    legal: "Ao enviar, você concorda em ser contatado pela SysAid. Sem spam.",
    corrigirDica: "Tocar pra corrigir esta resposta.",
    passoAria: "Pergunta {{passo}} de {{total}}",
    enviar: "Enviar",
    corrigir: "corrigir",
  },

  Cena: CenaPlaceholder,
};
