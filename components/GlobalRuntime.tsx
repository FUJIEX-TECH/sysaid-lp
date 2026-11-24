"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Analytics from "@/components/Analytics";
import ChatWidget from "@/components/ChatWidget";
import { rememberUtm } from "@/lib/utm";

// Montado no layout raiz: garante Hotjar + GA4 + gtag do Google Ads em TODA
// pagina do dominio (nenhuma LP nova pode nascer sem rastreamento), e o
// widget de chat em todas as paginas publicas. O /admin fica fora dos dois
// (nao gravar sessao de admin no Hotjar, nao poluir o GA4).
export default function GlobalRuntime() {
  const pathname = usePathname() || "/";
  // guarda a UTM/gclid do pouso pra não perder a origem se o lead navegar
  useEffect(() => {
    rememberUtm();
  }, [pathname]);
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Analytics />
      {!pathname.startsWith("/obrigado") && !pathname.startsWith("/diagnostico") && <ChatWidget />}
    </>
  );
}
