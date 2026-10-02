import type { Metadata, Viewport } from "next";
import { Figtree, Besley } from "next/font/google";
import GlobalRuntime from "@/components/GlobalRuntime";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const besley = Besley({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-besley",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://itsm.sysaid.com.br"),
  title: "Software ITSM com IA | Service Desk e Gestão de TI — SysAid Brasil",
  description:
    "Plataforma de ITSM com IA que resolve até 90% dos chamados antes de virarem ticket. Service desk, gestão de ativos e automação de TI em uma só solução. +400 empresas no Brasil.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Software ITSM com IA | Service Desk — SysAid Brasil",
    description:
      "ITSM com IA que resolve até 90% dos chamados antes de virarem ticket. +400 empresas no Brasil.",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "3TuqLF_ycA0Hp67nNo0Rze2MEAPLQ44NygzFfz_jXA0",
  },
};

// Entidade "SysAid Brasil" declarada uma única vez, no layout, com @id estável.
// Os schemas de página (Article/FAQPage) podem referenciar { "@id": ORG_ID } no publisher
// em vez de repetir o objeto, o que evita entidade duplicada no grafo.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://itsm.sysaid.com.br/#organization",
  name: "SysAid Brasil",
  alternateName: ["SysAid", "SysAid Technologies"],
  url: "https://itsm.sysaid.com.br",
  logo: {
    "@type": "ImageObject",
    url: "https://itsm.sysaid.com.br/logos/logo.png",
    caption: "SysAid Brasil",
  },
  description:
    "Plataforma de ITSM (gestão de serviços de TI) com inteligência artificial nativa, distribuída no Brasil pela SysAid Brasil. Centraliza chamados, gestão de ativos, SLA, base de conhecimento e portal de autoatendimento, com o SysAid Copilot resolvendo até 90% dos chamados antes de virarem ticket.",
  areaServed: {
    "@type": "Country",
    name: "Brasil",
  },
  knowsLanguage: ["pt-BR", "en"],
  sameAs: [
    "https://www.sysaid.com",
    "https://www.sysaid.com.br",
    "https://www.linkedin.com/company/sysaid-technologies/",
    "https://www.g2.com/products/sysaid/reviews",
  ],
};

export const viewport: Viewport = {
  themeColor: "#175d4a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${besley.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        {children}
        <GlobalRuntime />
      </body>
    </html>
  );
}
