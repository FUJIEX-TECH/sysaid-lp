import { NextRequest, NextResponse } from "next/server";
import { partialLeadSchema, nullify } from "@/lib/validation";
import { insertPartialLead, updatePartialLead } from "@/lib/db";
import { getEmailDomain, isCorporateEmail } from "@/lib/email-domains";

export const runtime = "nodejs";

// Captura silenciosa por etapa do formulario progressivo (email -> nome+telefone).
// Nunca dispara RD Station nem e-mail de notificacao - so garante que o lead
// nao se perde se ele abandonar antes do passo final. Ver app/api/lead/route.ts
// para a finalizacao (completion='complete').
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = partialLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  // honeypot: finge sucesso e descarta, sem gravar nada
  if (d.website && d.website.length > 0) {
    return NextResponse.json({ ok: true, id: null });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;

  // trava de e-mail: so conta se o client avisou E o dominio de fato nao e
  // corporativo (nao confia no flag sozinho). Grava so o dominio, nunca mais
  // que isso: o e-mail inteiro ja estava na linha parcial.
  const email = nullify(d.email);
  const blocked_domain =
    d.blocked === true && email && !isCorporateEmail(email) ? getEmailDomain(email) || null : null;

  const fields = {
    email,
    name: nullify(d.name),
    phone: nullify(d.phone),
    company: nullify(d.company),
    utm_source: nullify(d.utm_source),
    utm_medium: nullify(d.utm_medium),
    utm_campaign: nullify(d.utm_campaign),
    utm_content: nullify(d.utm_content),
    utm_term: nullify(d.utm_term),
    gclid: nullify(d.gclid),
    page_url: nullify(d.page_url),
    referrer: nullify(d.referrer),
    user_agent: userAgent,
    ip,
    blocked_domain,
  };

  try {
    if (d.id) {
      const updated = await updatePartialLead(d.id, fields);
      if (updated) return NextResponse.json({ ok: true, id: d.id });
      // id nao existe mais como parcial (ex: ja foi finalizado, ou é de outro
      // ambiente) - cria uma linha parcial nova em vez de falhar silenciosamente
    }
    const id = await insertPartialLead(fields);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("insertPartialLead/updatePartialLead falhou:", err);
    // nunca bloqueia o usuario por causa da captura silenciosa
    return NextResponse.json({ ok: true, id: null });
  }
}
