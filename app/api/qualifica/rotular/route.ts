import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarJev, escolhaDe, noulDe } from "@/lib/conversa-core/servidor";
import type { RotuloJev } from "@/lib/conversa-core";
import { JEV_SYSAID, ROTULOS_JEV, perguntasRotuloGenerica } from "@/lib/diagnostico/servidor-sysaid";
import { pedido } from "@/lib/diagnostico/generica-sysaid";

export const runtime = "nodejs";

// Qualifica v2 · busca genérica (13/11/2026): rótulo e coerência do Jev no fim,
// com os campos deste fluxo. Sem e-mail, nome, telefone, empresa nem cargo: o Jev
// não precisa de dado pessoal pra rotular. Fallback = a classe do código vale sozinha.

const schema = z.object({
  sessao: z.string().min(8).max(64),
  respostas: z.record(z.string(), z.string().max(2000)),
  origem: z.string().max(16),
  variaveis: z.record(z.string(), z.string().nullable()),
});
const jev = criarJev(JEV_SYSAID);
const FALLBACK: RotuloJev = { rotulo: null, motivo: null, origem: "fallback" };

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 422 });
  const { sessao, respostas: r, origem } = parsed.data;
  const estado = {
    origem,
    problema_contado: r.situacao_texto ?? "",
    resposta_a_implicacao: r.implicacao ?? null,
    outro_problema_contado: r.dor_releitura ?? null,
    outras_dores: r.dores_mais ?? null,
    consequencias: r.consequencias ?? null,
    papel_na_decisao: r.papel ?? null,
    pessoas_atendidas: r.usuarios ?? null,
    tecnicos: r.tecnicos ?? null,
    tempo_que_o_time_perde: r.tempo ?? null,
    o_que_quer: r.payoff ?? null,
    proximo_passo: pedido(r),
  };
  const rj = await jev.perguntar({ sessao, estado, perguntas: perguntasRotuloGenerica() });
  if (process.env.NODE_ENV !== "production") console.log("[qualifica/rotular]", JSON.stringify({ origem: rj.origem, ms: rj.ms, motivo: rj.motivo }));
  if (!rj.respostas) return NextResponse.json(FALLBACK);
  const rotulo = escolhaDe(rj.respostas, "rotulo", Object.keys(ROTULOS_JEV), 0.5);
  const coerente = noulDe(rj.respostas, "coerente", 0.4);
  const especifico = rotulo === "fora" || rotulo === "cliente";
  const incoerente = coerente === false && !especifico;
  const resposta: RotuloJev = {
    rotulo: incoerente ? "incoerente" : rotulo && rotulo !== "nenhum" ? rotulo : null,
    motivo: incoerente ? "respostas contraditórias" : rotulo && rotulo !== "nenhum" ? ROTULOS_JEV[rotulo] : null,
    origem: "jev",
    dados: { ...(coerente !== null ? { coerente: coerente ? "sim" : "nao" } : {}), ...(rotulo ? { rotulo_jev: rotulo } : {}) },
  };
  return NextResponse.json(resposta);
}
