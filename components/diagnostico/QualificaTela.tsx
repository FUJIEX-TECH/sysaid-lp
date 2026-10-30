"use client";

import dynamic from "next/dynamic";
import "./qualifica.css";

// Qualifica v2 = tela cheia genérica (lib/conversa-core/ui/ConversaTela) +
// configuração da SysAid + gravação da LP. Só no navegador: a origem vem da
// URL e do sessionStorage. Enquanto carrega, o esqueleto abaixo.

const Tela = dynamic(() => import("./QualificaTelaInner"), {
  ssr: false,
  loading: () => (
    <div className="qualifica-carregando" aria-busy="true">
      <span className="qualifica-carregando__quem">SysAid · Diagnóstico ITSM</span>
      <span className="qualifica-carregando__linha" />
      <span className="qualifica-carregando__linha qualifica-carregando__linha--curta" />
    </div>
  ),
});

export default function QualificaTela() {
  return <Tela />;
}
