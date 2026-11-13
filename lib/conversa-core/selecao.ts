// ==========================================================================
// conversa-core — 13/11/2026: múltipla escolha (só funções puras). A resposta
// de uma etapa "multipla" é uma string com os valores marcados separados por
// "|"; o texto livre, se a pessoa escreveu, entra como mais um item (com o "|"
// trocado por "/"). Assim o motor continua guardando uma string por etapa, a
// condição `{ campo, inclui }` funciona e o resumo da bolha sai sozinho.
// ==========================================================================

import type { Opcao } from "./tipos";

export const SEPARADOR = "|";

export function juntarMultipla(valores: string[], texto?: string): string {
  const v = valores.map((x) => x.trim()).filter(Boolean);
  const t = (texto ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
  const unicos = [...new Set(v)];
  return (t ? [...unicos, t] : unicos).join(SEPARADOR);
}

export function partesMultipla(valor: string | undefined): string[] {
  return (valor ?? "")
    .split(SEPARADOR)
    .map((x) => x.trim())
    .filter(Boolean);
}

// os valores marcados que existem nas opções (o resto é texto livre)
export function valoresMultipla(valor: string | undefined, opcoes: Opcao[]): string[] {
  const validos = new Set(opcoes.map((o) => o.valor));
  return partesMultipla(valor).filter((p) => validos.has(p));
}

// o texto livre (o que não é valor de opção), ou ""
export function textoMultipla(valor: string | undefined, opcoes: Opcao[]): string {
  const validos = new Set(opcoes.map((o) => o.valor));
  return partesMultipla(valor)
    .filter((p) => !validos.has(p))
    .join(" ");
}

export function incluiValor(valor: string | undefined, procurado: string): boolean {
  return partesMultipla(valor).includes(procurado);
}

// "a, b e c" (o conector vem da config/idioma; padrão "e")
export function listaNatural(itens: string[], e = "e"): string {
  const l = itens.filter(Boolean);
  if (l.length <= 1) return l[0] ?? "";
  return `${l.slice(0, -1).join(", ")} ${e} ${l[l.length - 1]}`;
}
