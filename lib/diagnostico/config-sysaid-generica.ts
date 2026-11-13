// ==========================================================================
// Qualifica v2 · BUSCA GENÉRICA ("sistema de chamados", "help desk"...) —
// CONFIGURAÇÃO da SysAid pro núcleo (lib/conversa-core). 13/11/2026, Severino,
// com o fluxo fechado pelo Fernando (backlog do sysaid-growth, 13/11) e as falas,
// capacidades e cenas do sysaid-growth:
//   clientes/sysaid/_growth/qualifica-fluxo-generico-conteudo-2026-11-13.md
// Dono do conteúdo: sysaid-growth (troca textos aqui e em generica-sysaid.ts).
//
// O fluxo (SPIN): problema (chips + texto) → cena da dor + implicação afirmada
// ("É isso / Tem mais / Não é bem isso") → [outras dores] → consequência
// (múltipla; pulada se o Jev leu no texto) → "O nome disso" → e-mail →
// "É a Empresa, Nome?" → papel na decisão + cargo → [ferramenta, só se tem e
// não disse qual] → a cena com o logo da empresa → pessoas, técnicos, tempo →
// a conta → need-payoff (múltipla) → revelação ("a SysAid atende o que vocês
// precisam") → WhatsApp (o documento começa a ser montado) → resumo de 2
// linhas + reunião (2 horários) | "Quero orçamento" | "Converse comigo por
// WhatsApp" → o documento (PDF).
//
// As outras origens (comparativa, marca, preço) seguem com config-sysaid.ts;
// quem escolhe é escolher-config.ts.
// ==========================================================================

import type { ConfigConversa, Contexto, EtapaConfig, Opcao } from "@/lib/conversa-core";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import {
  CHIP_DOR,
  CONSEQUENCIAS,
  CONSEQUENCIAS_IDS,
  DORES,
  DORES_CHIP,
  FERRAMENTAS_CHIP,
  OPCOES_CONSEQUENCIA,
  OPCOES_DOR_CHIP,
  REGRAS_HORARIO,
  TEMPO_MES,
  TEMPO_SEMANA,
  capacidadesDoCaso,
  consequencias,
  conta,
  dorAtual,
  dorP1,
  dorPrincipal,
  dores,
  horariosPedidos,
  opcoesPayoff,
  payoffs,
  pedido,
  perguntaFerramenta,
  perguntaPayoff,
  resumoDuasLinhas,
  revelacao,
  type DorId,
} from "@/lib/diagnostico/generica-sysaid";
import {
  CARTOES_GENERICA,
  PERGUNTAS_DIRETORIA,
  implicacaoDoCaso,
  itensCausa,
  itensComoResolve,
  itensDiretoria,
  itensOQuePesa,
  legendaHoras,
  textoLeitura,
  textoProximoPasso,
} from "@/lib/diagnostico/cartoes-generica-sysaid";
import { geradoValido } from "@/lib/conversa-core";

const base = configSysaid;
const LLM_LIGADO = process.env.NEXT_PUBLIC_DIAG_LLM === "1";

const empresaDe = (ctx: Contexto) => (ctx.respostas.empresa ?? "").trim();
const ehDor = (v: unknown): v is DorId => typeof v === "string" && v in DORES;

// dor do passo 1 sem a lista "pra eu não chutar" (chip ou Jev): a lista só aparece sem isto
function dorP1Auto(ctx: Contexto): DorId | null {
  const chip = CHIP_DOR[(ctx.respostas.situacao_texto ?? "").trim()];
  if (chip) return chip;
  const j = geradoValido(ctx, "implicacao") ? ctx.gerados?.implicacao?.dados?.dor : undefined;
  return ehDor(j) ? j : null;
}
function dorReleituraJev(ctx: Contexto): DorId | null {
  const j = geradoValido(ctx, "releitura") ? ctx.gerados?.releitura?.dados?.dor : undefined;
  return ehDor(j) ? j : null;
}

// a implicação do passo 2: a do Haiku (com as palavras da pessoa) se chegou e é da mesma dor; senão a de reserva
function implicacaoFrase(ctx: Contexto): string {
  const d = dorP1(ctx);
  if (!d) return "";
  const g = ctx.gerados?.implicacao;
  if (g && geradoValido(ctx, "implicacao") && g.dados?.dor === d && g.textos?.implicacao) return g.textos.implicacao;
  return DORES[d].implicacao;
}

const CHIPS_DOR: Opcao[] = DORES_CHIP.map((d) => ({ valor: DORES[d].chip!, rotulo: DORES[d].chip! }));
const RESUMO_USUARIOS = { "50": "Até 50 pessoas", "200": "51 a 200 pessoas", "1000": "201 a 1.000 pessoas", mais: "Mais de 1.000 pessoas" };

// e-mail, confirmação, nome, empresa, técnicos, coerência e WhatsApp são as etapas da config de
// sempre (mesma trava, mesmas reservas). A condição "não é suporte" delas vale sempre aqui
// (este fluxo não tem a pergunta de cliente), então ficam como estão.
const pega = (id: string): EtapaConfig => {
  const e = base.etapas.find((x) => x.id === id);
  if (!e) throw new Error(`etapa ${id} sumiu de config-sysaid.ts`);
  return e;
};

const HORARIOS = {
  ...REGRAS_HORARIO,
  rotulos: { opcao: "{{n}}ª opção", dia: "Dia", hora: "Hora", confirmar: "Enviar horários" },
  mensagens: {
    incompleto: "Escolhe o dia e a hora das duas opções.",
    invalido: "Esse horário não dá. Escolhe um dia útil, das 9h às 18h, a partir do próximo dia útil.",
    repetido: "As duas opções estão iguais. Escolhe um segundo horário diferente.",
  },
};
const NOTA_HORARIOS = "Dias úteis, das 9h às 18h, a partir do próximo dia útil.";
const ALT_ORCAMENTO: Opcao = { valor: "orcamento", rotulo: "Quero orçamento" };
const ALT_WHATSAPP: Opcao = { valor: "whatsapp", rotulo: "Converse comigo por WhatsApp" };
const CONSEQUENCIA_LIDA = (id: string) => ({ decisao: id, dado: "consequencia", em: CONSEQUENCIAS_IDS as string[] });

// nada pessoal vai pras gerações (o servidor também não repassa pro Jev nem pro Haiku)
const PESSOAIS = ["email", "nome", "empresa", "telefone", "cargo", "confirma"];
const RESUMO_TECNICOS: Record<string, string> = { "1-2": "1 a 2 técnicos", "3-10": "3 a 10 técnicos", "+10": "mais de 10 técnicos" };

// o que a leitura do caso recebe (texto, sem dado pessoal; a empresa é "a empresa")
function entradaLeitura(ctx: Contexto): Record<string, string> {
  const p = dorPrincipal(ctx);
  const c = conta(ctx);
  const cs = consequencias(ctx).map((x) => CONSEQUENCIAS[x].triste.toLowerCase());
  const quer = payoffs(ctx).map((x) => CONSEQUENCIAS[x].forma);
  const r = ctx.respostas;
  return {
    dor_principal: p ? DORES[p].nome : "",
    outras_dores: dores(ctx)
      .filter((d) => d !== p)
      .map((d) => DORES[d].nome)
      .join(", "),
    implicacao: implicacaoDoCaso(ctx),
    consequencias: cs.join(", "),
    quer: quer.join(", "),
    horas: c ? (c.medido ? `${c.diasTexto} dias de trabalho do time por ano (≈ ${c.hMesTexto} h por mês), pela conta da equipe` : "ninguém mede hoje") : "",
    porte: [RESUMO_USUARIOS[r.usuarios as keyof typeof RESUMO_USUARIOS] ?? "", RESUMO_TECNICOS[r.tecnicos ?? ""] ?? ""].filter(Boolean).join(", "),
  };
}

export const configSysaidGenerica: ConfigConversa = {
  ...base,
  id: "sysaid-generica-v2",
  cabecalho: { ...base.cabecalho, frase: "Atendimento de TI sem chamado perdido." },
  totalPassos: 10,

  // [fixo] seção 2, passo 0 (sem exclamação, padrão da casa; "quanto tempo isso tira do time": o cartão é em horas)
  abertura: ["Oi. Vamos achar o melhor caminho pra sua TI.", "No fim você leva o mapa do seu caso: quanto tempo isso tira do time e por onde começar."],

  variaveis: {
    ...base.variaveis,
    dor_p1_auto: (ctx) => dorP1Auto(ctx) ?? "",
    dor_p1: (ctx) => dorP1(ctx) ?? "",
    dor_atual: (ctx) => dorAtual(ctx) ?? "",
    dor_releitura_jev: (ctx) => dorReleituraJev(ctx) ?? "",
    dor_principal: (ctx) => dorPrincipal(ctx) ?? "",
    dor_principal_nome: (ctx) => {
      const d = dorPrincipal(ctx);
      return d ? DORES[d].nome : "o problema";
    },
    varias_dores: (ctx) => (dores(ctx).length > 1 ? "sim" : ""),
    implicacao_frase: implicacaoFrase,
    implicacao2_frase: (ctx) => {
      const d = dorAtual(ctx);
      return d ? DORES[d].implicacao : "";
    },
    nome_disso: (ctx) => {
      const d = dorPrincipal(ctx);
      return d ? DORES[d].nomeFala : "";
    },
    pergunta_ferramenta: (ctx) => (perguntaFerramenta(ctx) ? "sim" : ""),
    payoff_pergunta: perguntaPayoff,
    revelacao: (ctx) => revelacao(ctx, empresaDe(ctx)),
    resumo_caso: (ctx) => resumoDuasLinhas(ctx, empresaDe(ctx)),
    horas_legenda: legendaHoras,
    pedido: (ctx) => pedido(ctx.respostas) ?? "",
    horarios_pedidos: (ctx) => horariosPedidos(ctx.respostas),
    leitura: (ctx) => textoLeitura(ctx, empresaDe(ctx)),
    proximo_passo: textoProximoPasso,
    implicacao_caso: implicacaoDoCaso,
    // o mapa da lateral (seção 2, passo 16), rótulos curtos que cabem em 260 px
    mapa_onde: (ctx) => {
      const e = empresaDe(ctx);
      if (e) return e;
      const d = dorP1(ctx);
      return d ? DORES[d].situacaoCurta : "";
    },
    mapa_pesa: (ctx) => {
      const d = dorPrincipal(ctx);
      return d ? DORES[d].nome.charAt(0).toUpperCase() + DORES[d].nome.slice(1) : "";
    },
    mapa_causa: (ctx) => consequencias(ctx).map((c) => CONSEQUENCIAS[c].curta).join(" · "),
    mapa_custa: (ctx) => {
      const c = conta(ctx);
      if (!c) return "";
      return c.medido ? `${c.diasTexto} dias por ano` : "Ninguém mede hoje";
    },
    mapa_custa_nota: (ctx) => {
      const c = conta(ctx);
      return c?.medido ? `quanto custa · ≈ ${c.hMesTexto} h por mês` : "quanto custa";
    },
    mapa_chegar: (ctx) => {
      const p = payoffs(ctx).map((c) => CONSEQUENCIAS[c].feliz);
      return p.join(" · ");
    },
    mapa_resolve: (ctx) => capacidadesDoCaso(ctx, 3).map((x) => x.cap.curto).join(" · "),
    mapa_passo: (ctx) => {
      const p = pedido(ctx.respostas);
      return p === "reuniao" ? "Reunião com o especialista" : p === "orcamento" ? "Orçamento na reunião" : p === "whatsapp" ? "Conversa pelo WhatsApp" : "";
    },
  },

  etapas: [
    // 1 · Problema: chips + texto [fixo, Jev]
    {
      id: "situacao_texto",
      passo: 1,
      tipo: "texto",
      input: "textarea",
      texto: "Qual é o maior problema no atendimento de TI aí hoje?",
      placeholder: "Ou escreve do seu jeito",
      atalhos: CHIPS_DOR,
      validar: [{ regra: "minCaracteres", valor: 10, mensagem: "Conta um pouco mais, ou toca numa das opções." }],
      recuperarAoCorrigir: true,
    },
    {
      // texto livre e o Jev não decidiu (vaga, ou geração fora): a lista
      id: "dor_lista",
      passo: 1,
      tipo: "escolha",
      quando: { todas: [{ campo: "situacao_texto", definido: true }, { variavel: "dor_p1_auto", definida: false }] },
      texto: "Pra eu não chutar: qual destas chega mais perto?",
      opcoes: OPCOES_DOR_CHIP,
    },
    // 2 · Cena + implicação + "É isso?" (a cena é um cartão depois do passo 1: cartoes-generica-sysaid.ts)
    {
      id: "implicacao",
      passo: 2,
      tipo: "texto",
      input: "text",
      quando: { variavel: "dor_p1", definida: true },
      rotulo: "Pelo que você contou",
      texto: "{{implicacao_frase}} É isso?",
      placeholder: "Ou escreve do seu jeito",
      atalhos: [
        { valor: "sim", rotulo: "É isso" },
        { valor: "mais", rotulo: "Tem mais" },
        { valor: "nao", rotulo: "Não é bem isso" },
      ],
      validar: [{ regra: "minCaracteres", valor: 3, mensagem: "Me conta um pouco mais, ou toca numa das opções." }],
      recuperarAoCorrigir: true,
    },
    {
      // "Não é bem isso": o Jev relê
      id: "dor_releitura",
      passo: 2,
      tipo: "texto",
      input: "textarea",
      quando: { campo: "implicacao", igual: "nao" },
      texto: "Então me conta com as suas palavras: o que mais pesa aí?",
      placeholder: "Ex.: a diretoria pede o relatório e eu monto tudo na mão",
      validar: [{ regra: "minCaracteres", valor: 10, mensagem: "Me conta um pouco mais." }],
      recuperarAoCorrigir: true,
    },
    {
      id: "dor_lista2",
      passo: 2,
      tipo: "escolha",
      quando: { todas: [{ campo: "implicacao", igual: "nao" }, { campo: "dor_releitura", definido: true }, { variavel: "dor_releitura_jev", definida: false }] },
      texto: "Pra eu não chutar: qual destas chega mais perto?",
      opcoes: OPCOES_DOR_CHIP,
    },
    {
      // a dor nova, com a implicação de reserva (sem Haiku) e a cena dela
      id: "implicacao2",
      passo: 2,
      tipo: "escolha",
      quando: { todas: [{ campo: "implicacao", igual: "nao" }, { variavel: "dor_atual", definida: true }] },
      rotulo: "Pelo que você contou",
      texto: "{{implicacao2_frase}} É isso?",
      opcoes: [
        { valor: "sim", rotulo: "É isso" },
        { valor: "mais", rotulo: "Tem mais" },
      ],
    },
    {
      // "Tem mais": as outras dores, múltipla escolha, uma volta só
      id: "dores_mais",
      passo: 2,
      tipo: "multipla",
      quando: { alguma: [{ campo: "implicacao", igual: "mais" }, { campo: "implicacao2", igual: "mais" }] },
      texto: "O que mais pesa aí? Pode marcar mais de um.",
      opcoes: { calcular: (ctx) => OPCOES_DOR_CHIP.filter((o) => o.valor !== dorAtual(ctx)) },
      multipla: { confirmar: "Continuar", min: 1, texto: { placeholder: "Outra coisa" } },
    },
    // 3 · Consequência (implicação perguntada). Pula quando o Jev leu a consequência no texto livre
    {
      id: "consequencias",
      passo: 3,
      tipo: "multipla",
      quando: { nao: { alguma: [CONSEQUENCIA_LIDA("implicacao"), CONSEQUENCIA_LIDA("comentario"), CONSEQUENCIA_LIDA("releitura")] } },
      falas: [{ quando: { campo: "dores_mais", definido: true }, texto: "Anotado." }],
      texto: "E quando isso acontece, o que mais pesa aí? Pode marcar mais de um.",
      opcoes: OPCOES_CONSEQUENCIA,
      multipla: { confirmar: "Continuar", min: 1, texto: { placeholder: "Outra coisa" } },
    },
    // 4 · E-mail e confirmação, com "O nome disso" antes (dar antes de pedir)
    {
      ...pega("email"),
      passo: 4,
      falas: [{ rotulo: "O nome disso", texto: "{{nome_disso}}" }],
      texto: "Pra montar o mapa com o cenário da sua empresa, qual é o seu e-mail de trabalho?",
      // o código não garante tirar nome de pessoa do texto livre antes da IA: vale a versão curta (seção 2, passo 4)
      nota: "As respostas passam por IA pra montar o mapa.",
    },
    { ...pega("confirma"), passo: 4 },
    { ...pega("nome"), passo: 4 },
    { ...pega("empresa"), passo: 4 },
    // 5 · Papel na decisão + cargo opcional
    {
      id: "papel",
      passo: 5,
      tipo: "escolha",
      texto: "E você, qual é o seu papel nessa decisão aí na {{empresa}}?",
      opcoes: [
        { valor: "decide", rotulo: "Eu decido" },
        { valor: "influencia", rotulo: "Participo e levo pra quem decide" },
        { valor: "levanta", rotulo: "Estou levantando informações pra alguém" },
      ],
    },
    {
      id: "cargo",
      passo: 5,
      tipo: "texto",
      input: "text",
      autoComplete: "organization-title",
      falas: [
        {
          texto: {
            padrao: "Então o documento vai com uma página pronta pra levar pra diretoria.",
            casos: [{ quando: { campo: "papel", igual: "decide" }, texto: "Então o documento vai direto ao ponto: o caso, a conta e o caminho." }],
          },
        },
      ],
      texto: "Se quiser, me diz o seu cargo.",
      placeholder: "Ex.: coordenador de TI",
      pular: { rotulo: "Pular", valor: "pulou" },
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Me diz o cargo, ou toca em Pular." }],
      recuperarAoCorrigir: true,
    },
    // 6 · Ferramenta, só com "tem ferramenta" sem nome; depois, a cena com o logo (cartão)
    {
      id: "ferramenta",
      passo: 6,
      tipo: "escolha",
      quando: { variavel: "pergunta_ferramenta", igual: "sim" },
      texto: "Qual ferramenta vocês usam hoje?",
      opcoes: FERRAMENTAS_CHIP,
    },
    {
      id: "ferramenta_outra",
      passo: 6,
      tipo: "texto",
      input: "text",
      quando: { campo: "ferramenta", igual: "outra" },
      texto: "Qual?",
      placeholder: "Nome da ferramenta",
      validar: [{ regra: "minCaracteres", valor: 2, mensagem: "Me diz o nome da ferramenta." }],
    },
    // 7 · Time de TI, tempo e a conta (2 balões em vez de um com duas fileiras: reserva do roteiro)
    {
      id: "usuarios",
      passo: 7,
      tipo: "escolha",
      texto: "Pra fazer a conta do que isso custa pro time: quantas pessoas a TI atende aí?",
      opcoes: [
        { valor: "50", rotulo: "Até 50" },
        { valor: "200", rotulo: "51 a 200" },
        { valor: "1000", rotulo: "201 a 1.000" },
        { valor: "mais", rotulo: "Mais de 1.000" },
      ],
      resumo: { porValor: RESUMO_USUARIOS },
    },
    { ...pega("tecnicos"), passo: 7 },
    { ...pega("coerencia"), passo: 7 },
    {
      id: "tempo",
      passo: 7,
      tipo: "escolha",
      texto: {
        padrao: "Numa semana normal, quanto tempo do time vai nisso?",
        casos: [
          { quando: { variavel: "dor_principal", igual: "perda" }, texto: "Numa semana normal, quanto tempo do time vai em procurar, repassar e cobrar pedido?" },
          { quando: { variavel: "dor_principal", igual: "complexidade" }, texto: "Numa semana normal, quanto tempo vai em manter e contornar a ferramenta?" },
          { quando: { variavel: "dor_principal", igual: "sla" }, texto: "Numa semana normal, quanto tempo vai em correr atrás de chamado atrasado?" },
          { quando: { variavel: "dor_principal", igual: "relatorio" }, texto: "Todo mês, quanto tempo leva montar os números que a diretoria pede?" },
        ],
      },
      opcoes: { padrao: TEMPO_SEMANA, casos: [{ quando: { variavel: "dor_principal", igual: "relatorio" }, opcoes: TEMPO_MES }] },
    },
    // 8 · Need-payoff (pergunta montada com os fragmentos das dores; chips na ordem das consequências)
    {
      id: "payoff",
      passo: 8,
      tipo: "multipla",
      texto: "{{payoff_pergunta}}",
      opcoes: { calcular: opcoesPayoff },
      multipla: { confirmar: "Continuar", min: 1, texto: { placeholder: "Outra coisa" } },
    },
    // 9 · Revelação (sempre) + 10 · WhatsApp com consentimento; o documento começa aqui
    {
      ...pega("telefone"),
      passo: 9,
      falas: [{ rotulo: "O que vocês precisam", texto: "{{revelacao}}" }],
      texto: "Vou montar um documento com como a SysAid resolve cada ponto na {{empresa}}. Me passa o seu WhatsApp que eu já começo.",
      placeholder: "(11) 99999-9999",
      nota: "Ao enviar, você autoriza a SysAid Brasil a falar com você nesse número sobre este documento. Sem spam.",
    },
    // 11 · Resumo de 2 linhas + 12 · reunião (2 horários) | 13 · orçamento | 14 · WhatsApp
    {
      id: "reuniao",
      passo: 10,
      tipo: "horarios",
      falas: [{ rotulo: "Resumindo", texto: "{{resumo_caso}}" }],
      texto: "O próximo passo é ver a SysAid rodando no cenário da {{empresa}}, com o teste grátis liberado na conversa com o especialista. Escolhe dois horários que funcionam pra você:",
      nota: NOTA_HORARIOS,
      horarios: HORARIOS,
      atalhos: [ALT_ORCAMENTO, ALT_WHATSAPP],
    },
    {
      id: "reuniao_orcamento",
      passo: 10,
      tipo: "horarios",
      quando: { campo: "reuniao", igual: "orcamento" },
      texto:
        "O orçamento da SysAid sai do escopo: quantas pessoas atendem os chamados, quais módulos entram primeiro e o que vale trazer do que vocês já usam. Quem fecha esse escopo é o especialista, na reunião, já com o teste no cenário de vocês. Escolhe dois horários:",
      nota: NOTA_HORARIOS,
      horarios: HORARIOS,
      atalhos: [ALT_WHATSAPP],
    },
  ],

  encerramentos: [],
  recomendacao: undefined,

  paineis: [
    { id: "empresa_confirma", tipo: "empresa", apos: "confirma", quando: { empresaEncontrada: true } },
    { id: "empresa", tipo: "empresa", apos: "empresa", quando: { todas: [{ empresaEncontrada: true }, { nao: { campo: "confirma", definido: true } }] } },
    { id: "porte", tipo: "porte", apos: "usuarios" },
    { id: "mapa", tipo: "mapa", lugar: "lateral", titulo: "O mapa do seu caso" },
  ],

  // seção 2, passo 16: 7 lugares, na ordem; "como a SysAid resolve" fica fechado até o WhatsApp
  mapa: {
    progresso: { montando: "Montando o seu mapa", pronto: "Mapa pronto" },
    lugares: [
      { id: "onde", tipo: "atual", vazio: "Onde vocês estão", texto: "{{mapa_onde}}", nota: "onde vocês estão", quando: { variavel: "dor_p1", definida: true } },
      { id: "pesa", tipo: "problema", vazio: "O que pesa", texto: "{{mapa_pesa}}", nota: "o que pesa", quando: { campo: "implicacao", definido: true }, aresta: "hoje" },
      { id: "causa", tipo: "causa", vazio: "O que isso causa", texto: "{{mapa_causa}}", nota: "o que isso causa", aresta: "isso causa" },
      { id: "custa", tipo: "causa", vazio: "Quanto custa", texto: "{{mapa_custa}}", nota: "{{mapa_custa_nota}}", aresta: "e custa" },
      { id: "chegar", tipo: "causa", vazio: "Onde querem chegar", texto: "{{mapa_chegar}}", nota: "onde querem chegar", aresta: "pra chegar a" },
      { id: "resolve", tipo: "destino", vazio: "Como a SysAid resolve", texto: "{{mapa_resolve}}", nota: "como a SysAid resolve", quando: { campo: "payoff", definido: true }, aresta: "com a SysAid" },
      { id: "passo", tipo: "passo", vazio: "Próximo passo", texto: "{{mapa_passo}}", nota: "próximo passo", aresta: "começando por" },
    ],
  },
  resumo: undefined,

  cartoes: CARTOES_GENERICA,
  pausaCartaoMs: 1300,

  // o documento: começa a ser montado depois do WhatsApp e sai no fim da conversa (seção 2, passos 10 e 15–17)
  entrega: {
    noFim: true,
    montagem: {
      apos: "telefone",
      rotulo: "Montando o documento da {{empresa}}",
      pronto: "Documento da {{empresa}} pronto",
      itens: ["O caso da {{empresa}}", "A conta do tempo do time", "Como a SysAid resolve cada ponto", "Por onde começar"],
      duracaoMs: 14000,
    },
    fala: {
      padrao: "Pronto{{saudacao}}. O documento da {{empresa}} está aqui embaixo.",
      casos: [
        { quando: { variavel: "pedido", igual: "whatsapp" }, texto: "Combinado: a SysAid fala com você pelo WhatsApp que você passou. O documento da {{empresa}} está pronto aqui embaixo." },
        { quando: { variavel: "pedido", igual: "reuniao" }, texto: "Anotado: {{horarios_pedidos}}. O especialista da SysAid confirma um deles com você. Pronto{{saudacao}}: o documento da {{empresa}} está aqui embaixo." },
        { quando: { variavel: "pedido", igual: "orcamento" }, texto: "Anotado: {{horarios_pedidos}}. O especialista da SysAid confirma um deles com você e leva o escopo. O documento da {{empresa}} está aqui embaixo." },
      ],
    },
    rotulo: "Documento pronto",
    titulo: "Preparado para a {{empresa}}",
    subtitulo: "O atendimento de TI hoje, quanto ele custa ao time e como a SysAid resolve cada ponto. Montado em {{hoje}} a partir da conversa no site da SysAid Brasil.",
    botaoPdf: "Baixar o PDF",
    dicaPdf: "Abre a janela de impressão: escolha “Salvar como PDF”.",
    verCompleto: "Ver o documento ↓",
    teaser: { ocultar: ["resolve"], rotulo: "Libera com o seu WhatsApp", ateMontagem: true },
    documento: {
      preparadoPara: "Preparado para a {{empresa}}",
      cliente: "{{empresa}}",
      logoCliente: true,
      secoes: [
        // página pra levar pra diretoria, logo depois da capa (só quando o papel não é "Eu decido")
        {
          id: "diretoria",
          tipo: "itens",
          quando: { campo: "papel", diferente: "decide" },
          rotulo: "Pra levar pra diretoria",
          titulo: "Resumo para a diretoria · {{dor_principal_nome}} na {{empresa}}",
          itens: (ctx) => itensDiretoria(ctx, empresaDe(ctx)),
        },
        { id: "diretoria_perguntas", tipo: "itens", quando: { campo: "papel", diferente: "decide" }, titulo: "Perguntas que costumam vir", itens: () => PERGUNTAS_DIRETORIA },
        // página 1 · o caso
        {
          id: "caso",
          tipo: "cartoes",
          novaPagina: { campo: "papel", diferente: "decide" },
          rotulo: "O caso",
          titulo: "O caso da {{empresa}}",
          cartoes: ["cena_empresa", "cena_empresa_f", "cena_empresa_o", "horas"],
        },
        { id: "pesa", tipo: "itens", titulo: "O que pesa", itens: itensOQuePesa },
        { id: "causa", tipo: "itens", titulo: "O que isso causa", itens: itensCausa },
        { id: "leitura", tipo: "texto", titulo: "Leitura do especialista", texto: "{{leitura}}" },
        // página 2 · como a SysAid resolve cada ponto (só a lista fechada C1–C10)
        {
          id: "resolve",
          tipo: "itens",
          novaPagina: true,
          rotulo: "Como a SysAid resolve",
          titulo: "Cada ponto, e como a SysAid resolve",
          colunas: ["O que vocês precisam", "Como a SysAid resolve"],
          itens: itensComoResolve,
        },
        {
          id: "resolve_fecho",
          tipo: "texto",
          texto: "A SysAid atende o que vocês precisam. O que for específico do cenário da {{empresa}}, o especialista avalia na reunião e, se precisar, pede uma customização.",
        },
        // página 3 · onde vocês estão e por onde começar
        { id: "comecar", tipo: "cartoes", novaPagina: true, rotulo: "Por onde começar", titulo: "Onde vocês estão e por onde começar", cartoes: ["maturidade", "etapas"] },
        { id: "mapa", tipo: "mapa", titulo: "O mapa do caso" },
        { id: "passo", tipo: "texto", titulo: "Próximo passo", texto: "{{proximo_passo}}" },
        {
          id: "contato",
          tipo: "texto",
          destaque: true,
          rotulo: "Fale com o comercial",
          paragrafos: ["Marcelo Rosin · Comercial", "marcelo.rosin@sysaid.com.br · +55 11 99933-7137 · itsm.sysaid.com.br"],
        },
      ],
    },
    pdf: {
      arquivo: { padrao: "Documento - SysAid", casos: [{ quando: { campo: "empresa", definido: true }, texto: "Documento - {{empresa}} - SysAid" }] },
      logo: { src: "/logos/logo-black.svg", alt: "SysAid", altura: 22 },
      cabecalho: "Preparado para a {{empresa}} · {{hoje}}",
      rodape: "As contas usam o que foi respondido na conversa; as premissas estão ao lado de cada número. Referência de volume: HDI/MetricNet (2020). · itsm.sysaid.com.br",
      tema: base.entrega?.pdf?.tema,
    },
  },

  // pontuação: dor, porte, papel e o próximo passo pedido (máximo 13)
  pontuacao: {
    maximo: 13,
    criterios: [
      { id: "problema", campo: "situacao_texto", pontos: { "*": 2 } },
      { id: "usuarios", campo: "usuarios", pontos: { "50": 0, "200": 2, "1000": 3, mais: 3 } },
      { id: "tecnicos", campo: "tecnicos", pontos: { "1-2": 0, "3-10": 1, "+10": 2 } },
      { id: "papel", campo: "papel", pontos: { decide: 3, influencia: 2, levanta: 1 } },
      { id: "reuniao", campo: "reuniao", pontos: { "*": 3, orcamento: 2, whatsapp: 1 } },
    ],
    extras: [{ id: "capricho", quando: { todas: [{ campo: "situacao_texto", minCaracteres: 60 }, { tempoTotalEntre: [90, 15 * 60] }] }, pontos: 1 }],
    classes: [
      { id: "forte", minimo: 9 },
      { id: "medio", minimo: 6 },
      { id: "fraco", minimo: 0 },
    ],
    rotulos: [],
    rotaPorRotulo: { fora: "fora", cotando: "cotando", cliente: "medio", incoerente: "fraco" },
    precedenciaRotulos: ["fora", "cliente", "cotando", "incoerente"],
  },

  // o Jev no fim (rótulo e coerência) lê os campos deste fluxo
  jev: { ...base.jev, endpoint: "/api/qualifica/rotular" },

  geracoes: LLM_LIGADO
    ? [
        // passo 1, texto livre: Jev (dor, situação, consequência) + Haiku (implicação e rótulos da cena)
        { id: "implicacao", endpoint: "/api/qualifica/gerar", gatilho: { campo: "situacao_texto", minCaracteres: 12, debounceMs: 600, passoCaracteres: 20, ignorarAtalhos: true }, esperaMs: 3200, timeoutMs: 8000, omitir: PESSOAIS },
        // passo 2, texto livre no lugar do "É isso": o Jev lê se trouxe consequência ou outra dor
        { id: "comentario", endpoint: "/api/qualifica/gerar", gatilho: { campo: "implicacao", minCaracteres: 12, debounceMs: 500, ignorarAtalhos: true }, esperaMs: 2200, timeoutMs: 6000, omitir: PESSOAIS },
        // "Não é bem isso": o Jev relê a dor
        { id: "releitura", endpoint: "/api/qualifica/gerar", gatilho: { campo: "dor_releitura", minCaracteres: 12, debounceMs: 600, passoCaracteres: 20 }, esperaMs: 2600, timeoutMs: 6000, omitir: PESSOAIS },
        // mais de uma dor: o Jev escolhe a de mais valor pro mapa (sem a conversa esperar)
        {
          id: "principal",
          endpoint: "/api/qualifica/gerar",
          gatilho: { aoResponder: ["implicacao", "implicacao2", "dores_mais", "consequencias"], quando: { variavel: "varias_dores", igual: "sim" } },
          esperaMs: 0,
          timeoutMs: 6000,
          omitir: PESSOAIS,
          incluir: (ctx) => ({ dores: dores(ctx).join("|"), consequencias: consequencias(ctx).map((c) => CONSEQUENCIAS[c].triste).join(", ") }),
        },
        // a leitura do caso pro documento (Haiku, chamada 2), disparada no WhatsApp
        { id: "leitura", endpoint: "/api/qualifica/gerar", gatilho: { aoResponder: ["telefone"] }, esperaMs: 0, timeoutMs: 9000, omitir: PESSOAIS, incluir: entradaLeitura },
      ]
    : [],

  textos: {
    ...base.textos,
    enviando: "Fechando o documento{{saudacao}}.",
    legal: "",
  },
};
