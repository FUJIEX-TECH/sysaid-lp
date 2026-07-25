import Script from "next/script";

// Carrega Hotjar, gtag.js (Google Ads + GA4). A conversao do Google Ads e
// disparada no envio do formulario (LeadForm). GA4 so ativa quando o
// NEXT_PUBLIC_GA4_ID for definido.
export default function Analytics() {
  const gadsId = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const gtagId = gadsId || ga4Id;

  return (
    <>
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
