// ==========================================================================
// conversa-core — 18/11/2026: esconder termos (ex.: nome de concorrente) no
// documento entregue. Funções puras. Casa a palavra inteira, sem diferenciar
// maiúscula nem acento; espaço ou hífen no termo vale como espaço, hífen ou
// nada ("Top Desk" pega "TOPdesk", "top-desk"). Com `contracoes`, a palavra
// logo antes do termo (artigo, preposição) entra na troca, pra frase continuar
// natural: "usamos o Movidesk" → "usamos a ferramenta atual", "do GLPI" → "da
// ferramenta atual". Dois termos seguidos ligados por "e", "ou" ou vírgula viram um só.
// ==========================================================================

import type { ConfigConversa, Contexto, Mapa, MascaraConfig } from "./tipos";

const VARIANTES: Record<string, string> = {
  a: "aáàâãä",
  e: "eéèêë",
  i: "iíìîï",
  o: "oóòôõö",
  u: "uúùûü",
  c: "cç",
  n: "nñ",
};
const escapar = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "");

// o termo vira um padrão: cada letra com as variantes acentuadas, espaço/hífen flexível
export function padraoTermo(termo: string): string {
  return semAcento(termo.trim().toLowerCase())
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((parte) =>
      [...parte]
        .map((c) => (VARIANTES[c] ? `[${VARIANTES[c]}${VARIANTES[c].toUpperCase()}]` : /[a-z]/.test(c) ? `[${c}${c.toUpperCase()}]` : escapar(c)))
        .join("")
    )
    .join("[\\s-]*");
}

const LETRA = "[\\p{L}\\p{N}]";

export function mascararTexto(texto: string, termos: string[], cfg: Pick<MascaraConfig, "por" | "contracoes">): string {
  if (!texto) return texto;
  const lista = [...new Set(termos.map((t) => t.trim()).filter((t) => t.length >= 2))].sort((a, b) => b.length - a.length);
  if (!lista.length) return texto;
  const alternativas = lista.map(padraoTermo).join("|");
  const contracoes = cfg.contracoes ?? {};
  const palavras = Object.keys(contracoes).sort((a, b) => b.length - a.length).map(escapar);
  const antes = palavras.length ? `(?:(?<!${LETRA})(${palavras.join("|")})\\s+)?` : "()";
  const re = new RegExp(`${antes}(?<!${LETRA})(?:${alternativas})(?!${LETRA})`, "giu");
  let saida = texto.replace(re, (casou: string, palavra: string | undefined, pos: number) => {
    const chave = palavra ? Object.keys(contracoes).find((k) => k.toLowerCase() === palavra.toLowerCase()) : undefined;
    const troca = chave ? contracoes[chave] : cfg.por;
    // maiúscula se o trecho trocado começava com maiúscula no início de frase
    const inicio = pos === 0 || /[.!?]\s*$/.test(texto.slice(0, pos)) || /["“(]\s*$/.test(texto.slice(0, pos));
    return inicio && /^\p{Lu}/u.test(casou) ? troca.charAt(0).toUpperCase() + troca.slice(1) : troca;
  });
  // "a ferramenta atual e a ferramenta atual" → "a ferramenta atual"
  const formas = [...new Set([cfg.por, ...Object.values(contracoes)])].map(escapar).join("|");
  const repetida = new RegExp(`((?:${formas}))((?:\\s*,\\s*|\\s+(?:e|ou)\\s+)(?:${formas}))+`, "giu");
  saida = saida.replace(repetida, "$1");
  return saida;
}

// a função de troca da entrega (config.entrega.mascarar), ou identidade quando não há
export function mascaraDaEntrega(config: ConfigConversa, ctx: Contexto): (t: string) => string {
  const m = config.entrega?.mascarar;
  if (!m) return (t) => t;
  let termos: string[] = [];
  try {
    termos = typeof m.termos === "function" ? m.termos(ctx) : m.termos;
  } catch {
    termos = Array.isArray(m.termos) ? m.termos : [];
  }
  return (t) => (t ? mascararTexto(t, termos, m) : t);
}

export function mascararMapa(mapa: Mapa, x: (t: string) => string): Mapa {
  return {
    ...mapa,
    nos: mapa.nos.map((n) => ({ ...n, texto: x(n.texto), nota: n.nota ? x(n.nota) : n.nota })),
    arestas: mapa.arestas.map((a) => ({ ...a, rotulo: a.rotulo ? x(a.rotulo) : a.rotulo })),
  };
}
