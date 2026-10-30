// conversa-core — pontuação por regras, classe, rótulos de código e rota.
import { avaliar, type Resolvedor } from "./condicoes";
import type { Classificacao, Contexto, PontuacaoConfig } from "./tipos";

export type PontuacaoParcial = Pick<Classificacao, "pontos" | "detalhe" | "classe" | "rotuloCodigo">;

export function pontuar(cfg: PontuacaoConfig, ctx: Contexto, variavel?: Resolvedor): PontuacaoParcial {
  const detalhe: Record<string, number> = {};
  for (const c of cfg.criterios) {
    const v = ctx.respostas[c.campo];
    detalhe[c.id] = v === undefined ? 0 : c.pontos[v] ?? c.pontos["*"] ?? 0;
  }
  for (const e of cfg.extras) detalhe[e.id] = avaliar(e.quando, ctx, variavel) ? e.pontos : 0;

  const pontos = Math.min(cfg.maximo, Object.values(detalhe).reduce((a, b) => a + b, 0));
  const classes = [...cfg.classes].sort((a, b) => b.minimo - a.minimo);
  const classe = (classes.find((c) => pontos >= c.minimo) ?? classes[classes.length - 1]).id;
  const rotuloCodigo = cfg.rotulos.find((r) => avaliar(r.quando, ctx, variavel))?.rotulo ?? null;
  return { pontos, detalhe, classe, rotuloCodigo };
}

// Rótulo vence ponto. Entre o rótulo do Jev e o do código: sem `precedenciaRotulos`
// o do Jev vence (parte 2); com a lista, vence o que vier antes nela (v2: um
// "fora" que o código já sabia não some por causa de um "incoerente" do Jev).
export function rotuloFinal(cfg: PontuacaoConfig, p: PontuacaoParcial, rotuloJev: string | null): string | null {
  const candidatos = [rotuloJev, p.rotuloCodigo].filter((r): r is string => !!r);
  if (!candidatos.length) return null;
  const prec = cfg.precedenciaRotulos;
  if (!prec) return candidatos[0];
  const posicao = (r: string) => {
    const i = prec.indexOf(r);
    return i < 0 ? prec.length : i;
  };
  return [...candidatos].sort((a, b) => posicao(a) - posicao(b))[0];
}

export function rotaDe(cfg: PontuacaoConfig, p: PontuacaoParcial, rotuloJev: string | null): string {
  const rotulo = rotuloFinal(cfg, p, rotuloJev);
  if (rotulo && cfg.rotaPorRotulo[rotulo]) return cfg.rotaPorRotulo[rotulo];
  return p.classe;
}
