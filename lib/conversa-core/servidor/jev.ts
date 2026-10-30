// conversa-core/servidor — cliente do Jev (TypeSafe AI, System One) em TS, pra
// rodar nas rotas de API do cliente. O Jev DECIDE (rótulo, coerência, dor no
// texto livre) e nunca escreve frase pro lead. Timeout curto (o plano pede
// 800 ms), teto por sessão/hora, falha = `null` e o código segue sem o rótulo.
// Chave em JEV_API_KEY (a mesma do 09-Agentes/jev/jev.py por enquanto; tráfego
// de cliente em produção precisa de chave própria, decisão 7 do plano).
import type { JevServidorConfig, PerguntaJev, RespostaJev } from "../tipos";
import { reservar } from "./custo";

export type ResultadoJev = {
  respostas: RespostaJev | null;
  origem: "ok" | "fallback" | "desligado";
  ms: number;
  motivo?: string;
};

export function criarJev(cfg: JevServidorConfig) {
  async function perguntar(args: { sessao: string; estado: unknown; perguntas: Record<string, PerguntaJev> }): Promise<ResultadoJev> {
    const t0 = Date.now();
    if (!cfg.habilitado) return { respostas: null, origem: "desligado", ms: 0 };
    const chave = process.env.JEV_API_KEY;
    if (!chave) return { respostas: null, origem: "fallback", ms: 0, motivo: "sem JEV_API_KEY" };
    const vaga = reservar("jev", args.sessao, cfg.tetos);
    if (!vaga.ok) return { respostas: null, origem: "fallback", ms: 0, motivo: `teto:${vaga.motivo}` };

    // o timeout vale pro total (uma chamada, ou duas quando a 1ª cai em 5xx rápido:
    // o Jev devolve 529 "overloaded" em ~200 ms e costuma atender na 2ª)
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), cfg.timeoutMs);
    const corpo = JSON.stringify({ model: cfg.modelo, state: args.estado, questions: args.perguntas });
    try {
      for (let tentativa = 1; ; tentativa++) {
        const res = await fetch(cfg.url, {
          method: "POST",
          headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
          body: corpo,
          signal: ctl.signal,
        });
        if (res.status >= 500 && tentativa === 1 && Date.now() - t0 < cfg.timeoutMs / 3) continue;
        if (!res.ok) return { respostas: null, origem: "fallback", ms: Date.now() - t0, motivo: `http ${res.status}` };
        const data = (await res.json()) as { answers?: RespostaJev };
        if (!data.answers) return { respostas: null, origem: "fallback", ms: Date.now() - t0, motivo: "sem answers" };
        return { respostas: data.answers, origem: "ok", ms: Date.now() - t0 };
      }
    } catch (err) {
      const motivo = err instanceof Error && err.name === "AbortError" ? "timeout" : "erro";
      return { respostas: null, origem: "fallback", ms: Date.now() - t0, motivo };
    } finally {
      clearTimeout(timer);
    }
  }

  return { perguntar, cfg };
}

export type Jev = ReturnType<typeof criarJev>;

// Lê uma resposta "choice" do Jev: devolve a opção escolhida se estiver na lista
// permitida e a confiança (quando vier) passar do mínimo; senão `null`.
export function escolhaDe(respostas: RespostaJev | null, nome: string, permitidas: string[], minConfianca = 0): string | null {
  const r = respostas?.[nome];
  if (!r || typeof r !== "object") return null;
  const o = r as { choice?: unknown; confidence?: unknown };
  if (typeof o.choice !== "string" || !permitidas.includes(o.choice)) return null;
  if (typeof o.confidence === "number" && o.confidence < minConfianca) return null;
  return o.choice;
}

// Lê uma resposta "noul" (0 a 1) como booleano com corte.
export function noulDe(respostas: RespostaJev | null, nome: string, corte = 0.5): boolean | null {
  const r = respostas?.[nome];
  if (!r || typeof r !== "object") return null;
  const v = (r as { noul?: unknown }).noul;
  return typeof v === "number" ? v >= corte : null;
}
