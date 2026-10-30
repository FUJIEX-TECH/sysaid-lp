import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarLeitorDeEmpresa } from "@/lib/conversa-core/servidor";
import { isCorporateEmail } from "@/lib/email-domains";
import { EMPRESA_SYSAID } from "@/lib/diagnostico/servidor-sysaid";

export const runtime = "nodejs";

// Qualifica v2 (30/10/2026): empresa pelo domínio do e-mail. O navegador manda
// SÓ o domínio; o leitor genérico (lib/conversa-core/servidor/empresa.ts) lê o
// site público e, se achar CNPJ, a BrasilAPI. Domínio de e-mail gratuito ou
// descartável não é lido (a trava da LP já barra antes). Nada é logado.

const schema = z.object({
  dominio: z
    .string()
    .min(4)
    .max(253)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i),
});

const leitor = criarLeitorDeEmpresa(EMPRESA_SYSAID);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 422 });
  const dominio = parsed.data.dominio.toLowerCase();
  if (!isCorporateEmail(`contato@${dominio}`)) return NextResponse.json({ ok: false, error: "domínio não corporativo" }, { status: 422 });

  const t0 = Date.now();
  const empresa = await leitor.ler(dominio);
  if (process.env.NODE_ENV !== "production") console.log("[diagnostico/empresa]", JSON.stringify({ origem: empresa.origem, ms: Date.now() - t0, logo: !!empresa.logo, cnpj: !!empresa.cnpj }));
  return NextResponse.json(empresa, { headers: { "Cache-Control": "private, max-age=3600" } });
}
