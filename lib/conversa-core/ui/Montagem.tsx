"use client";

import { useEffect, useState } from "react";

// ==========================================================================
// conversa-core — 13/11/2026: "montando o seu documento". Entra na conversa
// depois da etapa da montagem (`entrega.montagem.apos`, ex.: o WhatsApp): uma
// barra que anda com o tempo até perto do fim, com a lista do que está sendo
// montado ticando aos poucos, e que fecha (100%, "pronto") quando a entrega
// libera. Só desenha: quem diz "pronto" é a tela.
// ==========================================================================

type Props = {
  rotulo: string;
  pronto: string;
  itens: string[];
  duracaoMs?: number;
  concluido: boolean;
};

function reduzido(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function Montagem({ rotulo, pronto, itens, duracaoMs = 9000, concluido }: Props) {
  const [pct, setPct] = useState(() => (reduzido() ? 90 : 4));
  useEffect(() => {
    if (concluido) {
      setPct(100);
      return;
    }
    if (reduzido()) return;
    const t0 = performance.now();
    let raf = 0;
    const passo = (t: number) => {
      // anda rápido no começo e devagar perto dos 92% (nunca fecha sozinha)
      const p = Math.min(1, (t - t0) / duracaoMs);
      setPct(4 + 88 * (1 - Math.pow(1 - p, 2)));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [concluido, duracaoMs]);

  const n = itens.length;
  const feitos = concluido ? n : Math.min(n, Math.floor((pct / 92) * n));
  const estado = concluido ? pronto : rotulo;
  return (
    <div className={`cvg cvmo${concluido ? " cvmo--pronto" : ""}`} aria-live="polite">
      <div className="cvmo__topo" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={estado}>
        <span className="cvmo__estado">{estado}</span>
        <span className="cvmo__pct" aria-hidden="true">
          {Math.round(pct)}%
        </span>
      </div>
      <span className="cvmo__barra" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </span>
      {n > 0 && (
        <ul className="cvmo__itens">
          {itens.map((it, i) => (
            <li key={it} className={i < feitos ? "cvmo__item cvmo__item--feito" : i === feitos ? "cvmo__item cvmo__item--agora" : "cvmo__item"}>
              <span className="cvmo__marca" aria-hidden="true" />
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
