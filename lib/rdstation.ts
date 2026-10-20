// Envia a conversao para o RD Station, replicando a integracao que o site
// WordPress ja usa (mesmo token e mesmo identificador de conversao).
// Endpoint atual da RD Station (CDP conversions). O token publico da conta
// entra como api_key. Mapeamento de campos igual ao do plugin:
// nome->name, email->email, telefone->mobile_phone, empresa->company.

type RdLead = {
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  num_admins: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  form?: string | null;
};

// Identificador de conversao por formulario. O padrao ("site-fjx", o que o
// Kaique ligou nas automacoes em 30/07/2026) vale pra LP e pra qualquer
// formulario sem identificador proprio. Quando o Kaique passar os
// identificadores dos formularios do WordPress (demo, teste gratis, contato),
// basta definir na Vercel RDSTATION_IDENTIFIER_DEMO / _TRIAL / _CONTATO,
// sem mexer em codigo.
export function conversionIdentifierFor(form: string | null | undefined): string {
  const padrao = process.env.RDSTATION_CONVERSION_IDENTIFIER || "site-fjx";
  if (!form || form === "lp") return padrao;
  const porForm = process.env[`RDSTATION_IDENTIFIER_${form.toUpperCase()}`];
  return porForm && porForm.trim() ? porForm.trim() : padrao;
}

export type RdResult = { ok: boolean; detail: string };

export async function sendToRdStation(lead: RdLead): Promise<RdResult> {
  const token = process.env.RDSTATION_TOKEN;
  const identifier = conversionIdentifierFor(lead.form);

  if (!token) {
    return { ok: false, detail: "RDSTATION_TOKEN ausente" };
  }

  const payload = {
    event_type: "CONVERSION",
    event_family: "CDP",
    payload: {
      conversion_identifier: identifier,
      email: lead.email,
      name: lead.name ?? undefined,
      mobile_phone: lead.phone ?? undefined,
      company: lead.company ?? undefined,
      // campos personalizados uteis para o comercial
      cf_numero_de_administradores: lead.num_admins ?? undefined,
      traffic_source: lead.utm_source ?? undefined,
      traffic_medium: lead.utm_medium ?? undefined,
      traffic_campaign: lead.utm_campaign ?? undefined,
      traffic_value: lead.utm_content ?? undefined,
      cf_utm_term: lead.utm_term ?? undefined,
      cf_gclid: lead.gclid ?? undefined,
    },
  };

  try {
    const res = await fetch(
      `https://api.rd.services/platform/conversions?api_key=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    }
    return { ok: true, detail: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, detail: `fetch falhou: ${(err as Error).message}` };
  }
}
