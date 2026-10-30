"use client";

import { useEffect, useState } from "react";
import "./qualifica.css";

// Variante B do hero (Qualifica v2): no lugar do formulário, o convite pra
// conversa em página própria (/diagnostico). Leva a query da LP junto (UTMs,
// gclid) e a página de origem em ?de=<slug>, pro chat saber de onde veio
// mesmo sem o sessionStorage.

export default function ChatConvite() {
  const [href, setHref] = useState("/diagnostico");

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      p.delete("v");
      const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
      if (slug) p.set("de", slug);
      const q = p.toString();
      setHref(q ? `/diagnostico?${q}` : "/diagnostico");
    } catch {
      // fica o link simples
    }
  }, []);

  return (
    <div className="convite">
      <p className="convite__titulo">Diagnóstico ITSM em 2 minutos</p>
      <p className="convite__texto">Sete perguntas rápidas, quase tudo por botão. No fim você recebe o mapa do seu problema e o caminho na SysAid.</p>
      <div className="convite__acoes">
        <a className="btn btn--lime" href={href}>
          Começar a conversa
        </a>
        <span className="convite__nota">Só e-mail corporativo. Sem spam.</span>
      </div>
    </div>
  );
}
