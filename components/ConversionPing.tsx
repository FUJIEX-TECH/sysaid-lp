"use client";

import { useEffect } from "react";
import { measureLeadCreated } from "@/lib/oaiq";

// Dispara a conversao do Google Ads uma unica vez, apenas quando o usuario
// chega na /obrigado vindo de um envio real (flag na sessionStorage).
export default function ConversionPing() {
  useEffect(() => {
    if (sessionStorage.getItem("sysaid_lead") !== "1") return;
    sessionStorage.removeItem("sysaid_lead");
    const leadId = sessionStorage.getItem("sysaid_lead_id");
    sessionStorage.removeItem("sysaid_lead_id");

    // ChatGPT Ads: lead_created (no-op sem NEXT_PUBLIC_OAIQ_PIXEL_ID)
    measureLeadCreated(leadId);

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
          w.gtag("event", "conversion", { send_to: `${id}/${label}` });
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
