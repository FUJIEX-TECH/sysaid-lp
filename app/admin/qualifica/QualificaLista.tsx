"use client";

import { useMemo, useState } from "react";
import type { ConversaComLead } from "@/lib/qualifica-db";
import { dataBR, horariosTexto, PAPEL_ROTULO, PEDIDO_ROTULO, FLUXO_ROTULO } from "./formato";

type Derivados = { dor_principal_nome?: string | null; conta?: { medido?: boolean; diasTexto?: string } | null };

export default function QualificaLista({ conversas, erro }: { conversas: ConversaComLead[]; erro: string | null }) {
  const [pedido, setPedido] = useState("");
  const [papel, setPapel] = useState("");
  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const lista = useMemo(
    () =>
      conversas.filter((c) => {
        if (pedido && (pedido === "nenhum" ? c.pedido : c.pedido !== pedido)) return false;
        if (papel && c.papel !== papel) return false;
        if (estado === "completo" && !c.completo) return false;
        if (estado === "parcial" && c.completo) return false;
        if (q) {
          const alvo = [c.name, c.email, c.company, c.phone].join(" ").toLowerCase();
          if (!alvo.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [conversas, pedido, papel, estado, q]
  );
  const conta = (p: string) => conversas.filter((c) => c.pedido === p).length;

  return (
    <div className="admin">
      <a className="admin__voltar" href="/admin">← Todos os leads</a>
      <header className="admin__top">
        <div>
          <h1>Leads do Qualifica</h1>
          <p className="admin__sub">
            {conversas.length} conversas · {conversas.filter((c) => c.completo).length} completas · {conta("reuniao")} pediram reunião · {conta("orcamento")} pediram orçamento ·{" "}
            {conta("whatsapp")} preferem WhatsApp
          </p>
        </div>
      </header>
      {erro && <div className="admin__error">Erro ao ler o banco: {erro}</div>}
      <div className="admin__controls">
        <input placeholder="Buscar por nome, e-mail, empresa, telefone..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={pedido} onChange={(e) => setPedido(e.target.value)} aria-label="Próximo passo pedido">
          <option value="">Qualquer próximo passo</option>
          <option value="reuniao">Pediu reunião</option>
          <option value="orcamento">Pediu orçamento</option>
          <option value="whatsapp">Prefere WhatsApp</option>
          <option value="nenhum">Ainda sem próximo passo</option>
        </select>
        <select value={papel} onChange={(e) => setPapel(e.target.value)} aria-label="Papel na decisão">
          <option value="">Qualquer papel</option>
          {Object.entries(PAPEL_ROTULO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Completas ou parciais">
          <option value="">Completas e parciais</option>
          <option value="completo">Só completas</option>
          <option value="parcial">Só parciais</option>
        </select>
        <span className="admin__count">{lista.length} exibidas</span>
      </div>
      <div className="admin__tablewrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Quando (Brasília)</th>
              <th>Próximo passo</th>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Papel</th>
              <th>O que pesa</th>
              <th>A conta</th>
              <th>Fluxo</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={8} className="admin__empty">
                  Nenhuma conversa com esses filtros.
                </td>
              </tr>
            )}
            {lista.map((c) => {
              const d = (c.dados?.derivados ?? {}) as Derivados;
              const ir = () => (window.location.href = `/admin/qualifica/${c.id}`);
              return (
                <tr key={c.id} className="admin__linha-link" onClick={ir} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && ir()}>
                  <td className="nowrap">{dataBR(c.created_at)}</td>
                  <td>
                    {c.pedido ? <span className={`pill pill--${c.pedido}`}>{PEDIDO_ROTULO[c.pedido] ?? c.pedido}</span> : <span className="pill pill--parcial">{c.completo ? "—" : "parou no meio"}</span>}
                    {c.horarios && <div className="qd__meta">{horariosTexto(c.horarios)}</div>}
                  </td>
                  <td>
                    <a className="admin__link" href={`/admin/qualifica/${c.id}`} onClick={(e) => e.stopPropagation()}>
                      {c.name || c.email || "(sem nome)"}
                    </a>
                  </td>
                  <td>{c.company}</td>
                  <td>{c.papel ? PAPEL_ROTULO[c.papel] ?? c.papel : ""}</td>
                  <td>{d.dor_principal_nome ?? ""}</td>
                  <td className="nowrap">{d.conta?.medido ? `${d.conta.diasTexto} dias/ano` : d.conta ? "não mede" : ""}</td>
                  <td>{FLUXO_ROTULO[c.fluxo ?? ""] ?? c.fluxo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
