import { Resend } from "resend";

// Notificacao interna de novo lead (para o Fernando saber que houve conversao).
// Remetente e destinatario vem de env. Best-effort: nunca derruba o lead.

type NotifyLead = {
  id: number;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  num_admins: string | null;
  utm_campaign: string | null;
  utm_source: string | null;
  gclid: string | null;
  page_url: string | null;
};

export async function notifyNewLead(lead: NotifyLead): Promise<{ ok: boolean; detail: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM;

  if (!apiKey || !to || !from) {
    return { ok: false, detail: "RESEND_API_KEY / LEAD_NOTIFY_TO / LEAD_NOTIFY_FROM ausentes" };
  }

  const resend = new Resend(apiKey);
  const row = (label: string, value: string | null) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#626262">${label}</td><td style="padding:4px 0;font-weight:600">${value}</td></tr>` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px">
      <h2 style="color:#175d4a;margin:0 0 4px">Novo lead — LP ITSM</h2>
      <p style="color:#626262;margin:0 0 16px">Lead #${lead.id} capturado na landing page.</p>
      <table style="border-collapse:collapse;font-size:15px">
        ${row("Nome", lead.name)}
        ${row("E-mail", lead.email)}
        ${row("Empresa", lead.company)}
        ${row("Telefone", lead.phone)}
        ${row("Nº de admins", lead.num_admins)}
        ${row("Campanha", lead.utm_campaign)}
        ${row("Origem", lead.utm_source)}
        ${row("GCLID", lead.gclid)}
        ${row("Página", lead.page_url)}
      </table>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `Novo lead ITSM: ${lead.name || lead.email}${lead.company ? " — " + lead.company : ""}`,
      html,
    });
    if (error) return { ok: false, detail: JSON.stringify(error).slice(0, 300) };
    return { ok: true, detail: "enviado" };
  } catch (err) {
    return { ok: false, detail: (err as Error).message };
  }
}
