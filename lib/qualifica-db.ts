import { getSql } from "@/lib/db";

// Qualifica v2 (13/11/2026): a conversa inteira de cada lead do Qualifica, na
// tabela qualifica_conversas (migração só aditiva: lib/migrations/2026-11-13-qualifica-conversas.sql).
// Server-only. A tabela `leads` não muda: aqui só se lê dela (pra conferir o dono).

export type ConversaRow = {
  id: number;
  sessao: string;
  lead_id: number | null;
  created_at: string;
  updated_at: string;
  seq: number;
  fluxo: string | null;
  origem: string | null;
  completo: boolean;
  pedido: string | null;
  papel: string | null;
  horarios: { data: string; hora: string }[] | null;
  horarios_validos: boolean | null;
  conversa: unknown[];
  dados: Record<string, unknown>;
};
export type ConversaComLead = ConversaRow & { name: string | null; email: string | null; company: string | null; phone: string | null; completion: string | null; utm_term: string | null; utm_campaign: string | null };

export type NovaConversa = Omit<ConversaRow, "id" | "created_at" | "updated_at">;

// grava ou atualiza (pela sessão). Entre parciais, a mais nova vence (seq); a gravação
// da conversa completa sempre vence e depois dela nada parcial volta. Devolve o id, ou null.
export async function gravarConversa(c: NovaConversa): Promise<number | null> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO qualifica_conversas (sessao, lead_id, seq, fluxo, origem, completo, pedido, papel, horarios, horarios_validos, conversa, dados)
    VALUES (${c.sessao}, ${c.lead_id}, ${c.seq}, ${c.fluxo}, ${c.origem}, ${c.completo}, ${c.pedido}, ${c.papel},
            ${c.horarios ? JSON.stringify(c.horarios) : null}::jsonb, ${c.horarios_validos}, ${JSON.stringify(c.conversa)}::jsonb, ${JSON.stringify(c.dados)}::jsonb)
    ON CONFLICT (sessao) DO UPDATE SET
      lead_id = COALESCE(EXCLUDED.lead_id, qualifica_conversas.lead_id),
      seq = EXCLUDED.seq, fluxo = EXCLUDED.fluxo, origem = EXCLUDED.origem,
      completo = EXCLUDED.completo, pedido = EXCLUDED.pedido, papel = EXCLUDED.papel,
      horarios = EXCLUDED.horarios, horarios_validos = EXCLUDED.horarios_validos,
      conversa = EXCLUDED.conversa, dados = EXCLUDED.dados, updated_at = now()
    WHERE EXCLUDED.completo OR (qualifica_conversas.seq <= EXCLUDED.seq AND NOT qualifica_conversas.completo)
    RETURNING id
  `;
  return rows.length ? (rows[0] as { id: number }).id : null;
}

// o lead existe, é deste e-mail e foi criado há pouco (ninguém pendura conversa em lead dos outros)
export async function leadConfere(id: number, email: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`SELECT 1 FROM leads WHERE id = ${id} AND lower(email) = ${email.toLowerCase()} AND created_at > now() - interval '24 hours'`;
  return rows.length > 0;
}

export async function listarConversas(limite = 500): Promise<ConversaComLead[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT c.*, l.name, l.email, l.company, l.phone, l.completion, l.utm_term, l.utm_campaign
    FROM qualifica_conversas c LEFT JOIN leads l ON l.id = c.lead_id
    ORDER BY c.created_at DESC LIMIT ${limite}
  `;
  return rows as ConversaComLead[];
}

export async function lerConversa(id: number): Promise<ConversaComLead | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT c.*, l.name, l.email, l.company, l.phone, l.completion, l.utm_term, l.utm_campaign
    FROM qualifica_conversas c LEFT JOIN leads l ON l.id = c.lead_id
    WHERE c.id = ${id}
  `;
  return (rows[0] as ConversaComLead) ?? null;
}
