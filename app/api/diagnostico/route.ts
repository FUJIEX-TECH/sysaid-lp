import { NextRequest } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { jsonWithCors, preflight } from "@/lib/cors";

export const runtime = "nodejs";

// Diagnóstico ITSM (variante B): grava a classificação nas colunas diag_* da
// tabela leads. As colunas vêm da migração lib/migrations/2026-10-28-diagnostico.sql,
// que NÃO foi aplicada em produção (28/10/2026). Por isso a rota só grava quando
// DIAGNOSTICO_PERSIST=true (só em .env.local / ambiente de teste, nunca na
// Vercel); em qualquer outro caso responde ok sem tocar no banco. O lead em si
// já foi gravado pela /api/lead; isto é enfeite best-effort.
// O texto livre da dor só é gravado com a flag ligada (LGPD, decisão 5 do plano).

const schema = z.object({
  id: z.number().int().positive(),
  diag: z.object({
    variante: z.string().max(8),
    origem: z.string().max(16),
    concorrente: z.string().max(40).nullable().optional(),
    respostas: z.record(z.string(), z.string().max(2000)),
    pontos: z.number().int().min(0).max(15),
    detalhe: z.record(z.string(), z.number()),
    classe: z.enum(["forte", "medio", "fraco"]),
    rotulo: z.enum(["cotando", "fora", "cliente"]).nullable(),
    rotulo_origem: z.enum(["jev", "fallback"]),
    rota: z.string().max(16),
    segundos: z.number().int().min(0),
  }),
});

export async function OPTIONS(req: NextRequest) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWithCors(origin, { ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(origin, { ok: false, error: "Dados inválidos" }, { status: 422 });
  }

  if (process.env.DIAGNOSTICO_PERSIST !== "true") {
    return jsonWithCors(origin, { ok: true, gravado: false, motivo: "DIAGNOSTICO_PERSIST desligado" });
  }

  const { id, diag } = parsed.data;
  const r = diag.respostas;
  try {
    const sql = getSql();
    await sql`
      UPDATE leads SET
        diag_variante = ${diag.variante},
        diag_origem = ${diag.origem},
        diag_situacao = ${r.situacao ?? null},
        diag_ferramenta = ${r.ferramenta === "outra" ? r.ferramenta_outra ?? "outra" : r.ferramenta ?? diag.concorrente ?? null},
        diag_dor = ${r.dor ?? null},
        diag_dor_texto = ${r.dor_texto ?? null},
        diag_aprof = ${r.aprof ?? null},
        diag_usuarios = ${r.usuarios ?? null},
        diag_papel = ${r.papel ?? null},
        diag_prazo = ${r.prazo ?? null},
        diag_pontos = ${diag.pontos},
        diag_classe = ${diag.classe},
        diag_rotulo = ${diag.rotulo},
        diag_rota = ${diag.rota},
        diag_segundos = ${diag.segundos},
        diag_json = ${JSON.stringify(diag)}::jsonb
      WHERE id = ${id}
    `;
    return jsonWithCors(origin, { ok: true, gravado: true });
  } catch (err) {
    // coluna inexistente (migração não aplicada) ou banco fora: nunca derruba o lead
    console.error("diagnostico: gravação falhou:", err);
    return jsonWithCors(origin, { ok: true, gravado: false, motivo: "erro ao gravar" });
  }
}
