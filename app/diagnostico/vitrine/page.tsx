import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VitrineCartoes from "@/components/diagnostico/VitrineCartoes";

// 12/11/2026 (Severino): vitrine dos 5 tipos de cartão visual do núcleo, no tema
// da SysAid. SÓ EM DESENVOLVIMENTO (em produção é 404): serve pro QA em 390/1440
// e pro sysaid-growth escolher o que entra no roteiro. Fora do sitemap, noindex.
export const metadata: Metadata = {
  title: "Vitrine dos cartões | Qualifica",
  robots: { index: false, follow: false },
};

export default function VitrinePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <VitrineCartoes />;
}
