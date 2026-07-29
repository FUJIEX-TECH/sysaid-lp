import { NextRequest, NextResponse } from "next/server";
import { finalizeLeadSchema, nullify } from "@/lib/validation";
import { finalizeLead, markRdStation } from "@/lib/db";
import { sendToRdStation } from "@/lib/rdstation";
import { notifyNewLead } from "@/lib/email";

export const runtime = "nodejs";

// Finalizacao do formulario (passo 3): so aqui o lead vira completion='complete'
// e dispara RD Station + notificacao interna. As etapas parciais (email,
// nome+telefone) vivem em app/api/lead/partial/route.ts e nunca chegam aqui
// sozinhas - so gravam no banco.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = finalizeLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  // honeypot: se preenchido, finge sucesso e descarta (bot)
  if (d.website && d.website.length > 0) {
    return NextResponse.json({ ok: true, id: null });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;

  const lead = {
    email: d.email.toLowerCase(),
    name: nullify(d.name),
    company: nullify(d.company),
    phone: nullify(d.phone),
    num_admins: nullify(d.num_admins),
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
  };

  // 1. grava no banco (fonte de verdade). Se veio "id" das etapas parciais,
  // completa a mesma linha (completion='complete'); senao insere direto.
  let id: number;
  try {
    id = await finalizeLead(d.id ?? null, lead);
  } catch (err) {
    console.error("finalizeLead falhou:", err);
    return NextResponse.json({ ok: false, error: "Erro ao gravar" }, { status: 500 });
  }

  // 2. integracoes best-effort: nao derrubam o lead se falharem.
  // DISABLE_INTEGRATIONS=true (so em .env.local, nunca na Vercel) pula RD
  // Station e o e-mail de notificacao pra testar o formulario localmente
  // sem sujar o CRM real nem notificar o time - o banco (dev=prod) ainda grava.
  if (process.env.DISABLE_INTEGRATIONS === "true") {
    console.log(`[DISABLE_INTEGRATIONS] lead ${id} finalizado - RD Station e e-mail pulados`, lead);
    await markRdStation(id, "failed", "pulado (DISABLE_INTEGRATIONS=true, teste local)").catch(() => {});
    return NextResponse.json({ ok: true, id });
  }

  const rd = await sendToRdStation(lead);
  await markRdStation(id, rd.ok ? "sent" : "failed", rd.detail).catch(() => {});

  notifyNewLead({
    id,
    email: lead.email,
    name: lead.name,
    company: lead.company,
    phone: lead.phone,
    num_admins: lead.num_admins,
    utm_campaign: lead.utm_campaign,
    utm_source: lead.utm_source,
    gclid: lead.gclid,
    page_url: lead.page_url,
  }).catch((err) => console.error("notifyNewLead falhou:", err));

  return NextResponse.json({ ok: true, id });
}
