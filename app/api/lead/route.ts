import { NextRequest } from "next/server";
import { finalizeLeadSchema, nullify } from "@/lib/validation";
import { finalizeLead, markRdStation } from "@/lib/db";
import { sendToRdStation } from "@/lib/rdstation";
import { notifyNewLead } from "@/lib/email";
import { jsonWithCors, preflight } from "@/lib/cors";
import { detectTestEnvironment } from "@/lib/ambiente";

export const runtime = "nodejs";

// Preflight CORS: o site novo sysaid.com.br (estatico, outro dominio) usa este
// mesmo funil. Origens permitidas em lib/cors.ts.
export async function OPTIONS(req: NextRequest) {
  return preflight(req.headers.get("origin"));
}

// Finalizacao do formulario (passo 3): so aqui o lead vira completion='complete'
// e dispara RD Station + notificacao interna. As etapas parciais (email,
// nome+telefone) vivem em app/api/lead/partial/route.ts e nunca chegam aqui
// sozinhas - so gravam no banco.
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWithCors(origin, { ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = finalizeLeadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      origin,
      { ok: false, error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  // honeypot: se preenchido, finge sucesso e descarta (bot ou autofill).
  // "hp: true" avisa o formulario pra NAO disparar a conversao do Google Ads:
  // antes a /obrigado contava como lead um envio que nunca entrou no banco
  // (14/10/2026: conversao na TopDesk sem linha no banco). Log sem dado pessoal.
  if (d.website && d.website.length > 0) {
    console.warn("honeypot (final) descartou envio:", {
      dominio: d.email.split("@")[1] ?? null,
      utm_campaign: d.utm_campaign ?? null,
      gclid: d.gclid ? "sim" : "nao",
      form: d.form || "lp",
      website_len: d.website.length,
    });
    return jsonWithCors(origin, { ok: true, id: null, hp: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;
  const form = d.form || "lp";

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
    return jsonWithCors(origin, { ok: false, error: "Erro ao gravar" }, { status: 500 });
  }

  // 2. integracoes best-effort: nao derrubam o lead se falharem.
  // DISABLE_INTEGRATIONS=true (so em .env.local, nunca na Vercel) pula RD
  // Station e o e-mail de notificacao pra testar o formulario localmente
  // sem sujar o CRM real nem notificar o time - o banco (dev=prod) ainda grava.
  if (process.env.DISABLE_INTEGRATIONS === "true") {
    console.log(`[DISABLE_INTEGRATIONS] lead ${id} finalizado - RD Station e e-mail pulados`, lead);
    await markRdStation(id, "failed", "pulado (DISABLE_INTEGRATIONS=true, teste local)").catch(() => {});
    return jsonWithCors(origin, { ok: true, id });
  }

  // Envio de teste (stg.sysaid.com.br, preview, localhost): grava no banco com o
  // page_url do ambiente, mas nao manda pro RD Station nem avisa por e-mail.
  const hostDeTeste = detectTestEnvironment(origin, lead.page_url);
  if (hostDeTeste) {
    console.log(`[ambiente de teste: ${hostDeTeste}] lead ${id} finalizado - RD Station e e-mail pulados`);
    await markRdStation(id, "failed", `pulado (ambiente de teste: ${hostDeTeste})`).catch(() => {});
    return jsonWithCors(origin, { ok: true, id, teste: hostDeTeste });
  }

  const rd = await sendToRdStation({ ...lead, form });
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
    form,
  }).catch((err) => console.error("notifyNewLead falhou:", err));

  return jsonWithCors(origin, { ok: true, id });
}
