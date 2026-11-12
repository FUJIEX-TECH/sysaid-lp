// ==========================================================================
// conversa-core — 12/11/2026: quando o mapa completo é liberado (só funções
// puras). A config diz depois de qual etapa (`entrega.apos`); sem isso, vale a
// última etapa de telefone (`input: "tel"`), e sem telefone, o fim da conversa.
// Resposta pulada (`pular`) ou vazia não libera: o contato é obrigatório pra
// destravar. A tela (ui/ConversaTela + ui/Entrega) só pergunta "liberou?".
// ==========================================================================

import { avaliar, type Resolvedor } from "./condicoes";
import type { ConfigConversa, Contexto } from "./tipos";

export function etapaDaEntrega(config: ConfigConversa): string | null {
  const e = config.entrega;
  if (!e) return null;
  if (e.apos) return e.apos;
  const tel = [...config.etapas].reverse().find((x) => x.input === "tel");
  return tel?.id ?? null;
}

export function entregaLiberada(
  config: ConfigConversa,
  ctx: Contexto,
  opts: { variavel?: Resolvedor; respondidas?: string[]; completa?: boolean } = {}
): boolean {
  const e = config.entrega;
  if (!e) return false;
  const id = etapaDaEntrega(config);
  if (id) {
    if (opts.respondidas && !opts.respondidas.includes(id)) return false;
    const v = ctx.respostas[id];
    if (v === undefined || !v.trim()) return false;
    const etapa = config.etapas.find((x) => x.id === id);
    if (etapa?.pular && v === etapa.pular.valor) return false;
  } else if (!opts.completa) {
    return false;
  }
  return avaliar(e.quando, ctx, opts.variavel);
}

// data de hoje no idioma da config ("12/11/2026"), pros textos da entrega ({{hoje}})
export function dataHoje(idioma = "pt-BR", d: Date = new Date()): string {
  return new Intl.DateTimeFormat(idioma, { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}
