"use client";

import { useEffect } from "react";

// Dispara a conversao do Google Ads uma unica vez, apenas quando o usuario
// chega na /obrigado vindo de um envio real (flag na sessionStorage).
export default function ConversionPing() {
  useEffect(() => {
    // valor = "lead:<id do banco>" (ou "1" se a API nao devolveu id)
    const marca = sessionStorage.getItem("sysaid_lead");
    if (!marca) return;
    sessionStorage.removeItem("sysaid_lead");
    const m = /^lead:(\d+)$/.exec(marca);
    const txId = m ? `lp-${m[1]}` : undefined;

    const id = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID;
    const label = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL;
    const ga4 = process.env.NEXT_PUBLIC_GA4_ID;
    if (!id && !ga4) return;

    let tries = 0;
    const send = () => {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      if (typeof w.gtag === "function") {
        // Google Ads: conversao "Lead - Formulario LP" (primaria)
        if (id && label) {
          // transaction_id = Order ID: deixa retirar (RETRACTION) pela API uma conversao falsa
          // e evita contar duas vezes o mesmo lead se a pagina recarregar.
          w.gtag("event", "conversion", {
            send_to: `${id}/${label}`,
            ...(txId ? { transaction_id: txId } : {}),
          });
        }
        // GA4: evento recomendado de lead. Antes daqui o GA4 so tinha o
        // form_start automatico (inicio de preenchimento), nunca o lead
        // concluido - por isso reportava 0 conversoes. Marcar generate_lead
        // como key event no GA4 (Admin > Eventos) pra virar conversao.
        if (ga4) {
          w.gtag("event", "generate_lead", { send_to: ga4 });
        }
      } else if (tries++ < 40) {
        setTimeout(send, 100); // aguarda o gtag.js carregar (ate ~4s)
      }
    };
    send();
  }, []);

  return null;
}
