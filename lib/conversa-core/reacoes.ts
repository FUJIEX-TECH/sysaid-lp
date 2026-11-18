// ==========================================================================
// conversa-core — reações (18/11/2026). Funções puras: o texto livre de uma
// resposta, a decisão (detector local da config + confirmação do servidor) e a
// lista de reações da conversa. Ver ReacaoConfig em tipos.ts.
// ==========================================================================

import { geradoValido } from "./condicoes";
import { partesMultipla } from "./selecao";
import type { Contexto, EtapaConfig, Opcao, ReacaoConfig } from "./tipos";

// onde o servidor deixa o resultado de uma reação numa etapa
export const chaveReacao = (reacao: string, etapa: string) => `${reacao}:${etapa}`;

// o que a pessoa escreveu com as próprias palavras: texto (que não é chip nem "pular")
// ou a parte livre da múltipla escolha. Opção marcada e chip não contam (o texto é nosso).
export function textoLivre(e: EtapaConfig, valor: string | undefined, oferecidas: { opcoes: Opcao[]; atalhos: Opcao[] }): string {
  const v = (valor ?? "").trim();
  if (!v) return "";
  if (e.tipo === "texto") {
    if (e.pular && v === e.pular.valor) return "";
    if (oferecidas.atalhos.some((o) => o.valor === v)) return "";
    return v;
  }
  if (e.tipo === "multipla") {
    const valores = new Set(oferecidas.opcoes.map((o) => o.valor));
    return partesMultipla(v)
      .filter((p) => !valores.has(p))
      .join(" ")
      .trim();
  }
  return "";
}

export function reacaoValeNaEtapa(r: ReacaoConfig, e: EtapaConfig): boolean {
  if (r.etapas) return r.etapas.includes(e.id);
  return e.tipo === "texto" || e.tipo === "multipla";
}

// o tipo da reação nesta etapa: o servidor decide quando a resposta dele ainda vale
// ("nenhuma" ou tipo sem fala = não reage); senão o detector local. Erro no detector = não reage.
export function decidirReacao(r: ReacaoConfig, ctx: Contexto, e: EtapaConfig, trecho: string): { tipo: string; origem: "servidor" | "local" } | null {
  if (!trecho) return null;
  const k = chaveReacao(r.id, e.id);
  if (r.geracao && geradoValido(ctx, k)) {
    const t = ctx.gerados?.[k]?.dados?.tipo;
    if (typeof t === "string" && t) return r.falas[t] ? { tipo: t, origem: "servidor" } : null;
  }
  let t: string | null = null;
  try {
    t = r.detectar(trecho, ctx, e);
  } catch {
    t = null;
  }
  return t && r.falas[t] ? { tipo: t, origem: "local" } : null;
}
