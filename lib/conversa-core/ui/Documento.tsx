"use client";

import { forwardRef, useState } from "react";
import Resumo from "./Resumo";
import Mapa from "./graficos/Mapa";
import Cartao from "./graficos/Cartao";
import { resolverDocumento, type SecaoPronta } from "../documento";
import type { CartaoPronto } from "../cartoes";
import type { Motor } from "../motor";
import type { ConfigConversa, Contexto } from "../tipos";

// ==========================================================================
// conversa-core — 13/11/2026: o documento entregue no fim (config.entrega.documento).
// Capa "Preparado para a <empresa>" com o logo da empresa da pessoa (lido pelo
// e-mail; sem logo, o nome) e o da marca, depois as seções da config na ordem:
// mapa, cartões (inclusive os que só existem no documento), itens em duas
// colunas ("o que vocês precisam" → "como resolve"), texto, resumo. A seção com
// `novaPagina` começa numa folha nova no PDF (impressão do navegador, mesmo
// @media print do mapa liberado, ver tela.css). O papel da pessoa muda o PDF
// pelo `quando` das seções (ex.: a página pra diretoria).
// ==========================================================================

type Props = {
  config: ConfigConversa;
  motor: Motor;
  ctx: Contexto;
  cartoes: CartaoPronto[];
  hoje: string;
  onPdf?: () => void;
  // admin: reconstrução sem o botão (o botão do admin fica fora)
  semAcoes?: boolean;
};

function IconeBaixar() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M10 3.5v9M5.8 8.6 10 12.8l4.2-4.2M4 16.2h12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoCliente({ src, alt, nome }: { src?: string; alt?: string; nome?: string }) {
  const [falhou, setFalhou] = useState(false);
  if (src && !falhou) {
    return (
      <span className="cvd__logo-cliente">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || nome || ""} onError={() => setFalhou(true)} />
      </span>
    );
  }
  return nome ? <span className="cvd__nome-cliente">{nome}</span> : null;
}

function Secao({ s, config, motor, ctx }: { s: SecaoPronta; config: ConfigConversa; motor: Motor; ctx: Contexto }) {
  const classe = `cvd__secao cvd__secao--${s.tipo}${s.novaPagina ? " cvd__secao--pagina" : ""}${s.destaque ? " cvd__secao--destaque" : ""}`;
  return (
    <section className={classe} data-secao={s.id}>
      {(s.rotulo || s.titulo) && (
        <header className="cvd__secao-cabeca">
          {s.rotulo && <p className="cvd__rotulo">{s.rotulo}</p>}
          {s.titulo && <h3 className="cvd__titulo">{s.titulo}</h3>}
        </header>
      )}
      {s.texto && <p className="cvd__texto">{s.texto}</p>}
      {s.paragrafos.map((p, i) => (
        <p key={i} className="cvd__texto">
          {p}
        </p>
      ))}
      {s.tipo === "mapa" &&
        (() => {
          const m = motor.mapaVisual(ctx);
          return m ? <Mapa mapa={m} escalonado /> : null;
        })()}
      {s.tipo === "resumo" && config.resumo && <Resumo config={config.resumo} ctx={ctx} motor={motor} />}
      {s.tipo === "cartoes" && (
        <div className={`cvd__cartoes cvd__cartoes--${Math.min(s.cartoes.length, 2)}`}>
          {s.cartoes.map((c) => (
            <Cartao key={c.id} cartao={c} estatico />
          ))}
        </div>
      )}
      {s.tipo === "itens" &&
        (s.colunas ? (
          <div className="cvd__tabela" role="table" aria-label={s.titulo}>
            <div className="cvd__linha cvd__linha--cabeca" role="row">
              <span role="columnheader">{s.colunas[0]}</span>
              <span role="columnheader">{s.colunas[1]}</span>
            </div>
            {s.itens.map((it, i) => (
              <div key={i} className="cvd__linha" role="row">
                <strong role="cell">{it.titulo}</strong>
                <span role="cell">
                  {it.texto}
                  {it.nota && <small className="cvd__nota">{it.nota}</small>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <dl className="cvd__lista">
            {s.itens.map((it, i) => (
              <div key={i} className="cvd__item">
                <dt>{it.titulo}</dt>
                {it.texto && <dd>{it.texto}</dd>}
                {it.nota && <dd className="cvd__nota">{it.nota}</dd>}
              </div>
            ))}
          </dl>
        ))}
    </section>
  );
}

const Documento = forwardRef<HTMLHeadingElement, Props>(function Documento({ config, motor, ctx, cartoes, hoje, onPdf, semAcoes }, tituloRef) {
  const e = config.entrega!;
  const extras = { hoje };
  const doc = resolverDocumento(config, ctx, motor.resolvedor(ctx), cartoes, extras);
  if (!doc) return null;
  const t = (x: Parameters<Motor["texto"]>[0]) => motor.texto(x, ctx, extras).trim();
  const rotulo = t(e.rotulo);
  const titulo = doc.preparadoPara ?? t(e.titulo);
  const subtitulo = t(e.subtitulo);
  const papelTopo = t(e.pdf?.cabecalho);
  const papelPe = t(e.pdf?.rodape);
  const logoTela = config.marca.logo;
  const logoPapel = e.pdf?.logo ?? config.marca.logo;
  const temaPapel = e.pdf?.tema
    ? `@media print{.cvt .cven{${Object.entries(e.pdf.tema)
        .filter(([k]) => /^--cv-[\w-]+$/.test(k))
        .map(([k, v]) => `${k}:${String(v).replace(/[;{}<>]/g, "")}`)
        .join(";")}}}`
    : "";

  return (
    <section className="cven cven--doc" aria-labelledby="cven-titulo">
      {temaPapel && <style>{temaPapel}</style>}
      {/* no papel, só a linha do topo: os logos já estão na capa */}
      <div className="cven__papel-topo cven__papel-topo--so-texto" aria-hidden="true">
        {papelTopo && <span>{papelTopo}</span>}
      </div>

      <header className="cvd__capa">
        <div className="cvd__logos">
          {(doc.cliente.logo || doc.cliente.nome) && <LogoCliente src={doc.cliente.logo?.src} alt={doc.cliente.logo?.alt} nome={doc.cliente.nome} />}
          {(doc.cliente.logo || doc.cliente.nome) && logoTela && <span className="cvd__e" aria-hidden="true" />}
          {logoTela && (
            <span className="cvd__logo-marca">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cvd__logo-tela" src={logoTela.src} alt={logoTela.alt} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logoPapel && <img className="cvd__logo-papel" src={logoPapel.src} alt="" aria-hidden="true" />}
            </span>
          )}
        </div>
        <div className="cven__cabeca">
          <div className="cven__cabeca-texto">
            {rotulo && <p className="cven__rotulo">{rotulo}</p>}
            <h2 id="cven-titulo" className="cven__titulo" tabIndex={-1} ref={tituloRef}>
              {titulo}
            </h2>
            {subtitulo && <p className="cven__sub">{subtitulo}</p>}
          </div>
          {!semAcoes && onPdf && (
            <div className="cven__acoes">
              <button type="button" className="cven__pdf" onClick={onPdf}>
                <IconeBaixar />
                {e.botaoPdf}
              </button>
              {e.dicaPdf && <p className="cven__dica">{e.dicaPdf}</p>}
            </div>
          )}
        </div>
      </header>

      {doc.secoes.map((s) => (
        <Secao key={s.id} s={s} config={config} motor={motor} ctx={ctx} />
      ))}

      {(t(e.fecho) || e.link) && (
        <div className="cven__fim">
          {t(e.fecho) && <p className="cven__fecho">{t(e.fecho)}</p>}
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

export default Documento;
