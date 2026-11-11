import type { Metadata, Viewport } from "next";
import QualificaTela from "@/components/diagnostico/QualificaTela";
import { COR_NAVEGADOR_SYSAID } from "@/lib/diagnostico/config-sysaid";

// Qualifica v2 (30/10/2026): o chat é a página. Lê a origem da própria URL
// (UTMs, gclid, referrer, ?de=<comparativa>) ou da 1ª página lembrada na
// sessão. Sem índice enquanto é teste (variante B do formulário da LP).

// cara de conversa, não de formulário (Fernando, 11/11/2026): nada de "diagnóstico",
// "perguntas" ou "etapas" no que aparece na tela; a copy final é do sysaid-growth
export const metadata: Metadata = {
  title: "Converse com a SysAid | SysAid Brasil",
  description: "Conte o que trava o atendimento de TI hoje e a SysAid te mostra o caminho: uma conversa rápida, quase tudo por botão, com o mapa do seu caso no fim.",
  robots: { index: false, follow: false },
};

// a barra do navegador acompanha o modo do chat (escuro desde 11/11/2026)
export const viewport: Viewport = {
  themeColor: COR_NAVEGADOR_SYSAID,
  width: "device-width",
  initialScale: 1,
};

export default function DiagnosticoPage() {
  return <QualificaTela />;
}
