// conversa-core — recomendação por regras (o "mapa" de nós do catálogo).
import { avaliar, type Resolvedor } from "./condicoes";
import type { Contexto, RecomendacaoConfig } from "./tipos";

export function recomendar(cfg: RecomendacaoConfig, ctx: Contexto, variavel?: Resolvedor): { id: string; rotulo: string }[] {
  const base = cfg.regras.find((r) => (r.modo ?? "base") === "base" && avaliar(r.quando, ctx, variavel));
  const nos = [...(base ? base.nos : cfg.padrao)];
  for (const r of cfg.regras) {
    if (r.modo !== "acrescentar" || !avaliar(r.quando, ctx, variavel)) continue;
    for (const n of r.nos) if (!nos.includes(n)) nos.push(n);
  }
  return nos.map((id) => ({ id, rotulo: cfg.nos[id] ?? id }));
}
