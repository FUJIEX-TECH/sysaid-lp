import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarJev, escolhaDe, noulDe } from "@/lib/conversa-core/servidor";
import type { RotuloJev } from "@/lib/conversa-core";
import { DORES_JEV, JEV_SYSAID, ROTULOS_JEV, perguntasRotulo } from "@/lib/diagnostico/servidor-sysaid";

export const runtime = "nodejs";

// Diagnóstico ITSM, parte 2 (30/10/2026): rótulos do Jev no envio final
// (lib/conversa-core/jev.ts chama com timeout de 800 ms; passou, o código
// classifica só pelas escolhas). O Jev lê todas as respostas e decide:
//   rotulo    "cotando" | "fora" | "cliente" | null  (rótulo vence ponto)
//   coerente  false → rótulo "incoerente" (rota "fraco", ver rotaPorRotulo)
//   dor_texto a dor que ele lê no texto livre (vai pra ficha, não muda a rota)
// Nada aqui escreve frase pro lead.

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

  const { sessao, respostas, origem, variaveis } = parsed.data;
  const r = respostas;
  // o estado vai sem e-mail, nome, telefone e empresa: o Jev não precisa de dado pessoal pra rotular
  const estado = {
    origem,
    concorrente_da_pagina: variaveis.concorrente ?? null,
    situacao: r.situacao ?? null,
    ferramenta_atual: r.ferramenta === "outra" ? r.ferramenta_outra ?? "outra" : r.ferramenta ?? null,
    cliente_tipo: r.cliente_tipo ?? null,
    dor_escolhida: r.dor ?? null,
    texto_livre_da_dor: r.dor_texto ?? "",
    aprofundamento: r.aprof ?? null,
    pessoas_atendidas: r.usuarios ?? null,
    tecnicos: r.tecnicos ?? null,
    papel_na_decisao: r.papel ?? null,
    prazo: r.prazo ?? null,
  };

  const rj = await jev.perguntar({ sessao, estado, perguntas: perguntasRotulo() });
  if (process.env.NODE_ENV !== "production") console.log("[diagnostico/rotular]", JSON.stringify({ origem: rj.origem, ms: rj.ms, motivo: rj.motivo }));
  if (!rj.respostas) return NextResponse.json(FALLBACK);

  const rotulo = escolhaDe(rj.respostas, "rotulo", Object.keys(ROTULOS_JEV), 0.5);
  const coerente = noulDe(rj.respostas, "coerente", 0.4);
  const dorTexto = (r.dor_texto ?? "").trim().length >= 15 ? escolhaDe(rj.respostas, "dor_texto", Object.keys(DORES_JEV), 0.35) : null;

  const resposta: RotuloJev = {
    rotulo: coerente === false ? "incoerente" : rotulo && rotulo !== "nenhum" ? rotulo : null,
    motivo: coerente === false ? "respostas contraditórias" : rotulo && rotulo !== "nenhum" ? ROTULOS_JEV[rotulo] : null,
    origem: "jev",
    dados: {
      ...(dorTexto ? { dor_texto: dorTexto } : {}),
      ...(coerente !== null ? { coerente: coerente ? "sim" : "nao" } : {}),
      ...(rotulo ? { rotulo_jev: rotulo } : {}),
    },
  };
  return NextResponse.json(resposta);
}
