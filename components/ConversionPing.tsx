"use client";

import { useEffect } from "react";

// Dispara a conversao do Google Ads uma unica vez, apenas quando o usuario
// chega na /obrigado vindo de um envio real (flag na sessionStorage).
export default function ConversionPing() {
  useEffect(() => {
    if (sessionStorage.getItem("sysaid_lead") !== "1") return;
    sessionStorage.removeItem("sysaid_lead");

    const id = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID;
    const label = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL;
    if (!id || !label) return;

    let tries = 0;
    const send = () => {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      if (typeof w.gtag === "function") {
        w.gtag("event", "conversion", { send_to: `${id}/${label}` });
      } else if (tries++ < 40) {
        setTimeout(send, 100); // aguarda o gtag.js carregar (ate ~4s)
      }
    };
    send();
  }, []);

  return null;
}
