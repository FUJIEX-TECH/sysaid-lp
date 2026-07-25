import { NextRequest, NextResponse } from "next/server";
import { leadSchema, nullify } from "@/lib/validation";
import { insertLead, markRdStation } from "@/lib/db";
import { sendToRdStation } from "@/lib/rdstation";
import { notifyNewLead } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
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

  // 1. grava no banco (fonte de verdade). Se isso falhar, o lead falha.
  let id: number;
  try {
    id = await insertLead(lead);
  } catch (err) {
    console.error("insertLead falhou:", err);
    return NextResponse.json({ ok: false, error: "Erro ao gravar" }, { status: 500 });
  }

  // 2. integracoes best-effort: nao derrubam o lead se falharem.
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
