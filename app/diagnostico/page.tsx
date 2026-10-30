import type { Metadata } from "next";
import QualificaTela from "@/components/diagnostico/QualificaTela";

// Qualifica v2 (30/10/2026): o chat é a página. Lê a origem da própria URL
// (UTMs, gclid, referrer, ?de=<comparativa>) ou da 1ª página lembrada na
// sessão. Sem índice enquanto é teste (variante B do formulário da LP).

export const metadata: Metadata = {
  title: "Diagnóstico ITSM em 2 minutos | SysAid Brasil",
  description: "Responda 7 perguntas rápidas e receba o mapa do seu problema de atendimento de TI, com o caminho na SysAid.",
  robots: { index: false, follow: false },
};

export default function DiagnosticoPage() {
  return <QualificaTela />;
}
