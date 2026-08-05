"use client";

import { useMemo, useState } from "react";
import type { Lead } from "@/lib/db";

// extrai o caminho da pagina de origem a partir da URL completa gravada no lead
function pagePath(url: string | null): string {
  if (!url) return "";
  try {
    const p = new URL(url).pathname.replace(/\/$/, "");
    return p === "" ? "/" : p;
  } catch {
    return "";
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

const CSV_COLS: (keyof Lead)[] = [
  "created_at", "completion", "name", "email", "company", "phone", "num_admins",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "rdstation_status", "status", "page_url",
];

function toCsv(rows: Lead[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = CSV_COLS.join(",");
  const body = rows.map((r) => CSV_COLS.map((c) => esc(r[c])).join(",")).join("\n");
  return header + "\n" + body;
}

export default function LeadsTable({
  leads,
  dbError,
}: {
  leads: Lead[];
  dbError: string | null;
}) {
  const [q, setQ] = useState("");
  const [campaign, setCampaign] = useState("");
  const [page, setPage] = useState("");
  const [completion, setCompletion] = useState<"" | "complete" | "partial">("");
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyGclid(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }

  const campaigns = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.utm_campaign && set.add(l.utm_campaign));
    return Array.from(set).sort();
  }, [leads]);

  const pages = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      const p = pagePath(l.page_url);
      if (p) set.add(p);
    });
    return Array.from(set).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (campaign && l.utm_campaign !== campaign) return false;
      if (page && pagePath(l.page_url) !== page) return false;
      if (completion && l.completion !== completion) return false;
      if (!term) return true;
      return [l.name, l.email, l.company, l.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [leads, q, campaign, page, completion]);

  const completeCount = useMemo(
    () => leads.filter((l) => l.completion === "complete").length,
    [leads]
  );
  const partialCount = leads.length - completeCount;

  const thisMonth = useMemo(() => {
    const now = new Date();
    return leads.filter((l) => {
      const d = new Date(l.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [leads]);

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-sysaid-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <h1>Leads · LP ITSM</h1>
          <p className="admin__sub">
            {completeCount} completos · {partialCount} parciais · {thisMonth} neste mês
          </p>
        </div>
        <button className="admin__logout" onClick={logout}>Sair</button>
      </header>

      {dbError && (
        <div className="admin__error">Erro ao ler o banco: {dbError}</div>
      )}

      <div className="admin__controls">
        <input
          placeholder="Buscar por nome, e-mail, empresa, telefone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
          <option value="">Todas as campanhas</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={page} onChange={(e) => setPage(e.target.value)}>
          <option value="">Todas as páginas</option>
          {pages.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={completion} onChange={(e) => setCompletion(e.target.value as "" | "complete" | "partial")}>
          <option value="">Completos e parciais</option>
          <option value="complete">Só completos</option>
          <option value="partial">Só parciais</option>
        </select>
        <span className="admin__count">{filtered.length} exibidos</span>
        <button className="admin__export" onClick={exportCsv}>Exportar CSV</button>
      </div>

      <div className="admin__tablewrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Empresa</th>
              <th>Telefone</th>
              <th>Admins</th>
              <th>Campanha</th>
              <th>Página</th>
              <th>Origem</th>
              <th>GCLID</th>
              <th>RD</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} className="admin__empty">Nenhum lead ainda.</td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id}>
                <td className="nowrap">{fmtDate(l.created_at)}</td>
                <td>
                  <span className={`pill pill--${l.completion === "complete" ? "sent" : "pending"}`}>
                    {l.completion === "complete" ? "Completo" : "Parcial"}
                  </span>
                </td>
                <td>{l.name || "—"}</td>
                <td>{l.email}</td>
                <td>{l.company || "—"}</td>
                <td className="nowrap">{l.phone || "—"}</td>
                <td>{l.num_admins || "—"}</td>
                <td>{l.utm_campaign || "—"}</td>
                <td className="nowrap">{pagePath(l.page_url) || "—"}</td>
                <td>{l.utm_source || "—"}</td>
                <td className="gclid">
                  {l.gclid ? (
                    <button
                      className="gclid-btn"
                      onClick={() => { setModalLead(l); setCopied(false); }}
                      title="Ver e copiar GCLID"
                    >
                      ✓
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <span className={`pill pill--${l.rdstation_status}`}>
                    {l.rdstation_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalLead && (
        <div className="modal" onClick={() => setModalLead(null)}>
          <div className="modal__box" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setModalLead(null)} aria-label="Fechar">
              ×
            </button>
            <h2>Atribuição do lead</h2>
            <p className="modal__who">
              {modalLead.name || modalLead.email}
              {modalLead.company ? ` · ${modalLead.company}` : ""}
            </p>

            <label className="modal__label">GCLID</label>
            <div className="modal__code">
              <code>{modalLead.gclid}</code>
              <button onClick={() => copyGclid(modalLead.gclid || "")}>
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="modal__grid">
              <div><span>Campanha</span>{modalLead.utm_campaign || "—"}</div>
              <div><span>Origem</span>{modalLead.utm_source || "—"}</div>
              <div><span>Mídia</span>{modalLead.utm_medium || "—"}</div>
              <div><span>Conteúdo</span>{modalLead.utm_content || "—"}</div>
              <div><span>Termo</span>{modalLead.utm_term || "—"}</div>
              <div><span>Página</span>{modalLead.page_url || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
