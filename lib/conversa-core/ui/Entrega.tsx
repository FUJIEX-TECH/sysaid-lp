"use client";

import { forwardRef } from "react";
import Resumo from "./Resumo";
import Mapa from "./graficos/Mapa";
import Cartao from "./graficos/Cartao";
import type { CartaoPronto } from "../cartoes";
import type { Motor } from "../motor";
import type { ConfigConversa, Contexto, Mapa as MapaDados } from "../tipos";

// ==========================================================================
// conversa-core — 12/11/2026: o mapa liberado. Depois da etapa que destrava
// (padrão: o telefone), a conversa abre embaixo uma seção larga com o mapa
// completo, o resumo do caso, os cartões que apareceram na conversa e o botão
// "Baixar em PDF". O PDF é a impressão do navegador: esta mesma seção vira uma
// folha A4 clara pelo CSS de impressão (tela.css, @media print), com o logo e
// as linhas de cabeçalho e rodapé que só existem no papel. Textos, logo do
// papel e tokens da folha vêm de `config.entrega`.
// ==========================================================================

type Props = {
  config: ConfigConversa;
  motor: Motor;
  ctx: Contexto;
  mapa: MapaDados | null;
  cartoes: CartaoPronto[];
  hoje: string;
  onPdf: () => void;
};

function IconeBaixar() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M10 3.5v9M5.8 8.6 10 12.8l4.2-4.2M4 16.2h12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Entrega = forwardRef<HTMLHeadingElement, Props>(function Entrega({ config, motor, ctx, mapa, cartoes, hoje, onPdf }, tituloRef) {
  const e = config.entrega!;
  const t = (x: Parameters<Motor["texto"]>[0]) => motor.texto(x, ctx, { hoje }).trim();
  const rotulo = t(e.rotulo);
  const titulo = t(e.titulo);
  const subtitulo = t(e.subtitulo);
  const fecho = t(e.fecho);
  const papelTopo = t(e.pdf?.cabecalho);
  const papelPe = t(e.pdf?.rodape);
  const logo = e.pdf?.logo ?? config.marca.logo;
  const comResumo = e.resumo !== false && !!config.resumo;
  const lista = e.cartoes === false ? [] : cartoes.filter((c) => c.naEntrega);
  // tokens da folha (só na impressão), por cima do neutro claro do núcleo
  const temaPapel = e.pdf?.tema
    ? `@media print{.cvt .cven{${Object.entries(e.pdf.tema)
        .filter(([k]) => /^--cv-[\w-]+$/.test(k))
        .map(([k, v]) => `${k}:${String(v).replace(/[;{}<>]/g, "")}`)
        .join(";")}}}`
    : "";

  return (
    <section className="cven" aria-labelledby="cven-titulo">
      {temaPapel && <style>{temaPapel}</style>}
      <div className="cven__papel-topo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo && <img src={logo.src} alt="" style={{ height: logo.altura ?? 22 }} />}
        {papelTopo && <span>{papelTopo}</span>}
      </div>

      <header className="cven__cabeca">
        <div className="cven__cabeca-texto">
          {rotulo && <p className="cven__rotulo">{rotulo}</p>}
          <h2 id="cven-titulo" className="cven__titulo" tabIndex={-1} ref={tituloRef}>
            {titulo}
          </h2>
          {subtitulo && <p className="cven__sub">{subtitulo}</p>}
        </div>
        <div className="cven__acoes">
          <button type="button" className="cven__pdf" onClick={onPdf}>
            <IconeBaixar />
            {e.botaoPdf}
          </button>
          {e.dicaPdf && <p className="cven__dica">{e.dicaPdf}</p>}
        </div>
      </header>

      <div className={`cven__grade${comResumo ? "" : " cven__grade--so-mapa"}`}>
        {mapa && (
          <div className="cven__mapa">
            <Mapa mapa={mapa} titulo={t(e.tituloMapa) || undefined} escalonado />
          </div>
        )}
        {comResumo && (
          <div className="cven__resumo">
            <Resumo config={config.resumo!} ctx={ctx} motor={motor} />
          </div>
        )}
      </div>

      {lista.length > 0 && (
        <div className={`cven__cartoes cven__cartoes--${Math.min(lista.length, 3)}`}>
          {lista.map((c) => (
            <Cartao key={c.id} cartao={c} estatico />
          ))}
        </div>
      )}

      {(fecho || e.link) && (
        <div className="cven__fim">
          {fecho && <p className="cven__fecho">{fecho}</p>}
          {e.link && (
            <a className="cven__link" href={e.link.href} target="_blank" rel="noopener noreferrer">
              {e.link.rotulo}
            </a>
          )}
        </div>
      )}

      {papelPe && (
        <p className="cven__papel-pe" aria-hidden="true">
          {papelPe}
        </p>
      )}
    </section>
  );
});

export default Entrega;
