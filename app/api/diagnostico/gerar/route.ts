import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chaveDe, criarCache, criarJev, criarLLM, escolhaDe } from "@/lib/conversa-core/servidor";
import type { Gerado } from "@/lib/conversa-core";
import { DORES_JEV, JEV_SYSAID_GERAR, LLM_SYSAID, PALPITE_PROMPT, SAIDA_PALPITE, SITUACOES, SYSTEM_PALPITE, perguntasDor, semHoje, travaGerado } from "@/lib/diagnostico/servidor-sysaid";

export const runtime = "nodejs";

// Diagnóstico ITSM, parte 2 (30/10/2026): geração "palpite" chamada pelo chat
// ENQUANTO a pessoa digita a dor (lib/conversa-core/ui, config.geracoes).
// Jev decide a dor a partir do texto (800 ms); a LLM (Haiku) escreve o palpite,
// a pergunta de aprofundamento e 3 opções. Jev fora = sem geração (o chat segue
// com a lista de dores); LLM fora = sem geração (pergunta fixa da config).
// `para` diz pra quais respostas o texto vale; o chat descarta se mudarem.
// Nunca classifica, pontua nem roteia: só devolve texto e o dado do Jev.

const schema = z.object({
  id: z.literal("palpite"),
  sessao: z.string().min(8).max(64),
  respostas: z.record(z.string(), z.string().max(2000)),
  origem: z.string().max(16),
  variaveis: z.record(z.string(), z.string().nullable()),
});

const llm = criarLLM(LLM_SYSAID);
const jev = criarJev(JEV_SYSAID_GERAR);
const DORES = Object.keys(DORES_JEV);
// a decisão do Jev pro mesmo texto é a mesma: cache (o Jev oscila entre 529 e ~830 ms)
const cacheDor = criarCache<string>(LLM_SYSAID.cache.ttlMs, LLM_SYSAID.cache.maximo);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 422 });

  const { sessao, respostas, origem } = parsed.data;
  const texto = (respostas.dor_texto ?? "").trim();
  if (texto.length < 15) return NextResponse.json({ ok: false, error: "texto curto" }, { status: 422 });
  const t0 = Date.now();

  // 1) Jev decide a dor
  const estado = {
    origem,
    situacao: respostas.situacao ?? null,
    ferramenta: respostas.ferramenta ?? respostas.ferramenta_outra ?? null,
    texto_livre: texto,
  };
  const chaveDor = chaveDe("dor", respostas.situacao ?? "", texto);
  let dor = cacheDor.get(chaveDor) ?? null;
  let rj: Awaited<ReturnType<typeof jev.perguntar>> = { respostas: null, origem: "ok", ms: 0, motivo: "cache" };
  if (!dor) {
    rj = await jev.perguntar({ sessao, estado, perguntas: perguntasDor() });
    dor = escolhaDe(rj.respostas, "dor", DORES, 0.35);
    if (dor) cacheDor.set(chaveDor, dor);
  }
  if (!dor || dor === "vaga") {
    log({ etapa: "jev", origem: rj.origem, ms: rj.ms, motivo: rj.motivo ?? dor ?? "sem dor" });
    return NextResponse.json({ ok: false, motivo: rj.origem === "ok" ? "dor vaga" : `jev ${rj.motivo ?? rj.origem}` });
  }

  // 2) LLM escreve (chave de cache: dor + texto normalizado + situação)
  const rl = await llm.gerar({
    sessao,
    chave: ["palpite", dor, respostas.situacao ?? "", texto],
    system: SYSTEM_PALPITE,
    prompt: PALPITE_PROMPT({ dor, descricao: DORES_JEV[dor], texto, situacao: SITUACOES[respostas.situacao ?? ""] }),
    schema: SAIDA_PALPITE,
  });
  log({ etapa: "llm", origem: rl.origem, ms: rl.ms, custoUsd: rl.custoUsd, motivo: rl.motivo, jevMs: rj.ms });
  if (!rl.valor) return NextResponse.json({ ok: false, motivo: `llm ${rl.motivo ?? rl.origem}` });

  const v = rl.valor;
  // trava de saída (servidor-sysaid.ts): palpite reprovado descarta tudo;
  // pergunta reprovada deixa só o palpite (pergunta e opções fixas da config)
  const trava = travaGerado(v);
  if (!trava.palpite) {
    log({ etapa: "trava", parte: "palpite", palpite: v.palpite });
    return NextResponse.json({ ok: false, motivo: "llm fora da regra" });
  }
  if (!trava.pergunta) log({ etapa: "trava", parte: "pergunta", pergunta: v.pergunta, opcoes: v.opcoes });
  const opcoes = v.opcoes.map((o) => o.trim());
  const gerado: Gerado = {
    id: "palpite",
    // só a entrada: a dor é saída (dados); quem precisa dela igual à resposta usa `seIgual`
    para: { dor_texto: texto },
    paraPrefixo: ["dor_texto"],
    textos: trava.pergunta ? { palpite: v.palpite.trim(), pergunta: semHoje(v.pergunta) } : { palpite: v.palpite.trim() },
    listas: trava.pergunta ? { opcoes } : undefined,
    dados: { dor },
    origem: rl.origem === "cache" ? "cache" : "servidor",
    medicao: { custoUsd: rl.custoUsd, ms: Date.now() - t0, llm: rl.origem, jev: rj.origem },
  };
  return NextResponse.json(gerado);
}

function log(d: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") console.log("[diagnostico/gerar]", JSON.stringify(d));
}
