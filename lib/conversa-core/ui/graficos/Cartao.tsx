"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { formatarNumero, type CartaoPronto, type LayoutCenaPronto, type VistaAntesDepois, type VistaBarras, type VistaCena, type VistaLinhaTempo, type VistaMedidor, type VistaNumero } from "../../cartoes";
import { corDaMarcaUsavel, corDominante } from "../../cor";

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
  const atual = useContagem(v.valor, animar && !v.fixo);
  const mostrado = v.fixo || atual === v.valor ? v.texto : formatarNumero(atual, v.formato, idioma);
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
      {v.regua && (
        <div className="cvc-n__regua" aria-hidden="true">
          {v.faixa && <span className="cvc-n__faixa" style={{ left: `${v.faixa.inicio}%`, width: `${Math.max(1.5, v.faixa.fim - v.faixa.inicio)}%` }} />}
          <span className="cvc-n__marca" style={{ left: `${v.marca}%` }} />
        </div>
      )}
      {v.regua && v.faixa && !v.fixo && (
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

// 13/11/2026: cena desenhada. O SVG é da config (conferido no núcleo, sem script nem
// link); os rótulos são HTML por cima, em % do desenho (o texto da pessoa nunca entra
// no SVG). Com `estreito`, a composição 4:3 aparece quando o cartão é estreito
// (container query) e a larga some. Logo e nome numa faixa no topo; logo que falha
// ao carregar cai no nome.
// 14/11/2026: a cor da marca pelo logo, no navegador (só quando o servidor não achou a cor no site).
// Lê os pixels num canvas pequeno; sem CORS no ícone o canvas fica "sujo" e cai no fallback, sem erro.
function useCorDoLogo(src: string | undefined, ativo: boolean): string | null {
  const [cor, setCor] = useState<string | null>(null);
  useEffect(() => {
    if (!ativo || !src || typeof window === "undefined") return;
    let vivo = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const n = 48;
        const c = document.createElement("canvas");
        c.width = n;
        c.height = n;
        const g = c.getContext("2d", { willReadFrequently: true });
        if (!g) return;
        g.drawImage(img, 0, 0, n, n);
        const hex = corDominante(g.getImageData(0, 0, n, n).data);
        const ok = hex ? corDaMarcaUsavel(hex) : null;
        if (vivo && ok) setCor(ok.hex);
      } catch {
        /* canvas sujo (ícone sem CORS): fica a cor do contexto */
      }
    };
    img.src = src;
    return () => {
      vivo = false;
    };
  }, [src, ativo]);
  return cor;
}

type PlacaProps = { logo: { src: string; alt: string } | null; nome?: string; aoFalhar: () => void };
function Placa({ l, p }: { l: LayoutCenaPronto; p: PlacaProps }) {
  if (!p.logo && !p.nome) return null;
  return (
    <span className={`cvc-cena__placa${p.logo ? "" : " cvc-cena__placa--nome"}`} style={{ left: `${l.placa.x}%`, top: `${l.placa.y}%` }}>
      {p.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.logo.src} alt={p.logo.alt || p.nome || ""} onError={p.aoFalhar} />
      ) : (
        p.nome
      )}
    </span>
  );
}

function LayoutCena({ l, classe, placa }: { l: LayoutCenaPronto; classe: string; placa?: PlacaProps }) {
  const anot = l.rotulos.filter((r) => r.tipo === "anotacao");
  return (
    <div className={`cvc-cena__layout ${classe}`}>
      <div className="cvc-cena__quadro" style={{ aspectRatio: String(l.proporcao) }}>
        <div className="cvc-cena__desenho" aria-hidden="true" dangerouslySetInnerHTML={{ __html: l.svg }} />
        {placa && <Placa l={l} p={placa} />}
        {l.rotulos.map((r, i) =>
          l.legenda && r.tipo === "anotacao" ? (
            // marcador numerado no desenho; a palavra vai na legenda embaixo
            <span key={`${i}-${r.texto}`} className={`cvc-cena__marcador${r.alerta ? " cvc-cena__marcador--alerta" : ""}`} style={{ left: `${r.x}%`, top: `${r.y}%`, "--i": i } as Var} aria-hidden="true">
              {anot.indexOf(r) + 1}
            </span>
          ) : (
            <span
              key={`${i}-${r.texto}`}
              className={`cvc-cena__rotulo cvc-cena__rotulo--${r.lado} cvc-cena__rotulo--${r.tipo}${r.alerta ? " cvc-cena__rotulo--alerta" : ""}`}
              style={{ left: `${r.x}%`, top: `${r.y}%`, "--i": i } as Var}
            >
              {r.texto}
            </span>
          )
        )}
      </div>
      {l.legenda && anot.length > 0 && (
        <ol className="cvc-cena__legenda">
          {anot.map((r, i) => (
            <li key={`${i}-${r.texto}`} className={r.alerta ? "cvc-cena__legenda-item cvc-cena__legenda-item--alerta" : "cvc-cena__legenda-item"} style={{ "--i": i } as Var}>
              <span className="cvc-cena__marcador cvc-cena__marcador--lista" aria-hidden="true">
                {i + 1}
              </span>
              {r.texto}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// 14/11/2026: sem `faixa`, logo e nome entram como placa dentro do desenho (posição `placa`), e os
// atos (hoje / onde quebra / o que isso causa) ficam em cartões embaixo. A cor da marca vem do
// servidor (site) ou do logo (canvas) e pinta a classe cs-ato--marca do SVG via --cs-marca.
function Cena({ v, estatico }: { v: VistaCena; estatico?: boolean }) {
  const [logoFalhou, setLogoFalhou] = useState(false);
  const comLogo = !!v.logo && !logoFalhou;
  const corLogo = useCorDoLogo(v.logo?.src, !v.cor && !!v.logo && !v.faixa && !estatico);
  const cor = v.cor ?? corLogo ?? undefined;
  const placa: PlacaProps | undefined = !v.faixa && (comLogo || v.nome) ? { logo: comLogo ? v.logo : null, nome: v.nome, aoFalhar: () => setLogoFalhou(true) } : undefined;
  const descricao = [v.descricao, ...v.atos.filter((a) => !a.vazio).map((a) => `${a.rotulo}: ${a.texto}`), ...v.rotulos.filter((r) => r.tipo === "anotacao").map((r) => r.texto)].join(". ");
  const estilo = cor ? ({ "--cs-marca": cor } as CSSProperties) : undefined;
  return (
    <div className={`cvc-cena${v.animacao && !estatico ? " cvc-cena--anima" : ""}`} role="img" aria-label={descricao} style={estilo}>
      {v.faixa && (
        <div className="cvc-cena__faixa">
          <span className="cvc-cena__marca">
            {comLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.logo!.src} alt={v.logo!.alt || v.nome || ""} onError={() => setLogoFalhou(true)} />
            ) : (
              v.nome && <span className="cvc-cena__nome">{v.nome}</span>
            )}
          </span>
          <span className="cvc-cena__faixa-texto">{v.faixa.texto}</span>
        </div>
      )}
      <LayoutCena l={v} classe={v.estreito ? "cvc-cena__quadro--largo" : ""} placa={placa} />
      {v.estreito && <LayoutCena l={v.estreito} classe="cvc-cena__quadro--estreito" placa={placa} />}
      {v.atos.length > 0 && (
        <div className="cvc-cena__atos">
          {v.atos.map((a, i) => (
            <div key={`${i}-${a.rotulo}`} className={`cvc-cena__ato cvc-cena__ato--${a.tom}${a.vazio ? " cvc-cena__ato--vazio" : ""}`} style={{ "--i": i } as Var}>
              <small>{a.rotulo}</small>
              <span>{a.vazio ? "…" : a.texto}</span>
            </div>
          ))}
        </div>
      )}
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
  else if (cartao.tipo === "cena") corpo = <Cena v={cartao.vista} estatico={estatico} />;
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
