"use client";

import dynamic from "next/dynamic";
import "./qualifica.css";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";

// Qualifica v2 = tela cheia genérica (lib/conversa-core/ui/ConversaTela) +
// configuração da SysAid + gravação da LP. Só no navegador: a origem vem da
// URL e do sessionStorage. Enquanto carrega, o esqueleto abaixo, já no modo
// (claro/escuro) e com o logo da configuração, pra não piscar.

const { marca, modo } = configSysaid;

const Tela = dynamic(() => import("./QualificaTelaInner"), {
  ssr: false,
  loading: () => (
    <div className="qualifica-carregando" data-modo={modo ?? "claro"} aria-busy="true">
      <span className="qualifica-carregando__marca">
        {marca.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={marca.logo.src} alt={marca.logo.alt} style={{ height: marca.logo.altura ?? 22 }} />
        )}
        <span className="qualifica-carregando__quem">{marca.titulo}</span>
      </span>
      <span className="qualifica-carregando__linha" />
      <span className="qualifica-carregando__linha qualifica-carregando__linha--curta" />
    </div>
  ),
});

export default function QualificaTela() {
  return <Tela />;
}
