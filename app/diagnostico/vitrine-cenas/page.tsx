import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VitrineCenas from "@/components/diagnostico/VitrineCenas";

// 13/11/2026 (Severino): vitrine das 4 cenas da busca genérica e dos cartões
// novos (conta de horas, maturidade, etapas, montagem), no tema da SysAid. SÓ EM
// DESENVOLVIMENTO (em produção é 404): pros prints que o Fernando analisa e pra
// revisão do sysaid-growth (checklist 3.7 do arquivo de conteúdo). Noindex.
export const metadata: Metadata = {
  title: "Vitrine das cenas | Qualifica",
  robots: { index: false, follow: false },
};

export default function VitrineCenasPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <VitrineCenas />;
}
