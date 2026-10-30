// conversa-core — lado do navegador: chamadas ao servidor do cliente (rótulos do
// Jev no envio e gerações de texto enquanto a pessoa digita), sempre com timeout
// e fallback. Contrato: o motor nunca espera além do timeout pra seguir o fluxo;
// falha, rede fora ou resposta inválida = fallback, nunca erro na tela.
import type { Contexto, Gerado, GeracaoConfig, JevConfig, Respostas, RotuloJev } from "./tipos";

export async function comTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    return await Promise.race([p, limite]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// corpo comum das chamadas ao servidor: a sessão (pro teto de custo) e o contexto
export type PedidoServidor = {
  sessao: string;
  respostas: Respostas;
  origem: string;
  variaveis: Record<string, string | null>;
};

function pedido(sessao: string, ctx: Contexto, respostas: Respostas = ctx.respostas): PedidoServidor {
  return { sessao, respostas, origem: ctx.origem, variaveis: ctx.variaveis };
}

async function post<T>(endpoint: string, corpo: unknown, timeoutMs: number): Promise<T | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: ctl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function rotularComJev(cfg: JevConfig, sessao: string, ctx: Contexto): Promise<RotuloJev> {
  const fallback: RotuloJev = { rotulo: null, motivo: null, origem: "fallback" };
  if (!cfg.habilitado) return fallback;
  const data = await post<Partial<RotuloJev>>(cfg.endpoint, pedido(sessao, ctx), cfg.timeoutMs);
  if (!data || data.origem !== "jev") return fallback;
  return { rotulo: data.rotulo ?? null, motivo: data.motivo ?? null, origem: "jev", dados: data.dados };
}

// Pede uma geração ao servidor com as respostas parciais (o campo-gatilho ainda
// está sendo digitado). O servidor devolve `para` dizendo pra quais respostas o
// texto vale; o motor descarta se a pessoa mudar o texto depois.
export async function pedirGeracao(g: GeracaoConfig, sessao: string, ctx: Contexto, respostasParciais: Respostas): Promise<Gerado | null> {
  const data = await post<Partial<Gerado>>(g.endpoint, { id: g.id, ...pedido(sessao, ctx, respostasParciais) }, g.timeoutMs);
  if (!data || !data.para || !data.textos) return null;
  return {
    id: g.id,
    para: data.para,
    paraPrefixo: data.paraPrefixo,
    textos: data.textos,
    listas: data.listas,
    dados: data.dados,
    origem: data.origem === "cache" ? "cache" : "servidor",
    medicao: data.medicao,
  };
}

// id de sessão só pro teto de custo no servidor: não identifica a pessoa, não persiste
export function novaSessao(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
