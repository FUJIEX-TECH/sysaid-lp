"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { formatarNumero, type CartaoPronto, type VistaAntesDepois, type VistaBarras, type VistaLinhaTempo, type VistaMedidor, type VistaNumero } from "../../cartoes";

// ==========================================================================
// conversa-core — 12/11/2026: o cartão visual da conversa. Recebe a "vista"
// já validada e formatada (cartoes.ts) e só desenha, em HTML + CSS (nada de
// imagem nem biblioteca de gráfico): número grande com régua e faixa, barras
// comparativas, antes/depois em dois fluxos, linha do tempo e medidor de nível
// em degraus. Entrada sóbria: o cartão sobe e o gráfico se desenha (conta,
// barra que cresce, degrau que sobe); `prefers-reduced-motion` e `estatico`
// (mapa liberado e PDF) mostram direto o estado final. Cabe em 390 px: as
// formas mudam por container query, não pela janela.
// ==========================================================================

type Props = { cartao: CartaoPronto; estatico?: boolean };
type Var = CSSProperties & Record<`--${string}`, string | number>;

function reduzido(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// conta de 0 até o valor (easeOutCubic); sem animação, já começa no fim
function useContagem(alvo: number, animar: boolean, ms = 1000): number {
  const [v, setV] = useState(() => (animar && !reduzido() ? 0 : alvo));
  useEffect(() => {
    if (!animar || reduzido()) {
      setV(alvo);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const passo = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo, animar, ms]);
  return v;
}

function Numero({ v, idioma, animar }: { v: VistaNumero; idioma: string; animar: boolean }) {
  const atual = useContagem(v.valor, animar);
  const mostrado = atual === v.valor ? v.texto : formatarNumero(atual, v.formato, idioma);
  return (
    <div className="cvc-n">
      <p className="cvc-n__valor">
        <strong aria-hidden="true">{mostrado}</strong>
        {v.unidade && (
          <span className="cvc-n__unidade" aria-hidden="true">
            {v.unidade}
          </span>
        )}
        <span className="cvt__sr">{`${v.texto}${v.unidade ? ` ${v.unidade}` : ""}`}</span>
      </p>
      <div className="cvc-n__regua" aria-hidden="true">
        {v.faixa && <span className="cvc-n__faixa" style={{ left: `${v.faixa.inicio}%`, width: `${Math.max(1.5, v.faixa.fim - v.faixa.inicio)}%` }} />}
        <span className="cvc-n__marca" style={{ left: `${v.marca}%` }} />
      </div>
      {v.faixa && (
        <p className="cvc-n__faixa-texto">
          <span>{v.faixa.textoMin}</span>
          <i aria-hidden="true" />
          <span>{v.faixa.textoMax}</span>
          {v.unidade && <span className="cvc-n__faixa-unidade">{v.unidade}</span>}
        </p>
      )}
      {v.conta && <p className="cvc-n__conta">{v.conta}</p>}
    </div>
  );
}

function Barras({ v }: { v: VistaBarras }) {
  return (
    <div className="cvc-b">
      <ul className="cvc-b__lista">
        {v.itens.map((it, i) => (
          <li key={`${i}-${it.rotulo}`} className={`cvc-b__item${it.destaque ? " cvc-b__item--destaque" : ""}`} style={{ "--i": i } as Var}>
            <span className="cvc-b__rotulo">{it.rotulo}</span>
            <span className="cvc-b__valor">{it.texto}</span>
            <span className="cvc-b__trilho" aria-hidden="true">
              <i style={{ width: `${Math.max(it.valor > 0 ? 1 : 0, it.pct)}%` }} />
            </span>
            {it.nota && <span className="cvc-b__nota">{it.nota}</span>}
          </li>
        ))}
      </ul>
      {v.diferenca && (
        <p className={`cvc-b__dif${v.diferenca.pct < 0 ? " cvc-b__dif--menos" : ""}`} style={{ "--i": v.itens.length } as Var}>
          {v.diferenca.texto}
        </p>
      )}
    </div>
  );
}

function SetaLado() {
  return (
    <svg className="cvc-ad__seta" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AntesDepois({ v }: { v: VistaAntesDepois }) {
  const lados = [
    { id: "antes", ...v.antes, base: 0 },
    { id: "depois", ...v.depois, base: v.antes.passos.length + 1 },
  ];
  return (
    <div className="cvc-ad">
      {lados.map((l, li) => (
        <div key={l.id} className={`cvc-ad__col cvc-ad__col--${l.id}`}>
          {li === 1 && <SetaLado />}
          {l.titulo && (
            <span className="cvc-ad__titulo" style={{ "--i": l.base } as Var}>
              {l.titulo}
            </span>
          )}
          <ol className="cvc-ad__passos">
            {l.passos.map((p, i) => (
              <li key={`${i}-${p.texto}`} className={`cvc-ad__passo${p.marca ? " cvc-ad__passo--marca" : ""}`} style={{ "--i": l.base + i + 1 } as Var}>
                {p.texto}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function LinhaTempo({ v }: { v: VistaLinhaTempo }) {
  return (
    <ol className="cvc-lt" style={{ "--n": v.etapas.length } as Var}>
      {v.etapas.map((e, i) => (
        <li key={`${i}-${e.titulo}`} className={`cvc-lt__etapa${v.atual === i + 1 ? " cvc-lt__etapa--atual" : ""}`} style={{ "--i": i } as Var}>
          <span className="cvc-lt__ponto" aria-hidden="true" />
          {e.quando && <span className="cvc-lt__quando">{e.quando}</span>}
          <strong className="cvc-lt__titulo">{e.titulo}</strong>
          {e.texto && <span className="cvc-lt__texto">{e.texto}</span>}
        </li>
      ))}
    </ol>
  );
}

function Medidor({ v }: { v: VistaMedidor }) {
  return (
    <div className="cvc-m" style={{ "--n": v.niveis.length } as Var}>
      <ol className="cvc-m__degraus">
        {v.niveis.map((nv, i) => {
          const k = i + 1;
          const estado = k < v.atual ? "abaixo" : k === v.atual ? "atual" : v.alvo && k <= v.alvo ? "rumo" : "acima";
          return (
            <li
              key={`${k}-${nv.rotulo}`}
              className={`cvc-m__degrau cvc-m__degrau--${estado}${v.alvo === k ? " cvc-m__degrau--alvo" : ""}`}
              style={{ "--i": i, "--h": `${nv.altura}%` } as Var}
              aria-current={k === v.atual ? "step" : undefined}
            >
              <span className="cvc-m__num">{k}</span>
              <span className="cvc-m__rotulo">{nv.rotulo}</span>
              <span className="cvc-m__trilho" aria-hidden="true">
                <span className="cvc-m__bloco" />
              </span>
              {k === v.atual && v.rotuloAtual && <span className="cvc-m__tag">{v.rotuloAtual}</span>}
              {k === v.alvo && v.rotuloAlvo && <span className="cvc-m__tag cvc-m__tag--alvo">{v.rotuloAlvo}</span>}
            </li>
          );
        })}
      </ol>
      {v.niveis[v.atual - 1].texto && <p className="cvc-m__texto">{v.niveis[v.atual - 1].texto}</p>}
    </div>
  );
}

export default function Cartao({ cartao, estatico }: Props) {
  let corpo: React.ReactNode = null;
  if (cartao.tipo === "numero") corpo = <Numero v={cartao.vista} idioma={cartao.idioma} animar={!estatico} />;
  else if (cartao.tipo === "barras") corpo = <Barras v={cartao.vista} />;
  else if (cartao.tipo === "antesDepois") corpo = <AntesDepois v={cartao.vista} />;
  else if (cartao.tipo === "linhaTempo") corpo = <LinhaTempo v={cartao.vista} />;
  else if (cartao.tipo === "medidor") corpo = <Medidor v={cartao.vista} />;
  return (
    <figure className={`cvg cvc cvc--${cartao.tipo}${estatico ? " cvc--estatico" : ""}`} data-cartao={cartao.id} aria-label={cartao.titulo ?? cartao.rotulo}>
      {(cartao.rotulo || cartao.titulo) && (
        <figcaption className="cvc__cabeca">
          {cartao.rotulo && <span className="cvc__rotulo">{cartao.rotulo}</span>}
          {cartao.titulo && <span className="cvc__titulo">{cartao.titulo}</span>}
        </figcaption>
      )}
      <div className="cvc__corpo">{corpo}</div>
      {cartao.legenda && <p className="cvc__legenda">{cartao.legenda}</p>}
    </figure>
  );
}
