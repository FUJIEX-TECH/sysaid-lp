// Pixel de medição do ChatGPT Ads (OpenAI Ads, "oaiq").
// Doc oficial: https://developers.openai.com/ads/measurement-pixel
//
// O snippet + init vivem no components/Analytics.tsx e só carregam quando
// NEXT_PUBLIC_OAIQ_PIXEL_ID existe na Vercel. Sem a variável, tudo aqui vira
// no-op: dá pra fazer merge deste código sem mudar nada no ar.
//
// O pixel guarda sozinho o `oppref` (identificador do clique no ChatGPT) num
// cookie first-party `__oppref` de 30 dias, então o lead que chega pela
// /movidesk e converte na /obrigado ainda é atribuído ao anúncio.
//
// event_id = "lead_<id do banco>": o mesmo id que um envio futuro pela
// Conversions API (servidor) teria de usar, pra OpenAI deduplicar.

type Oaiq = (...args: unknown[]) => void;

export const OAIQ_PIXEL_ID = process.env.NEXT_PUBLIC_OAIQ_PIXEL_ID || "";

// Dispara lead_created (evento padrão de lead). Só é chamado depois que o
// /api/lead aceitou o lead completo, ou seja, depois da trava de e-mail
// corporativo: mesmo gatilho da conversão do Google Ads e do generate_lead.
export function measureLeadCreated(leadId?: number | string | null) {
  if (!OAIQ_PIXEL_ID || typeof window === "undefined") return;
  const options = leadId ? { event_id: `lead_${leadId}` } : undefined;

  let tries = 0;
  const send = () => {
    const w = window as unknown as { oaiq?: Oaiq };
    if (typeof w.oaiq === "function") {
      if (options) {
        w.oaiq("measure", "lead_created", { type: "customer_action" }, options);
      } else {
        w.oaiq("measure", "lead_created", { type: "customer_action" });
      }
    } else if (tries++ < 40) {
      setTimeout(send, 100); // aguarda o snippet do Analytics.tsx (até ~4 s)
    }
  };
  send();
}
