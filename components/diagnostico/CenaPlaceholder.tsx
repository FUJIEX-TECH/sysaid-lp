"use client";

import type { Respostas } from "@/lib/diagnostico/fluxo";
import { sugerirEmpresa } from "@/lib/diagnostico/fluxo";

// Cena da central de atendimento: placeholder simples (porte e empresa).
// A cena ilustrada de verdade (traço fino ou isométrico, decisões 9 e 10 do
// plano) fica pra fatia 2. Aqui só o comportamento: técnicos aparecem conforme
// o porte, pessoas atendidas viram um contador, a empresa entra no letreiro.

const TECNICOS: Record<string, number> = { "1-2": 2, "3-10": 5, "+10": 8 };
const PESSOAS: Record<string, string> = { "50": "até 50", "200": "51 a 200", "1000": "201 a 1.000", mais: "+1.000" };

export default function CenaPlaceholder({ respostas }: { respostas: Respostas }) {
  const n = respostas.tecnicos ? TECNICOS[respostas.tecnicos] ?? 0 : 0;
  const pessoas = respostas.usuarios ? PESSOAS[respostas.usuarios] : null;
  const empresa = respostas.empresa || (respostas.email ? sugerirEmpresa(respostas.email) : "");

  return (
    <div className="diag__cena" aria-hidden="true">
      <div className="diag__letreiro">
        <span className="diag__letreiro-nome">{empresa || "Sua central de TI"}</span>
        {pessoas && <span className="diag__letreiro-meta">{pessoas} atendidas</span>}
      </div>
      <div className="diag__mesas">
        {Array.from({ length: Math.max(n, 1) }).map((_, i) => (
          <span key={i} className={`diag__tecnico ${n === 0 ? "diag__tecnico--vazio" : ""}`} style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </div>
  );
}
