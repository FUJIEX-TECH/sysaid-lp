import type { Metadata, Viewport } from "next";
import { Figtree, Besley } from "next/font/google";
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
      <body>{children}</body>
    </html>
  );
}
