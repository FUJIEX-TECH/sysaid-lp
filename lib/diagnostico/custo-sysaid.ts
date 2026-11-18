// ==========================================================================
// Qualifica v2 · OBJEÇÃO DE CUSTO da SysAid (18/11/2026, pedido do Fernando):
// "quando o lead solicitar ou dizer que o valor da ferramenta que eles usam hoje
// está caro, dizer que a SysAid é mais acessível e que supre melhor a necessidade
// deles, mas não mostrar preço". Dono: sysaid-growth.
//
// Dois tipos:
//   reclama  a ferramenta de hoje é cara / licença ou mensalidade pesa / orçamento apertado
//            → reconhece a dor + "a SysAid costuma ser mais acessível e atender melhor
//              o que vocês precisam"; vira dor registrada no mapa e no documento
//   pede     pergunta o preço / valor / quanto custa
//            → "o investimento depende do tamanho do time e do que vocês precisam; a
//              proposta sai na reunião com o comercial" e aponta pro fechamento
// Nunca preço, número, faixa, plano, desconto ou "até X%".
//
// Quem detecta: com o Jev ligado, o Jev confirma no servidor (/api/qualifica/gerar,
// id "objecao") e o Haiku escreve a fala; este detector por palavras é o filtro
// do navegador e a reserva quando o Jev está desligado (preview: DIAG_JEV=0).
// Funções puras, imports relativos (roda no teste sem navegador e no servidor).
// ==========================================================================

import { geradoValido } from "../conversa-core/condicoes";
import type { Contexto, EtapaConfig, ReacaoConfig } from "../conversa-core/tipos";

export type TipoCusto = "reclama" | "pede";

const norm = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// pergunta de preço (vem antes: "quanto custa? a nossa é cara" responde a pergunta)
const PEDE: RegExp[] = [
  /\bquanto (custa|custaria|sai|sairia|fica|ficaria|cobram|cobra|e o investimento|seria o investimento|e a licenca|e a mensalidade)\b/,
  /\b(qual|quais|me passa\w*|passar|passa|mandar?|mandem|manda|saber|informar|informa)\b(\s+\S+){0,3}?\s+(preco|precos|valor|valores|investimento|cotacao|tabela de precos?|mensalidade)\b/,
  /\b(quero|queria|preciso|gostaria|pedir|solicitar|fazer|mandar?|mandem|manda)(\s+(de|um|uma|o|a|receber|ter))*\s+(orcamento|cotacao|proposta comercial|tabela de precos?)\b/,
  /^(e )?(o |os |a )?(preco|precos|valor|valores|investimento|mensalidade)( da sysaid| de voces| dela| disso)?\s*\??$/,
];

// reclamação de custo da ferramenta de hoje / orçamento
const NOMES = "(custo|custos|preco|precos|valor|valores|mensalidade|mensalidades|licenca|licencas|licenciamento|assinatura|fatura|contrato|renovacao|reajuste)";
const QUALI =
  "(alt[oa]s?|caro|cara|caros|caras|carissim[oa]s?|pesad[oa]s?|pesa|pesam|pesando|subiu|subindo|sobe|sobem|so sobe|aumentou|aumentaram|aumentando|absurd[oa]s?|salgad[oa]s?|demais|exorbitantes?|estourando|estourou|nao cabe|nao compensa|nao vale)";
const RECLAMA: RegExp[] = [
  new RegExp(`\\b${NOMES}\\b(\\s+\\S+){0,4}?\\s+${QUALI}\\b`),
  /\b(muito|bem|super|bastante|ta|esta|e|eh|ficou|ficando|saindo|achamos|acho|sai|sao|estao|tao)\s+(car[oa]s?|carissim[oa]s?)\b/,
  /\b(carissim[oa]s?|uma fortuna|os olhos da cara|pesa no (bolso|orcamento|caixa)|pesando no (bolso|orcamento|caixa))\b/,
  /\borcamento\s+(\S+\s+){0,2}?(apertado|curto|limitado|reduzido|enxuto|baixo|pequeno|cortado|nao cabe)\b/,
  /\b(sem|pouco|falta de|corte de|cortar|cortando|reduzir|reduzindo|economizar|economia de|economia na)\s+(o |a |os |as |nos |no )?(orcamento|verba|budget|custo|custos|gasto|gastos|dinheiro)\b/,
  /\b(pagamos|pago|pagando|pagar|gastamos|gasto|gastando)\s+(\S+\s+){0,2}?(muito|caro|demais|uma fortuna|absurdo|um absurdo|horrores)\b/,
  /\bcusta(m)?\s+(\S+\s+)?(caro|uma fortuna|os olhos|muito dinheiro)\b/,
  /\b(cobram|cobra|cobrado|cobrados|cobrada)\s+(\S+\s+){0,2}?(a parte|por fora|extra|por tecnico|por agente|por usuario|por licenca)\b/,
  /\ba conta\s+(\S+\s+){0,2}?(sobe|subiu|aumentou|vem alta|veio alta|pesa|pesou)\b/,
  /r\$\s*\d|\b\d+(\.\d+)?\s*(mil )?reais\b/,
];

export function detectarCusto(texto: string): TipoCusto | null {
  const t = norm(texto ?? "");
  if (t.length < 3) return null;
  if (PEDE.some((re) => re.test(t))) return "pede";
  if (RECLAMA.some((re) => re.test(t))) return "reclama";
  return null;
}

// --------------------------------------------------------------------------
// A reação (config.reacoes do núcleo). Falas fixas = reserva quando o Haiku não
// chega a tempo ou reprova na trava. "fecho" diz como a conversa termina, pra a
// fala de "pede" apontar pro fechamento certo.
// --------------------------------------------------------------------------
const LLM_LIGADO = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DIAG_LLM === "1";
const PESSOAIS = ["email", "nome", "empresa", "telefone", "cargo", "confirma"];

// o Jev já leu "custo" como a dor do texto livre do passo 1: também é reclamação
function detectar(texto: string, ctx: Contexto, etapa: EtapaConfig): string | null {
  const t = detectarCusto(texto);
  if (t) return t;
  for (const [campo, id] of [
    ["situacao_texto", "implicacao"],
    ["dor_releitura", "releitura"],
  ] as const) {
    if (etapa.id === campo && geradoValido(ctx, id) && ctx.gerados?.[id]?.dados?.dor === "custo") return "reclama";
  }
  return null;
}

export const FALA_RECLAMA = "Anotado: o custo de hoje pesa no orçamento. A SysAid costuma ser mais acessível e atender melhor o que vocês precisam, e isso entra no seu mapa.";
export const FALA_PEDE_REUNIAO =
  "O investimento depende do tamanho do time e do que vocês precisam, por isso a proposta sai na reunião com o comercial. No fim desta conversa você já escolhe o horário.";
export const FALA_PEDE_CONTATO = "O investimento depende do tamanho do time e do que vocês precisam, por isso a proposta sai na conversa com o comercial da SysAid.";

function reacao(id: string, etapas: string[], fecho: "reuniao" | "contato"): ReacaoConfig {
  return {
    id,
    etapas,
    detectar,
    falas: {
      reclama: { rotulo: "Sobre o custo", texto: FALA_RECLAMA },
      pede: { rotulo: "Sobre o investimento", texto: fecho === "reuniao" ? FALA_PEDE_REUNIAO : FALA_PEDE_CONTATO },
    },
    geracao: LLM_LIGADO ? { endpoint: "/api/qualifica/gerar", chave: "fala", esperaMs: 3200, timeoutMs: 6000, omitir: PESSOAIS, extras: { fecho } } : undefined,
    pausaMs: 1400,
  };
}

// busca genérica: todo texto livre que não é dado pessoal
export const ETAPAS_CUSTO_GENERICA = ["situacao_texto", "implicacao", "dor_releitura", "dores_mais", "consequencias", "ferramenta_outra", "payoff"];
export const REACAO_CUSTO_GENERICA = reacao("objecao", ETAPAS_CUSTO_GENERICA, "reuniao");
// fluxo de sempre (comparativa, marca, preço)
export const REACAO_CUSTO_ANTERIOR = reacao("objecao", ["situacao_texto", "implicacao_mais", "ferramenta_outra"], "contato");
