// ==========================================================================
// Diagnóstico ITSM — ponto de encaixe do Jev (09-Agentes/jev/jev.py).
// Parte 1 (28/10/2026): STUB. O Jev decide e classifica (rótulos "só cotando",
// "fora do perfil", "cliente atual", coerência, dor no texto livre); a API da
// Anthropic escreve texto (parte 2+, decisão do Fernando de 28/10/2026).
//
// Contrato: toda chamada ao Jev passa por `comTimeout` (800 ms, plano seção 3)
// e devolve o fallback quando estoura ou falha. O motor nunca espera o Jev
// pra seguir o fluxo; só usa a resposta se ela chegar a tempo.
// ==========================================================================

import type { Respostas } from "./fluxo";
import type { Rotulo } from "./pontuacao";

export const JEV_TIMEOUT_MS = 800;

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

export type RotuloJev = { rotulo: Rotulo; motivo: string | null; origem: "jev" | "fallback" };

// Parte 2: trocar o corpo por `fetch("/api/diagnostico/rotular", ...)`, que fala
// com o jev.py no servidor. Até lá, resolve "fallback" na hora (sem rede), e o
// código aplica só os rótulos que já sabe (pontuacao.ts, rotuloCodigo).
export async function rotularComJev(_respostas: Respostas): Promise<RotuloJev> {
  const fallback: RotuloJev = { rotulo: null, motivo: null, origem: "fallback" };
  if (process.env.NEXT_PUBLIC_DIAG_JEV !== "1") return fallback;
  return comTimeout(
    (async () => {
      const res = await fetch("/api/diagnostico/rotular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(_respostas),
      });
      if (!res.ok) return fallback;
      const data = (await res.json()) as Partial<RotuloJev>;
      return { rotulo: data.rotulo ?? null, motivo: data.motivo ?? null, origem: "jev" as const };
    })(),
    JEV_TIMEOUT_MS,
    fallback
  );
}
