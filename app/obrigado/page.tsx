import type { Metadata } from "next";
import Image from "next/image";
import Analytics from "@/components/Analytics";
import ConversionPing from "@/components/ConversionPing";

export const metadata: Metadata = {
  title: "Obrigado · SysAid Brasil",
  robots: { index: false, follow: false },
};

export default function Obrigado() {
  return (
    <>
      <Analytics />
      <ConversionPing />

      <header className="site-header">
        <div className="container site-header__inner">
          <Image src="/logos/logo-white.svg" alt="SysAid" width={132} height={34} priority />
        </div>
      </header>

      <main className="ty">
        <div className="container container--narrow text-center">
          <div className="ty__check" aria-hidden="true">✓</div>
          <h1>Recebemos seu contato</h1>
          <p className="ty__lead">
            Um especialista da SysAid vai falar com você em breve para agendar
            a demonstração. Fique de olho no seu e-mail e telefone.
          </p>
          <p className="ty__meta">
            Enquanto isso, conheça mais sobre a plataforma no site oficial.
          </p>
          <a className="btn btn--primary" href="https://sysaid.com.br">
            Voltar ao site da SysAid
          </a>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <Image src="/logos/logo-white.svg" alt="SysAid" width={116} height={30} />
          <p>SysAid Brasil · Software ITSM com Inteligência Artificial</p>
        </div>
      </footer>
    </>
  );
}
