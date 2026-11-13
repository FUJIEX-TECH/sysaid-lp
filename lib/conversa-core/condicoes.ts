// conversa-core — avaliador de condicionais declarativas (tipos.ts, `Condicao`).
import { incluiValor } from "./selecao";
import type { Condicao, Contexto } from "./tipos";

export type Resolvedor = (nome: string) => string | null | undefined;

// Uma geração do servidor só vale enquanto as respostas que serviram de entrada
// (`para`) continuam iguais; a pessoa corrigiu o texto = gerado descartado.
export function geradoValido(ctx: Contexto, id: string): boolean {
  const g = ctx.gerados?.[id];
  if (!g) return false;
  return Object.entries(g.para).every(([campo, valor]) => {
    const atual = (ctx.respostas[campo] ?? "").trim();
    if (atual === valor) return true;
    // campo de texto lido antes do Enter: vale se a pessoa só continuou escrevendo
    return !!g.paraPrefixo?.includes(campo) && valor.length >= 20 && atual.toLowerCase().startsWith(valor.toLowerCase());
  });
}

// `variavel` olha primeiro as derivadas (config.variaveis), depois as da URL.
export function avaliar(c: Condicao | undefined, ctx: Contexto, variavel?: Resolvedor): boolean {
  if (c === undefined || c === true) return true;
  if ("todas" in c) return c.todas.every((x) => avaliar(x, ctx, variavel));
  if ("alguma" in c) return c.alguma.some((x) => avaliar(x, ctx, variavel));
  if ("nao" in c) return !avaliar(c.nao, ctx, variavel);
  if ("origem" in c) return ctx.origem === c.origem;
  if ("variavel" in c) {
    const v = variavel ? variavel(c.variavel) : undefined;
    const valor = v ?? ctx.variaveis[c.variavel];
    if ("igual" in c) return typeof valor === "string" && valor === c.igual;
    const definida = typeof valor === "string" && valor.trim() !== "";
    return definida === c.definida;
  }
  if ("tempoTotalEntre" in c) {
    const s = ctx.tempos?.segundosTotal ?? 0;
    return s >= c.tempoTotalEntre[0] && s <= c.tempoTotalEntre[1];
  }
  if ("gerado" in c) return geradoValido(ctx, c.gerado) === c.disponivel;
  // 13/11/2026: decisão que veio do servidor numa geração (ex.: o Jev leu a consequência no texto)
  if ("decisao" in c) {
    const v = geradoValido(ctx, c.decisao) ? ctx.gerados?.[c.decisao]?.dados?.[c.dado] : undefined;
    if (c.igual !== undefined) return v === c.igual;
    if (c.em) return v !== undefined && c.em.includes(v);
    if (c.definido !== undefined) return (v !== undefined && v !== "") === c.definido;
    return v !== undefined && v !== "";
  }
  if ("empresaEncontrada" in c) return (!!ctx.empresa && ctx.empresa.origem !== "fallback") === c.empresaEncontrada;
  const valor = ctx.respostas[c.campo];
  if ("inclui" in c) return incluiValor(valor, c.inclui);
  if ("igual" in c) return valor === c.igual;
  if ("diferente" in c) return valor !== c.diferente;
  if ("em" in c) return valor !== undefined && c.em.includes(valor);
  if ("definido" in c) return (valor !== undefined) === c.definido;
  if ("vazio" in c) return valor !== undefined && ((valor ?? "").trim() === "") === c.vazio;
  if ("minCaracteres" in c) return (valor ?? "").trim().length >= c.minCaracteres;
  return false;
}
