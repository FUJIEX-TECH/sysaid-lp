import { neon } from "@neondatabase/serverless";

// Cliente HTTP do Neon, ideal para funcoes serverless da Vercel (sem pool
// persistente). A env DATABASE_URL vem da integracao Vercel <> Neon.
// Lazy: so falha se for realmente usado sem a env configurada.
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL nao configurada. Rode `vercel env pull` apos conectar o Neon."
    );
  }
  return neon(url);
}

export type Lead = {
  id: number;
  created_at: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  num_admins: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip: string | null;
  rdstation_status: string;
  rdstation_response: string | null;
  gads_conversion_fired: boolean;
  status: string;
  notes: string | null;
};

export type NewLead = Pick<
  Lead,
  | "email" | "name" | "company" | "phone" | "num_admins"
  | "utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term"
  | "gclid" | "page_url" | "referrer" | "user_agent" | "ip"
>;

export async function insertLead(lead: NewLead): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO leads (
      email, name, company, phone, num_admins,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      gclid, page_url, referrer, user_agent, ip
    ) VALUES (
      ${lead.email}, ${lead.name}, ${lead.company}, ${lead.phone}, ${lead.num_admins},
      ${lead.utm_source}, ${lead.utm_medium}, ${lead.utm_campaign}, ${lead.utm_content}, ${lead.utm_term},
      ${lead.gclid}, ${lead.page_url}, ${lead.referrer}, ${lead.user_agent}, ${lead.ip}
    )
    RETURNING id
  `;
  return (rows[0] as { id: number }).id;
}

export async function markRdStation(
  id: number,
  status: "sent" | "failed",
  response: string
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE leads
    SET rdstation_status = ${status}, rdstation_response = ${response}
    WHERE id = ${id}
  `;
}

export async function listLeads(limit = 200): Promise<Lead[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM leads ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as Lead[];
}
