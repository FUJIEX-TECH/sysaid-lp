// ==========================================================================
// conversa-core — 13/11/2026: o documento entregue no fim (só funções puras).
// A config declara as seções em ordem (`entrega.documento.secoes`); aqui cada
// uma é filtrada pelo `quando` (é assim que o PDF muda pelo papel da pessoa),
// os textos são montados com o contexto e as listas da config (`itens`, função
// pura) são chamadas com proteção: erro ou lista vazia = a seção some. A tela
// (ui/Documento.tsx) só desenha; a mesma seção vira o PDF pelo @media print.
// ==========================================================================

import { avaliar, type Resolvedor } from "./condicoes";
import { renderTexto } from "./texto";
import type { CartaoPronto } from "./cartoes";
import type { ConfigConversa, Contexto, ItemDocumento, SecaoDocumento } from "./tipos";

export type SecaoPronta = {
  id: string;
  tipo: SecaoDocumento["tipo"];
  novaPagina: boolean;
  destaque: boolean;
  rotulo?: string;
  titulo?: string;
  texto?: string;
  paragrafos: string[];
  cartoes: CartaoPronto[];
  itens: ItemDocumento[];
  colunas?: [string, string];
};

export type DocumentoPronto = {
  preparadoPara?: string;
  cliente: { nome?: string; logo: { src: string; alt: string } | null };
  secoes: SecaoPronta[];
};

const limpo = (s: unknown): string => (typeof s === "string" ? s.trim() : "");

function itensDe(s: SecaoDocumento, ctx: Contexto): ItemDocumento[] {
  if (!s.itens) return [];
  try {
    const l = s.itens(ctx);
    if (!Array.isArray(l)) return [];
    return l
      .filter((i) => limpo(i?.titulo))
      .slice(0, 12)
      .map((i) => ({ titulo: i.titulo.trim(), texto: limpo(i.texto) || undefined, nota: limpo(i.nota) || undefined }));
  } catch {
    return []; // erro na função da config: a seção some, o documento sai
  }
}

export function resolverDocumento(
  config: ConfigConversa,
  ctx: Contexto,
  variavel: Resolvedor,
  cartoes: CartaoPronto[],
  extras: Record<string, string | number> = {}
): DocumentoPronto | null {
  const doc = config.entrega?.documento;
  if (!doc) return null;
  const t = (x: Parameters<typeof renderTexto>[0]) => renderTexto(x, ctx, variavel, extras).trim();
  const secoes: SecaoPronta[] = [];
  for (const s of doc.secoes) {
    if (!avaliar(s.quando, ctx, variavel)) continue;
    const pronta: SecaoPronta = {
      id: s.id,
      tipo: s.tipo,
      novaPagina: typeof s.novaPagina === "object" ? avaliar(s.novaPagina, ctx, variavel) : !!s.novaPagina,
      destaque: !!s.destaque,
      rotulo: t(s.rotulo) || undefined,
      titulo: t(s.titulo) || undefined,
      texto: t(s.texto) || undefined,
      paragrafos: (s.paragrafos ?? []).map(t).filter(Boolean),
      cartoes: s.tipo === "cartoes" ? (s.cartoes ?? []).map((id) => cartoes.find((c) => c.id === id)).filter((c): c is CartaoPronto => !!c && c.naEntrega) : [],
      itens: s.tipo === "itens" ? itensDe(s, ctx) : [],
      colunas: s.colunas,
    };
    if (s.tipo === "cartoes" && !pronta.cartoes.length) continue;
    if (s.tipo === "itens" && !pronta.itens.length) continue;
    if (s.tipo === "texto" && !pronta.texto && !pronta.paragrafos.length) continue;
    secoes.push(pronta);
  }
  const e = ctx.empresa;
  const logo = doc.logoCliente && e && e.origem !== "fallback" && e.logo && /^(https:\/\/|\/)/.test(e.logo) ? { src: e.logo, alt: e.nome } : null;
  return {
    preparadoPara: t(doc.preparadoPara) || undefined,
    cliente: { nome: t(doc.cliente) || undefined, logo },
    secoes,
  };
}
