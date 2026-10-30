// conversa-core — textos com template {{variavel}} e variantes por condição.
import { avaliar, type Resolvedor } from "./condicoes";
import type { Contexto, Texto } from "./tipos";

// ordem de busca: variáveis derivadas (config) → variáveis da URL → respostas → extras
export function renderTemplate(
  template: string,
  ctx: Contexto,
  variavel?: Resolvedor,
  extras?: Record<string, string | number>
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, nome: string) => {
    if (extras && nome in extras) return String(extras[nome]);
    const derivada = variavel ? variavel(nome) : undefined;
    if (typeof derivada === "string") return derivada;
    const url = ctx.variaveis[nome];
    if (typeof url === "string") return url;
    const r = ctx.respostas[nome];
    if (typeof r === "string") return r;
    return "";
  });
}

export function renderTexto(t: Texto | undefined, ctx: Contexto, variavel?: Resolvedor, extras?: Record<string, string | number>): string {
  if (t === undefined) return "";
  if (typeof t === "string") return renderTemplate(t, ctx, variavel, extras);
  const caso = t.casos.find((c) => avaliar(c.quando, ctx, variavel));
  return renderTemplate(caso ? caso.texto : t.padrao, ctx, variavel, extras);
}
