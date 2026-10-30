// conversa-core — cliente do Jev (decide/classifica) com timeout e fallback.
// Contrato: o motor nunca espera o Jev pra seguir o fluxo; só usa a resposta
// se ela chegar dentro de `timeoutMs`. Falha ou timeout = fallback (rótulo null).
import type { JevConfig, Respostas, RotuloJev } from "./tipos";

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

export async function rotularComJev(cfg: JevConfig, respostas: Respostas): Promise<RotuloJev> {
  const fallback: RotuloJev = { rotulo: null, motivo: null, origem: "fallback" };
  if (!cfg.habilitado) return fallback;
  return comTimeout(
    (async () => {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respostas),
      });
      if (!res.ok) return fallback;
      const data = (await res.json()) as Partial<RotuloJev>;
      return { rotulo: data.rotulo ?? null, motivo: data.motivo ?? null, origem: "jev" as const };
    })(),
    cfg.timeoutMs,
    fallback
  );
}
