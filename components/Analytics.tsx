import Script from "next/script";
import { OAIQ_PIXEL_ID } from "@/lib/oaiq";

// Carrega Hotjar, gtag.js (Google Ads + GA4) e o pixel do ChatGPT Ads. A
// conversao do Google Ads e disparada no envio do formulario (LeadForm). GA4
// so ativa quando o NEXT_PUBLIC_GA4_ID for definido; o pixel do ChatGPT Ads,
// so quando o NEXT_PUBLIC_OAIQ_PIXEL_ID for definido (lib/oaiq.ts).
export default function Analytics() {
  const gadsId = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const gtagId = gadsId || ga4Id;

  return (
    <>
      {OAIQ_PIXEL_ID && (
        // Snippet oficial (developers.openai.com/ads/measurement-pixel). Em
        // toda pagina publica: e na pagina de entrada que o pixel le o
        // `oppref` da URL e guarda no cookie `__oppref`.
        <Script id="oaiq-init" strategy="afterInteractive">
          {`
            (function (w, d, s, u) {
              if (w.oaiq) return;
              var q = function () { q.q.push(arguments); };
              q.q = [];
              w.oaiq = q;
              var js = d.createElement(s);
              js.async = true;
              js.src = u;
              var f = d.getElementsByTagName(s)[0];
              f.parentNode.insertBefore(js, f);
            })(window, document, "script", "https://bzrcdn.openai.com/sdk/oaiq.min.js");
            oaiq("init", { pixelId: ${JSON.stringify(OAIQ_PIXEL_ID)} });
          `}
        </Script>
      )}

      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${gadsId ? `gtag('config', '${gadsId}');` : ""}
              ${ga4Id ? `gtag('config', '${ga4Id}');` : ""}
            `}
          </Script>
        </>
      )}

      {hotjarId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  );
}
