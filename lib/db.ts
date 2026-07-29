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
  completion: string;
};

export type NewLead = Pick<
  Lead,
  | "email" | "name" | "company" | "phone" | "num_admins"
  | "utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term"
  | "gclid" | "page_url" | "referrer" | "user_agent" | "ip"
>;

// Etapas do preenchimento progressivo. Cada etapa manda so os campos que
// coletou ate ali; undefined/null = "nao mandar essa etapa ainda", nunca "apagar".
export type PartialLeadFields = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  page_url?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip?: string | null;
};

export async function insertLead(lead: NewLead): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO leads (
      email, name, company, phone, num_admins,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      gclid, page_url, referrer, user_agent, ip, completion
    ) VALUES (
      ${lead.email}, ${lead.name}, ${lead.company}, ${lead.phone}, ${lead.num_admins},
      ${lead.utm_source}, ${lead.utm_medium}, ${lead.utm_campaign}, ${lead.utm_content}, ${lead.utm_term},
      ${lead.gclid}, ${lead.page_url}, ${lead.referrer}, ${lead.user_agent}, ${lead.ip}, 'complete'
    )
    RETURNING id
  `;
  return (rows[0] as { id: number }).id;
}

// Cria a linha parcial (etapa 1: so o e-mail, normalmente). Nunca dispara
// RD Station nem notificacao - so grava, pra nao perder o lead se ele sumir.
export async function insertPartialLead(fields: PartialLeadFields): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO leads (
      email, name, phone, company,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      gclid, page_url, referrer, user_agent, ip, completion
    ) VALUES (
      ${fields.email ?? null}, ${fields.name ?? null}, ${fields.phone ?? null}, ${fields.company ?? null},
      ${fields.utm_source ?? null}, ${fields.utm_medium ?? null}, ${fields.utm_campaign ?? null},
      ${fields.utm_content ?? null}, ${fields.utm_term ?? null},
      ${fields.gclid ?? null}, ${fields.page_url ?? null}, ${fields.referrer ?? null},
      ${fields.user_agent ?? null}, ${fields.ip ?? null}, 'partial'
    )
    RETURNING id
  `;
  return (rows[0] as { id: number }).id;
}

// Atualiza uma linha ainda parcial (etapa 2: nome + telefone). So mexe em
// linhas com completion='partial' - nunca sobrescreve um lead ja finalizado.
export async function updatePartialLead(id: number, fields: PartialLeadFields): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE leads SET
      email   = COALESCE(${fields.email ?? null}, email),
      name    = COALESCE(${fields.name ?? null}, name),
      phone   = COALESCE(${fields.phone ?? null}, phone),
      company = COALESCE(${fields.company ?? null}, company)
    WHERE id = ${id} AND completion = 'partial'
    RETURNING id
  `;
  return rows.length > 0;
}

// Finaliza o lead: se "id" existe (veio das etapas parciais), faz UPDATE
// completando os campos e virando completion='complete'. Sem id, insere
// direto como completo (fallback: submit sem ter passado pelas etapas).
export async function finalizeLead(id: number | null, lead: NewLead): Promise<number> {
  const sql = getSql();
  if (id !== null) {
    const rows = await sql`
      UPDATE leads SET
        email = ${lead.email}, name = ${lead.name}, phone = ${lead.phone},
        company = ${lead.company}, num_admins = ${lead.num_admins},
        utm_source = ${lead.utm_source}, utm_medium = ${lead.utm_medium},
        utm_campaign = ${lead.utm_campaign}, utm_content = ${lead.utm_content}, utm_term = ${lead.utm_term},
        gclid = ${lead.gclid}, page_url = ${lead.page_url}, referrer = ${lead.referrer},
        user_agent = ${lead.user_agent}, ip = ${lead.ip}, completion = 'complete'
      WHERE id = ${id}
      RETURNING id
    `;
    if (rows.length > 0) return (rows[0] as { id: number }).id;
    // id nao encontrado (ex: veio de outra sessao/ambiente) - cai pro insert abaixo
  }
  return insertLead(lead);
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
