// conversa-core/servidor — cliente da API da Anthropic (modelo pequeno) que SÓ
// ESCREVE texto curto: palpite, pergunta, linha do mapa. Nunca classifica,
// pontua nem roteia (isso é do código e do Jev). Timeout, cache por chave de
// entrada, teto de custo por sessão e por hora, medição; falha = `null`, e quem
// chama cai no texto fixo da configuração. Só roda no servidor (chave em
// ANTHROPIC_API_KEY). Nada aqui conhece cliente algum: prompts vêm de fora.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import type { LLMConfig } from "../tipos";
import { chaveDe, criarCache, registrarCusto, reservar } from "./custo";

export type ResultadoLLM<T> = {
  valor: T | null;
  origem: "ok" | "cache" | "fallback" | "desligado";
  custoUsd: number;
  ms: number;
  motivo?: string;
};

export function criarLLM(cfg: LLMConfig) {
  const cache = criarCache<unknown>(cfg.cache.ttlMs, cfg.cache.maximo);
  let cliente: Anthropic | null = null;
  function anthropic(): Anthropic | null {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    // timeout em milissegundos no SDK de TypeScript; sem retry: a pessoa não espera
    cliente ??= new Anthropic({ timeout: cfg.timeoutMs, maxRetries: 0 });
    return cliente;
  }

  function custo(entrada: number, saida: number): number {
    return (entrada * cfg.precoPorMilhao.entrada + saida * cfg.precoPorMilhao.saida) / 1_000_000;
  }

  // Gera um JSON no formato `schema` a partir de `system` (fixo, cacheado na
  // API) + `prompt` (varia). `chave` identifica a entrada pro cache local.
  async function gerar<S extends z.ZodType>(args: {
    sessao: string;
    chave: string[];
    system: string;
    prompt: string;
    schema: S;
  }): Promise<ResultadoLLM<z.infer<S>>> {
    const t0 = Date.now();
    if (!cfg.habilitado) return { valor: null, origem: "desligado", custoUsd: 0, ms: 0 };
    const chave = chaveDe(cfg.modelo, args.system.length.toString(), ...args.chave);
    const emCache = cache.get(chave);
    if (emCache !== undefined) return { valor: emCache as z.infer<S>, origem: "cache", custoUsd: 0, ms: Date.now() - t0 };

    const vaga = reservar("llm", args.sessao, cfg.tetos);
    if (!vaga.ok) return { valor: null, origem: "fallback", custoUsd: 0, ms: 0, motivo: `teto:${vaga.motivo}` };
    const api = anthropic();
    if (!api) return { valor: null, origem: "fallback", custoUsd: 0, ms: 0, motivo: "sem ANTHROPIC_API_KEY" };

    try {
      const res = await api.messages.parse({
        model: cfg.modelo,
        max_tokens: cfg.maxTokens,
        // texto curto e rápido: sem raciocínio, esforço baixo
        thinking: { type: "disabled" },
        output_config: { effort: "low", format: zodOutputFormat(args.schema) },
        system: [{ type: "text", text: args.system, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: args.prompt }],
      });
      const u = res.usage;
      const custoUsd = custo((u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0), u.output_tokens ?? 0);
      registrarCusto("llm", custoUsd);
      if (res.stop_reason === "refusal" || !res.parsed_output) {
        return { valor: null, origem: "fallback", custoUsd, ms: Date.now() - t0, motivo: res.stop_reason ?? "sem saída" };
      }
      cache.set(chave, res.parsed_output);
      return { valor: res.parsed_output, origem: "ok", custoUsd, ms: Date.now() - t0 };
    } catch (err) {
      const motivo =
        err instanceof Anthropic.APIError ? `api ${err.status ?? err.name}` : err instanceof Error ? `${err.name}: ${err.message.slice(0, 80)}` : "erro";
      return { valor: null, origem: "fallback", custoUsd: 0, ms: Date.now() - t0, motivo };
    }
  }

  return { gerar, cfg };
}

export type LLM = ReturnType<typeof criarLLM>;
