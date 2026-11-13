import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonWithCors, preflight } from "@/lib/cors";
import { gravarConversa, leadConfere } from "@/lib/qualifica-db";
import { validarHorarios } from "@/lib/conversa-core";
import { REGRAS_HORARIO, pedido } from "@/lib/diagnostico/generica-sysaid";

export const runtime = "nodejs";

// Qualifica v2 (13/11/2026): guarda a conversa inteira do lead (pro /admin/qualifica).
// Chamada pela persistência a partir do e-mail (lead parcial) e no fim. Só grava se o
// lead existe, é do mesmo e-mail e é recente; os horários pedidos são conferidos de novo
// aqui com as mesmas regras do chat (dias úteis, 9h às 18h, a partir do próximo dia útil).
// Best-effort: nunca derruba o lead.

const LIMITE = 250_000;
const turno = z.object({
  quem: z.enum(["bot", "pessoa"]),
  tipo: z.string().max(16),
  etapa: z.string().max(40).optional(),
  texto: z.string().max(3000),
  valor: z.string().max(2000).optional(),
  via: z.string().max(16).optional(),
  oferecidas: z.array(z.string().max(300)).max(20).optional(),
  cartao: z.record(z.string(), z.string().max(3000)).optional(),
  em: z.string().max(40).optional(),
});
const schema = z.object({
  sessao: z.string().min(8).max(64),
  lead_id: z.number().int().positive(),
  email: z.string().email().max(255),
  seq: z.number().int().min(0).max(100000),
  fluxo: z.string().max(40),
  origem: z.string().max(16),
  completo: z.boolean(),
  website: z.string().max(512).optional(),
  conversa: z.array(turno).max(300),
  dados: z.object({
    respostas: z.record(z.string(), z.string().max(2000)),
    derivados: z.record(z.string(), z.unknown()).optional(),
    gerados: z.record(z.string(), z.unknown()).optional(),
    empresa: z.unknown().optional(),
    sinais: z.unknown().optional(),
    variaveis: z.record(z.string(), z.string().nullable()).optional(),
    classificacao: z.unknown().optional(),
    medicao: z.unknown().optional(),
  }),
});

export async function OPTIONS(req: NextRequest) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const bruto = await req.text();
  if (bruto.length > LIMITE) return jsonWithCors(origin, { ok: false, error: "grande demais" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(bruto);
  } catch {
    return jsonWithCors(origin, { ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonWithCors(origin, { ok: false, error: "Dados inválidos" }, { status: 422 });
  const d = parsed.data;
  if (d.website) return jsonWithCors(origin, { ok: true, gravado: false });

  try {
    if (!(await leadConfere(d.lead_id, d.email))) return jsonWithCors(origin, { ok: false, error: "lead não confere" }, { status: 403 });
    const r = d.dados.respostas;
    const valorHorarios = r.reuniao === "orcamento" ? r.reuniao_orcamento : r.reuniao;
    let horarios: { data: string; hora: string }[] | null = null;
    let horariosValidos: boolean | null = null;
    if (valorHorarios && valorHorarios !== "orcamento" && valorHorarios !== "whatsapp") {
      const v = validarHorarios(valorHorarios, REGRAS_HORARIO, new Date());
      horariosValidos = v.ok;
      horarios = v.ok ? v.horarios : null;
      if (!v.ok) console.warn("qualifica/conversa: horários fora das regras", { sessao: d.sessao.slice(0, 8), motivo: v.motivo });
    }
    const id = await gravarConversa({
      sessao: d.sessao,
      lead_id: d.lead_id,
      seq: d.seq,
      fluxo: d.fluxo,
      origem: d.origem,
      completo: d.completo,
      pedido: pedido(r),
      papel: r.papel ?? null,
      horarios,
      horarios_validos: horariosValidos,
      conversa: d.conversa,
      dados: d.dados as Record<string, unknown>,
    });
    return jsonWithCors(origin, { ok: true, gravado: id !== null, id, horarios: horariosValidos === false ? "invalidos" : undefined });
  } catch (err) {
    console.error("qualifica/conversa: gravação falhou:", err);
    return jsonWithCors(origin, { ok: true, gravado: false });
  }
}
