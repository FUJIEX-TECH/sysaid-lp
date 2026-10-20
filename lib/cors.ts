import { NextResponse } from "next/server";

// ==========================================================================
// CORS das rotas /api/lead e /api/lead/partial.
// O site novo sysaid.com.br (estático na Cloudflare, sem servidor) usa o
// MESMO funil da LP: ele chama estas rotas de outro domínio, então o browser
// manda um preflight (OPTIONS) e exige Access-Control-Allow-Origin na resposta.
// Lista fechada: só os domínios da SysAid Brasil. Pedido de origem fora da
// lista continua sendo processado como sempre (mesma origem da LP, curl,
// robô), só não recebe os cabeçalhos CORS, ou seja, o browser bloqueia a leitura.
// ==========================================================================

const ALLOWED_ORIGINS = new Set<string>([
  "https://sysaid.com.br",
  "https://www.sysaid.com.br",
  // endereço provisório do site novo até a virada (atrás do Cloudflare Access)
  "https://stg.sysaid.com.br",
  // LEAD_CORS_EXTRA_ORIGINS="http://localhost:3100,https://x.workers.dev" (opcional, Vercel)
  ...(process.env.LEAD_CORS_EXTRA_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
]);

// Em desenvolvimento, o site novo roda em http://localhost:3100 (CLAUDE.md dele).
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.add("http://localhost:3100");
  ALLOWED_ORIGINS.add("http://127.0.0.1:3100");
}

export function isAllowedOrigin(origin: string | null): origin is string {
  return !!origin && ALLOWED_ORIGINS.has(origin);
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// Resposta JSON com os cabeçalhos CORS da origem do pedido (quando permitida).
export function jsonWithCors(
  origin: string | null,
  body: unknown,
  init?: { status?: number }
): NextResponse {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: corsHeaders(origin) });
}

// Preflight. Origem fora da lista recebe 204 sem cabeçalhos CORS (o browser bloqueia).
export function preflight(origin: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
